using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class MessageConfiguration : IEntityTypeConfiguration<Message>
    {
        public void Configure(EntityTypeBuilder<Message> builder)
        {
            builder.HasKey(m => m.Id);

            builder.HasIndex(m => new { m.ClientId, m.CreatedAt })
                .HasDatabaseName("IX_Messages_ClientId_CreatedAt");

            builder.HasIndex(m => new { m.Status, m.CreatedAt })
                .HasDatabaseName("IX_Messages_Status_CreatedAt");

            builder.Property(m => m.PhoneNumber)
                .IsRequired()
                .HasMaxLength(20);

            builder.Property(m => m.MessageContent)
                .IsRequired();

            builder.Property(m => m.Status)
                .IsRequired()
                .HasMaxLength(20);

            builder.Property(m => m.RetryCount)
                .IsRequired()
                .HasDefaultValue(0);

            builder.Property(m => m.ErrorMessage)
                .HasMaxLength(1000)
                .IsRequired(false);

            builder.HasOne(m => m.Client)
                .WithMany()
                .HasForeignKey(m => m.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(m => m.Template)
                .WithMany()
                .HasForeignKey(m => m.TemplateId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(m => m.Group)
                .WithMany()
                .HasForeignKey(m => m.GroupId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
