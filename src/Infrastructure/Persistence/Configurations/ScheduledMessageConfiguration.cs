using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class ScheduledMessageConfiguration : IEntityTypeConfiguration<ScheduledMessage>
    {
        public void Configure(EntityTypeBuilder<ScheduledMessage> builder)
        {
            builder.HasKey(s => s.Id);

            builder.HasIndex(s => s.ScheduledAt)
                .HasDatabaseName("IX_ScheduledMessages_ScheduledAt");

            builder.HasIndex(s => s.Status)
                .HasDatabaseName("IX_ScheduledMessages_Status");

            builder.HasIndex(s => new { s.ClientId, s.Status })
                .HasDatabaseName("IX_ScheduledMessages_ClientId_Status");

            builder.Property(s => s.Status)
                .IsRequired()
                .HasConversion<int>();

            builder.Property(s => s.PhoneNumber)
                .HasMaxLength(20)
                .IsRequired(false);

            builder.Property(s => s.HangfireJobId)
                .HasMaxLength(100)
                .IsRequired(false);

            builder.Property(s => s.ErrorMessage)
                .HasMaxLength(1000)
                .IsRequired(false);

            builder.Property(s => s.CreatedByUserId)
                .HasMaxLength(100)
                .IsRequired(false);

            builder.Property(s => s.RetryCount)
                .IsRequired()
                .HasDefaultValue(0);

            builder.HasOne(s => s.Client)
                .WithMany()
                .HasForeignKey(s => s.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(s => s.Template)
                .WithMany()
                .HasForeignKey(s => s.TemplateId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(s => s.Group)
                .WithMany()
                .HasForeignKey(s => s.GroupId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);
        }
    }
}
