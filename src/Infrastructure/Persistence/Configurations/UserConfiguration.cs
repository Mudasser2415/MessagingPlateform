using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            // Primary Key
            builder.HasKey(u => u.Id);

            // Properties
            builder.Property(u => u.Id)
                .ValueGeneratedOnAdd();

            builder.Property(u => u.Name)
                .IsRequired()
                .HasMaxLength(256);

            builder.Property(u => u.Email)
                .HasMaxLength(256)
                .IsRequired(false);

            builder.Property(u => u.MobileNumber)
                .IsRequired()
                .HasMaxLength(20);

            builder.Property(u => u.PasswordHash)
                .IsRequired()
                .HasMaxLength(500);

            builder.Property(u => u.Role)
                .IsRequired()
                .HasMaxLength(50)
                .HasDefaultValue("Employee");

            builder.Property(u => u.CanCreatePartners)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(u => u.IsActive)
                .IsRequired()
                .HasDefaultValue(true);

            builder.Property(u => u.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(u => u.PasswordResetTokenHash)
                .HasMaxLength(128);

            // Indexes
            builder.HasIndex(u => u.MobileNumber)
                .IsUnique()
                .HasDatabaseName("IX_User_MobileNumber_Unique");

            builder.HasIndex(u => u.Email)
                .IsUnique()
                .HasDatabaseName("IX_User_Email_Unique")
                .HasFilter("[Email] IS NOT NULL");

            // Table
            builder.ToTable("Users");
        }
    }
}
