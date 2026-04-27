namespace Domain.Entities
{
    public class ClientEmployeeMapping
    {
        public Guid Id { get; set; }
        public Guid ClientId { get; set; }
        public Guid UserId { get; set; }
        public DateTime CreatedAt { get; set; }

        public Client Client { get; set; } = null!;
        public User User { get; set; } = null!;
    }
}