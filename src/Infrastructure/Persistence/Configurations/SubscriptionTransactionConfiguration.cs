using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class SubscriptionTransactionConfiguration : IEntityTypeConfiguration<SubscriptionTransaction>
    {
        public void Configure(EntityTypeBuilder<SubscriptionTransaction> builder)
        {
            builder.HasKey(t => t.Id);

            builder.HasIndex(t => t.ClientSubscriptionId)
                .HasDatabaseName("IX_SubscriptionTransactions_ClientSubscriptionId");

            builder.Property(t => t.Amount)
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            builder.Property(t => t.PaymentStatus)
                .IsRequired();

            builder.Property(t => t.PaymentMethod)
                .IsRequired();

            builder.Property(t => t.TransactionReference)
                .HasMaxLength(200);

            builder.Property(t => t.CreatedAt)
                .IsRequired();
        }
    }
}
