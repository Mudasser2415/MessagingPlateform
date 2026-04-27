using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class GroupMemberConfiguration : IEntityTypeConfiguration<GroupMember>
    {
        public void Configure(EntityTypeBuilder<GroupMember> builder)
        {
            builder.HasKey(gm => gm.Id);

            builder.Property(gm => gm.PhoneNumber)
                .IsRequired()
                .HasMaxLength(20);

            builder.Property(gm => gm.IsKnownContact)
                .IsRequired()
                .HasDefaultValue(false);

            builder.HasOne(gm => gm.Group)
                .WithMany()
                .HasForeignKey(gm => gm.GroupId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
