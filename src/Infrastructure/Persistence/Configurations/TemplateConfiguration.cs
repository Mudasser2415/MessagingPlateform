using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class TemplateConfiguration : IEntityTypeConfiguration<Template>
    {
        public void Configure(EntityTypeBuilder<Template> builder)
        {
            builder.HasKey(t => t.TemplateId);

            builder.Property(t => t.TemplateName)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(t => t.TemplateContent)
                .IsRequired();

            builder.Property(t => t.Category)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(t => t.TemplateType)
                .IsRequired()
                .HasMaxLength(50);

            builder.HasOne(t => t.Client)
                .WithMany()
                .HasForeignKey(t => t.ClientId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
