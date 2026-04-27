using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class GroupConfiguration : IEntityTypeConfiguration<Group>
    {
        public void Configure(EntityTypeBuilder<Group> builder)
        {
            builder.HasKey(g => g.GroupId);

            builder.Property(g => g.GroupName)
                .IsRequired()
                .HasMaxLength(100);

            builder.HasOne(g => g.Client)
                .WithMany()
                .HasForeignKey(g => g.ClientId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
