using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class ClientEmployeeMappingConfiguration : IEntityTypeConfiguration<ClientEmployeeMapping>
    {
        public void Configure(EntityTypeBuilder<ClientEmployeeMapping> builder)
        {
            builder.HasKey(mapping => mapping.Id);

            builder.Property(mapping => mapping.Id)
                .ValueGeneratedOnAdd();

            builder.Property(mapping => mapping.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            builder.HasIndex(mapping => new { mapping.ClientId, mapping.UserId })
                .IsUnique()
                .HasDatabaseName("UX_ClientEmployeeMappings_ClientId_UserId");

            builder.HasIndex(mapping => mapping.ClientId)
                .HasDatabaseName("IX_ClientEmployeeMappings_ClientId");

            builder.HasIndex(mapping => mapping.UserId)
                .HasDatabaseName("IX_ClientEmployeeMappings_UserId");

            builder.HasOne(mapping => mapping.Client)
                .WithMany(client => client.ClientEmployeeMappings)
                .HasForeignKey(mapping => mapping.ClientId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(mapping => mapping.User)
                .WithMany(user => user.ClientEmployeeMappings)
                .HasForeignKey(mapping => mapping.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.ToTable("ClientEmployeeMappings");
        }
    }
}