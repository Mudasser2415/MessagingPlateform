using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class ClientConfiguration : IEntityTypeConfiguration<Client>
    {
        public void Configure(EntityTypeBuilder<Client> builder)
        {
            builder.HasKey(c => c.Id);

            builder.Property(c => c.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(c => c.MobileNumber)
                .IsRequired()
                .HasMaxLength(20);

            builder.HasIndex(c => c.MobileNumber)
                .HasDatabaseName("IX_Clients_MobileNumber");

            builder.HasIndex(c => c.CreatedByUserId)
                .HasDatabaseName("IX_Clients_CreatedByUserId");

            builder.Property(c => c.Address)
                .HasMaxLength(250);

            builder.Property(c => c.Location)
                .HasMaxLength(100);

            builder.Property(c => c.BusinessType)
                .HasMaxLength(50);

            builder.Property(c => c.EmailId)
                .HasMaxLength(256);

            builder.Property(c => c.Password)
                .HasMaxLength(200);

            builder.Property(c => c.AvailableCredits)
                .IsRequired()
                .HasDefaultValue(0);

            builder.Property(c => c.RowVersion)
                .IsRowVersion()
                .IsConcurrencyToken();

            builder.Property(c => c.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            builder.HasOne(c => c.Partner)
                .WithMany(p => p.Clients)
                .HasForeignKey(c => c.PartnerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(c => c.CreatedBy)
                .WithMany(user => user.CreatedClients)
                .HasForeignKey(c => c.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(c => c.CreditTransactions)
                .WithOne(transaction => transaction.Client)
                .HasForeignKey(transaction => transaction.ClientId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.ToTable("Clients");
        }
    }
}
