using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class CreditTransactionConfiguration : IEntityTypeConfiguration<CreditTransaction>
    {
        public void Configure(EntityTypeBuilder<CreditTransaction> builder)
        {
            builder.HasKey(transaction => transaction.Id);

            builder.Property(transaction => transaction.Type)
                .HasConversion(
                    value => value.ToString(),
                    value => Enum.Parse<CreditTransactionType>(value))
                .HasMaxLength(20)
                .IsRequired();

            builder.Property(transaction => transaction.Amount)
                .IsRequired();

            builder.Property(transaction => transaction.BalanceAfter)
                .IsRequired();

            builder.Property(transaction => transaction.Reference)
                .HasMaxLength(200)
                .IsRequired();

            builder.Property(transaction => transaction.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            builder.HasIndex(transaction => transaction.ClientId)
                .HasDatabaseName("IX_CreditTransactions_ClientId");

            builder.ToTable("CreditTransactions");
        }
    }
}