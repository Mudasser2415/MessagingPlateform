using System;

namespace Domain.Entities
{
    public class SavedMessage
    {
        public Guid Id { get; set; }
        public Guid ClientId { get; set; }
        public Guid TemplateId { get; set; }
        public Guid? GroupId { get; set; }
        public string PhoneNumber { get; set; } = string.Empty;
        public string MessageContent { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }

        public Client? Client { get; set; }
        public Template? Template { get; set; }
        public Group? Group { get; set; }
    }
}
