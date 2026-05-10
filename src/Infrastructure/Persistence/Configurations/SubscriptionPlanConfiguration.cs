using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class SubscriptionPlanConfiguration : IEntityTypeConfiguration<SubscriptionPlan>
    {
        public void Configure(EntityTypeBuilder<SubscriptionPlan> builder)
        {
            builder.HasKey(p => p.Id);

            builder.Property(p => p.PlanName)
                .IsRequired()
                .HasMaxLength(100);

            builder.HasIndex(p => p.PlanName)
                .HasDatabaseName("IX_SubscriptionPlans_PlanName");

            builder.Property(p => p.Description)
                .HasMaxLength(500);

            builder.Property(p => p.DurationType)
                .IsRequired();

            builder.Property(p => p.DurationInDays)
                .IsRequired();

            builder.Property(p => p.Price)
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            builder.Property(p => p.IncludedCredits)
                .IsRequired()
                .HasDefaultValue(0);

            builder.Property(p => p.GracePeriodDays)
                .IsRequired()
                .HasDefaultValue(0);

            builder.Property(p => p.IsActive)
                .IsRequired()
                .HasDefaultValue(true);

            builder.Property(p => p.CreatedAt)
                .IsRequired();

            builder.Property(p => p.CreatedBy)
                .HasMaxLength(100);

            builder.HasMany(p => p.ClientSubscriptions)
                .WithOne(s => s.SubscriptionPlan)
                .HasForeignKey(s => s.SubscriptionPlanId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
