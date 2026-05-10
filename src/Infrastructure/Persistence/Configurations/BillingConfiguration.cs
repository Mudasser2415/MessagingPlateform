using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class BillingConfiguration : IEntityTypeConfiguration<Billing>
    {
        public void Configure(EntityTypeBuilder<Billing> builder)
        {
            builder.HasKey(b => b.Id);

            builder.Property(b => b.BillingNumber)
                .IsRequired()
                .HasMaxLength(30);

            builder.HasIndex(b => b.BillingNumber)
                .IsUnique()
                .HasDatabaseName("UX_Billings_BillingNumber");

            builder.HasIndex(b => b.QuotationId)
                .IsUnique()
                .HasDatabaseName("UX_Billings_QuotationId"); // one billing per quotation

            builder.HasIndex(b => b.ClientId)
                .HasDatabaseName("IX_Billings_ClientId");

            builder.HasIndex(b => b.PaymentStatus)
                .HasDatabaseName("IX_Billings_PaymentStatus");

            builder.Property(b => b.TotalAmount)
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            builder.Property(b => b.PaidAmount)
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            builder.Property(b => b.Notes)
                .HasMaxLength(1000);

            builder.Property(b => b.CreatedBy)
                .HasMaxLength(200);

            builder.Property(b => b.VerifiedBy)
                .HasMaxLength(200);

            builder.Property(b => b.CreatedAt)
                .IsRequired();

            // Quotation → Billing: restrict so deleting a quotation with a billing is blocked
            builder.HasOne(b => b.Quotation)
                .WithOne(q => q.Billing)
                .HasForeignKey<Billing>(b => b.QuotationId)
                .OnDelete(DeleteBehavior.Restrict);

            // Client → Billings: cascade
            builder.HasOne(b => b.Client)
                .WithMany()
                .HasForeignKey(b => b.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.ToTable("Billings");
        }
    }
}
