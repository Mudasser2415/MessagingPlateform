using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace API.Models
{
    public class UploadPaymentRequest
    {
        [Required]
        public Guid BillingId { get; set; }

        [Required]
        public IFormFile File { get; set; } = null!;
    }
}
