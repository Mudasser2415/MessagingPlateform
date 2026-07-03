using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class SavedMessageConfiguration : IEntityTypeConfiguration<SavedMessage>
    {
        public void Configure(EntityTypeBuilder<SavedMessage> builder)
        {
            builder.HasKey(x => x.Id);

            builder.HasIndex(x => new { x.ClientId, x.CreatedAt })
                .HasDatabaseName("IX_SavedMessages_ClientId_CreatedAt");

            builder.Property(x => x.PhoneNumber)
                .IsRequired()
                .HasMaxLength(20);

            builder.Property(x => x.MessageContent)
                .IsRequired();

            builder.Property(x => x.CreatedAt)
                .IsRequired();

            builder.HasOne(x => x.Client)
                .WithMany()
                .HasForeignKey(x => x.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Template)
                .WithMany()
                .HasForeignKey(x => x.TemplateId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Group)
                .WithMany()
                .HasForeignKey(x => x.GroupId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
