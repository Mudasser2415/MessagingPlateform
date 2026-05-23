namespace Domain.Enums
{
    public enum TicketPriority
    {
        Low = 0,
        Medium = 1,
        High = 2,
        Critical = 3,
    }

    public enum TicketType
    {
        INC = 0,  // Incident
        SR = 1,   // Service Request
    }

    public enum TicketStatus
    {
        Open = 0,
        InProgress = 1,
        Resolved = 2,
        Closed = 3,
        Rejected = 4,
    }

    public enum SlaStatus
    {
        Met = 0,
        Breached = 1,
    }
}
