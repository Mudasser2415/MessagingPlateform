using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class QuotationConfiguration : IEntityTypeConfiguration<Quotation>
    {
        public void Configure(EntityTypeBuilder<Quotation> builder)
        {
            builder.HasKey(q => q.Id);

            builder.Property(q => q.QuotationNumber)
                .IsRequired()
                .HasMaxLength(30);

            builder.HasIndex(q => q.QuotationNumber)
                .IsUnique()
                .HasDatabaseName("IX_Quotations_QuotationNumber");

            builder.HasIndex(q => q.ClientId)
                .HasDatabaseName("IX_Quotations_ClientId");

            builder.HasIndex(q => q.Status)
                .HasDatabaseName("IX_Quotations_Status");

            builder.HasIndex(q => q.ValidTo)
                .HasDatabaseName("IX_Quotations_ValidTo");

            builder.Property(q => q.OriginalPrice)
                .IsRequired()
                .HasColumnType("decimal(18,2)");

            builder.Property(q => q.DiscountAmount)
                .IsRequired()
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18,2)");

            builder.Property(q => q.FinalPrice)
                .IsRequired()
                .HasColumnType("decimal(18,2)");

            builder.Property(q => q.IncludedCredits)
                .IsRequired()
                .HasDefaultValue(0);

            builder.Property(q => q.Status)
                .IsRequired()
                .HasConversion<int>();

            builder.Property(q => q.Notes)
                .HasMaxLength(1000);

            builder.Property(q => q.CreatedBy)
                .HasMaxLength(100);

            builder.Property(q => q.CreatedAt)
                .IsRequired();

            builder.HasOne(q => q.Client)
                .WithMany()
                .HasForeignKey(q => q.ClientId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(q => q.SubscriptionPlan)
                .WithMany(p => p.Quotations)
                .HasForeignKey(q => q.SubscriptionPlanId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
