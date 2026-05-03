using System.Reflection;
using Application.Common.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Infrastructure.Persistence
{
    public class ApplicationDbContext : DbContext, IApplicationDbContext
    {
        private static readonly JsonSerializerOptions AuditJsonOptions = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DictionaryKeyPolicy = JsonNamingPolicy.CamelCase
        };

        private static readonly HashSet<Type> AuditedEntityTypes =
        [
            typeof(Client),
            typeof(Group),
            typeof(Partner),
            typeof(Template),
            typeof(User)
        ];

        private static readonly HashSet<string> RedactedPropertyNames =
        [
            nameof(Client.Password),
            nameof(User.PasswordHash)
        ];

        private readonly ICurrentRequestContext _currentRequestContext;

        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options,
            ICurrentRequestContext currentRequestContext) : base(options)
        {
            _currentRequestContext = currentRequestContext;
        }

        public DbSet<Admin> Admins { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Partner> Partners { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<CreditTransaction> CreditTransactions { get; set; }
        public DbSet<ClientEmployeeMapping> ClientEmployeeMappings { get; set; }
        public DbSet<Template> Templates { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<GroupMember> GroupMembers { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<ScheduledMessage> ScheduledMessages { get; set; }





        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
            base.OnModelCreating(builder);
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            ChangeTracker.DetectChanges();

            var pendingAuditEntries = BuildAuditEntries();

            var result = await base.SaveChangesAsync(cancellationToken);

            if (pendingAuditEntries.Count == 0)
            {
                return result;
            }

            foreach (var auditEntry in pendingAuditEntries.Where(entry => entry.HasTemporaryProperties))
            {
                auditEntry.ResolveTemporaryProperties();
            }

            if (pendingAuditEntries.Any())
            {
                AuditLogs.AddRange(pendingAuditEntries.Select(entry => entry.ToAuditLog()));
                await base.SaveChangesAsync(cancellationToken);
            }

            return result;
        }

        private List<PendingAuditLog> BuildAuditEntries()
        {
            var auditEntries = new List<PendingAuditLog>();

            foreach (var entry in ChangeTracker.Entries())
            {
                if (entry.Entity is AuditLog ||
                    entry.State is EntityState.Detached or EntityState.Unchanged ||
                    !AuditedEntityTypes.Contains(entry.Entity.GetType()))
                {
                    continue;
                }

                var auditEntry = new PendingAuditLog(entry, _currentRequestContext);

                foreach (var property in entry.Properties)
                {
                    if (property.Metadata.IsShadowProperty())
                    {
                        continue;
                    }

                    if (property.Metadata.IsPrimaryKey())
                    {
                        auditEntry.SetEntityId(property);
                        continue;
                    }

                    if (property.IsTemporary)
                    {
                        auditEntry.TemporaryProperties.Add(property);
                        continue;
                    }

                    switch (entry.State)
                    {
                        case EntityState.Added:
                            auditEntry.Action = "Create";
                            auditEntry.NewValues[property.Metadata.Name] = SanitizeValue(property.Metadata.Name, property.CurrentValue);
                            break;
                        case EntityState.Deleted:
                            auditEntry.Action = "Delete";
                            auditEntry.OldValues[property.Metadata.Name] = SanitizeValue(property.Metadata.Name, property.OriginalValue);
                            break;
                        case EntityState.Modified when property.IsModified && !Equals(property.OriginalValue, property.CurrentValue):
                            auditEntry.Action = "Update";
                            auditEntry.OldValues[property.Metadata.Name] = SanitizeValue(property.Metadata.Name, property.OriginalValue);
                            auditEntry.NewValues[property.Metadata.Name] = SanitizeValue(property.Metadata.Name, property.CurrentValue);
                            break;
                    }
                }

                if (!auditEntry.ShouldPersist)
                {
                    continue;
                }

                auditEntries.Add(auditEntry);
            }

            return auditEntries;
        }

        private static object? SanitizeValue(string propertyName, object? value)
        {
            if (RedactedPropertyNames.Contains(propertyName))
            {
                return "[REDACTED]";
            }

            return value;
        }

        private sealed class PendingAuditLog
        {
            private readonly EntityEntry _entry;

            public PendingAuditLog(EntityEntry entry, ICurrentRequestContext currentRequestContext)
            {
                _entry = entry;
                EntityName = entry.Metadata.ClrType.Name;
                Timestamp = DateTime.UtcNow;
                PerformedBy = currentRequestContext.UserId;
                PerformedByName = currentRequestContext.UserName;
                IpAddress = currentRequestContext.IpAddress;
            }

            public string EntityName { get; }
            public Guid EntityId { get; private set; }
            public string Action { get; set; } = string.Empty;
            public Dictionary<string, object?> OldValues { get; } = new();
            public Dictionary<string, object?> NewValues { get; } = new();
            public Guid? PerformedBy { get; }
            public string PerformedByName { get; }
            public DateTime Timestamp { get; }
            public string? IpAddress { get; }
            public List<PropertyEntry> TemporaryProperties { get; } = new();

            public bool HasTemporaryProperties => TemporaryProperties.Count > 0;

            public bool ShouldPersist =>
                !string.IsNullOrWhiteSpace(Action) &&
                (OldValues.Count > 0 || NewValues.Count > 0 || HasTemporaryProperties);

            public void SetEntityId(PropertyEntry property)
            {
                if (property.IsTemporary)
                {
                    TemporaryProperties.Add(property);
                    return;
                }

                EntityId = ConvertToGuid(property.CurrentValue);
            }

            public void ResolveTemporaryProperties()
            {
                foreach (var property in TemporaryProperties)
                {
                    if (property.Metadata.IsPrimaryKey())
                    {
                        EntityId = ConvertToGuid(property.CurrentValue);
                    }
                }
            }

            public AuditLog ToAuditLog()
            {
                return new AuditLog
                {
                    Id = Guid.NewGuid(),
                    EntityName = EntityName,
                    EntityId = EntityId,
                    Action = Action,
                    OldValues = OldValues.Count == 0 ? null : JsonSerializer.Serialize(OldValues, AuditJsonOptions),
                    NewValues = NewValues.Count == 0 ? null : JsonSerializer.Serialize(NewValues, AuditJsonOptions),
                    PerformedBy = PerformedBy,
                    PerformedByName = string.IsNullOrWhiteSpace(PerformedByName) ? "System" : PerformedByName,
                    Timestamp = Timestamp,
                    IpAddress = IpAddress
                };
            }

            private static Guid ConvertToGuid(object? value)
            {
                return value switch
                {
                    Guid guid => guid,
                    string text when Guid.TryParse(text, out var guid) => guid,
                    _ => Guid.Empty
                };
            }
        }
    }
}
