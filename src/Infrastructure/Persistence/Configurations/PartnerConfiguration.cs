using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class PartnerConfiguration : IEntityTypeConfiguration<Partner>
    {
        public void Configure(EntityTypeBuilder<Partner> builder)
        {
            builder.HasKey(p => p.Id);

            builder.Property(p => p.Id)
                .ValueGeneratedOnAdd();

            builder.Property(p => p.CompanyName)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(p => p.CompanyAddress)
                .HasMaxLength(500);

            builder.Property(p => p.IsActive)
                .IsRequired()
                .HasDefaultValue(true);

            builder.Property(p => p.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(p => p.UpdatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            builder.HasIndex(p => p.UserId)
                .IsUnique()
                .HasDatabaseName("IX_Partners_UserId_Unique");

            builder.HasIndex(p => p.CompanyName)
                .HasDatabaseName("IX_Partners_CompanyName");

            builder.HasIndex(p => p.CreatedByUserId)
                .HasDatabaseName("IX_Partners_CreatedByUserId");

            builder.HasOne(p => p.User)
                .WithOne(u => u.Partner)
                .HasForeignKey<Partner>(p => p.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(p => p.CreatedBy)
                .WithMany(u => u.CreatedPartners)
                .HasForeignKey(p => p.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(p => p.Clients)
                .WithOne(c => c.Partner)
                .HasForeignKey(c => c.PartnerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.ToTable("Partners");
        }
    }
}