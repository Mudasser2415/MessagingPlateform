using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class TicketConfiguration : IEntityTypeConfiguration<Ticket>
    {
        public void Configure(EntityTypeBuilder<Ticket> builder)
        {
            builder.HasKey(t => t.Id);

            builder.Property(t => t.TicketNumber)
                .IsRequired()
                .HasMaxLength(30);

            builder.HasIndex(t => t.TicketNumber)
                .IsUnique()
                .HasDatabaseName("UX_Tickets_TicketNumber");

            builder.HasIndex(t => t.Status)
                .HasDatabaseName("IX_Tickets_Status");

            builder.HasIndex(t => t.Priority)
                .HasDatabaseName("IX_Tickets_Priority");

            builder.HasIndex(t => t.ClientId)
                .HasDatabaseName("IX_Tickets_ClientId");

            builder.HasIndex(t => t.IssueDate)
                .HasDatabaseName("IX_Tickets_IssueDate");

            builder.Property(t => t.ClientName)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(t => t.MobileNumber)
                .IsRequired()
                .HasMaxLength(20);

            builder.Property(t => t.IssueDescription)
                .IsRequired()
                .HasMaxLength(2000);

            builder.Property(t => t.ResolutionDescription)
                .HasMaxLength(2000);

            builder.Property(t => t.CreatedBy)
                .HasMaxLength(200);

            // Enum columns stored as strings for readability
            builder.Property(t => t.Priority)
                .HasConversion<string>()
                .HasMaxLength(20);

            builder.Property(t => t.TicketType)
                .HasConversion<string>()
                .HasMaxLength(10);

            builder.Property(t => t.Status)
                .HasConversion<string>()
                .HasMaxLength(20);

            builder.Property(t => t.SlaStatus)
                .HasConversion<string>()
                .HasMaxLength(10);

            // FK: Ticket → Client (restrict delete to avoid accidental loss)
            builder.HasOne(t => t.Client)
                .WithMany()
                .HasForeignKey(t => t.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            // FK: Ticket → User (assigned agent; nullable)
            builder.HasOne(t => t.AssignedTo)
                .WithMany()
                .HasForeignKey(t => t.AssignedToUserId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
