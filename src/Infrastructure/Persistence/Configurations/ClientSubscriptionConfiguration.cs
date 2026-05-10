using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class ClientSubscriptionConfiguration : IEntityTypeConfiguration<ClientSubscription>
    {
        public void Configure(EntityTypeBuilder<ClientSubscription> builder)
        {
            builder.HasKey(s => s.Id);

            builder.HasIndex(s => s.ClientId)
                .HasDatabaseName("IX_ClientSubscriptions_ClientId");

            builder.HasIndex(s => new { s.Status, s.EndDate })
                .HasDatabaseName("IX_ClientSubscriptions_Status_EndDate");

            builder.Property(s => s.Status)
                .IsRequired();

            builder.Property(s => s.TotalCreditsAllocated)
                .IsRequired()
                .HasDefaultValue(0);

            builder.Property(s => s.RemainingCredits)
                .IsRequired()
                .HasDefaultValue(0);

            builder.Property(s => s.CreatedAt)
                .IsRequired();

            builder.Property(s => s.CreatedBy)
                .HasMaxLength(100);

            builder.HasOne(s => s.Client)
                .WithMany()
                .HasForeignKey(s => s.ClientId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(s => s.Transactions)
                .WithOne(t => t.ClientSubscription)
                .HasForeignKey(t => t.ClientSubscriptionId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
