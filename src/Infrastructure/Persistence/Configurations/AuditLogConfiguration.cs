using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
    {
        public void Configure(EntityTypeBuilder<AuditLog> builder)
        {
            builder.HasKey(a => a.Id);

            builder.Property(a => a.EntityName)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(a => a.Action)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(a => a.OldValues)
                .HasColumnType("nvarchar(max)");

            builder.Property(a => a.NewValues)
                .HasColumnType("nvarchar(max)");

            builder.Property(a => a.PerformedByName)
                .IsRequired()
                .HasMaxLength(256);

            builder.Property(a => a.IpAddress)
                .HasMaxLength(64);

            builder.Property(a => a.Timestamp)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            builder.HasIndex(a => a.EntityName)
                .HasDatabaseName("IX_AuditLogs_EntityName");

            builder.HasIndex(a => a.Timestamp)
                .HasDatabaseName("IX_AuditLogs_Timestamp");

            builder.HasIndex(a => a.PerformedBy)
                .HasDatabaseName("IX_AuditLogs_PerformedBy");

            builder.ToTable("AuditLogs");
        }
    }
}