namespace Application.DTOs
{
    public class SendGroupMessageResponse
    {
        public int TotalMessages { get; init; }
        public string Status { get; init; } = "Queued";
    }
}
