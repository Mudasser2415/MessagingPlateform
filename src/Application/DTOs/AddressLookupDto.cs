namespace Application.DTOs
{
    public class AddressLookupResponseDto
    {
        public string PinCode { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string Taluk { get; set; } = string.Empty;
        public List<string> PostOffices { get; set; } = [];
    }
}
