using API.Middleware;
using Application.Common.Behaviors;
using Application.Common.Interfaces;
using Application.Common.Services;
using Application.Mappings;
using FluentValidation;
using Hangfire;
using Hangfire.SqlServer;
using Infrastructure.Configuration;
using Infrastructure.Persistence;
using Infrastructure.Services;
using Infrastructure.Workers;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using Serilog.Events;
using System.Text;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, services, configuration) =>
    configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext()
        .Enrich.WithMachineName()
        .Enrich.WithThreadId());

// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();

builder.Services.AddHealthChecks();

var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>()
    ?.Where(origin => !string.IsNullOrWhiteSpace(origin))
    .ToArray()
    ?? ["http://localhost:3000"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// JWT Configuration
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"] ?? throw new InvalidOperationException("JWT Key not configured"));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();
builder.Services.AddHttpContextAccessor();

// Infrastructure - DbContext setup
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection") ?? "Server=(localdb)\\mssqllocaldb;Database=MessagingPlatform;Trusted_Connection=True;MultipleActiveResultSets=true",
        b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

builder.Services.AddScoped<Application.Common.Interfaces.IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());
builder.Services.AddScoped<Application.Common.Interfaces.ICurrentRequestContext, CurrentRequestContext>();

// Application services
builder.Services.AddScoped<IPhoneValidationService, PhoneValidationService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPasswordService, PasswordService>();
builder.Services.AddScoped<ITokenService, JwtTokenService>();

// RabbitMQ + WhatsApp settings
builder.Services.Configure<RabbitMqSettings>(builder.Configuration.GetSection("RabbitMq"));
builder.Services.Configure<WhatsAppSettings>(builder.Configuration.GetSection("WhatsApp"));

// Named HttpClient for WhatsApp service
builder.Services.AddHttpClient("WhatsApp", client =>
{
    client.BaseAddress = new Uri(
        builder.Configuration["WhatsApp:BaseUrl"] ?? "http://localhost:3000");
    client.Timeout = TimeSpan.FromSeconds(
        int.TryParse(builder.Configuration["WhatsApp:TimeoutSeconds"], out var t) ? t : 30);
});

// Messaging infrastructure services
builder.Services.AddSingleton<IMessageQueuePublisher, RabbitMqMessageQueuePublisher>();
builder.Services.AddSingleton<IWhatsAppService, WhatsAppHttpService>();
builder.Services.AddHostedService<MessageProcessingWorker>();

// Hangfire — scheduled messaging
var hangfireConnection = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Server=(localdb)\\mssqllocaldb;Database=MessagingPlatform;Trusted_Connection=True;";

builder.Services.AddHangfire(config => config
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseSqlServerStorage(hangfireConnection, new SqlServerStorageOptions
    {
        CommandBatchMaxTimeout = TimeSpan.FromMinutes(5),
        SlidingInvisibilityTimeout = TimeSpan.FromMinutes(5),
        QueuePollInterval = TimeSpan.FromSeconds(15),
        UseRecommendedIsolationLevel = true,
        DisableGlobalLocks = true,
    }));

builder.Services.AddHangfireServer(options =>
{
    options.WorkerCount = Environment.ProcessorCount * 2;
    options.Queues = ["default"];
});

builder.Services.AddScoped<IScheduledMessageProcessor, ScheduledMessageProcessor>();
builder.Services.AddScoped<IJobScheduler, HangfireJobScheduler>();

// Application layer configurations
var applicationAssembly = typeof(MappingProfile).Assembly;
builder.Services.AddAutoMapper(cfg => cfg.AddMaps(applicationAssembly));
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(applicationAssembly);
    cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
});
builder.Services.AddValidatorsFromAssembly(applicationAssembly);

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.Migrate();
}

// Configure the HTTP request pipeline.
app.UseMiddleware<CorrelationIdMiddleware>();

app.UseSerilogRequestLogging(options =>
{
    options.MessageTemplate = "Handled {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";
    options.GetLevel = (httpContext, _, exception) =>
    {
        if (exception != null || httpContext.Response.StatusCode >= StatusCodes.Status500InternalServerError)
        {
            return LogEventLevel.Error;
        }

        if (httpContext.Response.StatusCode >= StatusCodes.Status400BadRequest)
        {
            return LogEventLevel.Warning;
        }

        return LogEventLevel.Information;
    };

    options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
    {
        diagnosticContext.Set("RequestHost", httpContext.Request.Host.Value ?? string.Empty);
        diagnosticContext.Set("RequestScheme", httpContext.Request.Scheme);
        diagnosticContext.Set("TraceId", httpContext.TraceIdentifier);
        diagnosticContext.Set(
            "CorrelationId",
            httpContext.Items.TryGetValue(CorrelationIdMiddleware.ItemKey, out var correlationId)
                ? correlationId?.ToString() ?? string.Empty
                : httpContext.TraceIdentifier);

        var userId = httpContext.User.FindFirst("userId")?.Value;
        if (!string.IsNullOrWhiteSpace(userId))
        {
            diagnosticContext.Set("UserId", userId!);
        }
    };
});

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();

}

app.UseCors("AllowReactApp");

// app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

// Hangfire dashboard — restrict to local in production
app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = [],   // Open in dev; add IDashboardAuthorizationFilter for production
    IgnoreAntiforgeryToken = true,
});

app.MapHealthChecks("/healthz");
app.MapControllers();

app.Logger.LogInformation("Starting MessagePlatform API in {Environment}", app.Environment.EnvironmentName);
app.Run();
}
catch (Exception exception)
{
    Log.Fatal(exception, "MessagePlatform API terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
