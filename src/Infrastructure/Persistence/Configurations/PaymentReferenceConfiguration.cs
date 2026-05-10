using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class PaymentReferenceConfiguration : IEntityTypeConfiguration<PaymentReference>
    {
        public void Configure(EntityTypeBuilder<PaymentReference> builder)
        {
            builder.HasKey(p => p.Id);

            builder.HasIndex(p => p.BillingId)
                .HasDatabaseName("IX_PaymentReferences_BillingId");

            builder.Property(p => p.FileName)
                .IsRequired()
                .HasMaxLength(260);

            builder.Property(p => p.FileUrl)
                .IsRequired()
                .HasMaxLength(500);

            builder.Property(p => p.FileType)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(p => p.UploadedBy)
                .HasMaxLength(200);

            builder.Property(p => p.UploadedAt)
                .IsRequired();

            builder.HasOne(p => p.Billing)
                .WithMany(b => b.PaymentReferences)
                .HasForeignKey(p => p.BillingId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.ToTable("PaymentReferences");
        }
    }
}
