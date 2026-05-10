using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Common.Interfaces
{
    public interface IApplicationDbContext
    {
        DbSet<Admin> Admins { get; set; }
        DbSet<AuditLog> AuditLogs { get; set; }
        DbSet<User> Users { get; set; }
        DbSet<Partner> Partners { get; set; }
        DbSet<Client> Clients { get; set; }
        DbSet<CreditTransaction> CreditTransactions { get; set; }
        DbSet<ClientEmployeeMapping> ClientEmployeeMappings { get; set; }
        DbSet<Template> Templates { get; set; }
        DbSet<Group> Groups { get; set; }
        DbSet<GroupMember> GroupMembers { get; set; }
        DbSet<Message> Messages { get; set; }
        DbSet<ScheduledMessage> ScheduledMessages { get; set; }
        DbSet<SubscriptionPlan> SubscriptionPlans { get; set; }
        DbSet<ClientSubscription> ClientSubscriptions { get; set; }
        DbSet<SubscriptionTransaction> SubscriptionTransactions { get; set; }
        DbSet<Quotation> Quotations { get; set; }
        DbSet<Billing> Billings { get; set; }
        DbSet<PaymentReference> PaymentReferences { get; set; }

        DatabaseFacade Database { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    }
}
