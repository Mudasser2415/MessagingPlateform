using API.Models;
using Application.DTOs;
using Application.Features.Billings.Commands;
using Application.Features.Billings.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/billings")]
    [Authorize]
    public class BillingsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<BillingsController> _logger;

        private static readonly string[] AllowedMimeTypes = { "image/jpeg", "image/png", "application/pdf" };
        private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".pdf" };
        private const long MaxFileSizeBytes = 5 * 1024 * 1024; // 5 MB

        public BillingsController(IMediator mediator, IWebHostEnvironment env, ILogger<BillingsController> logger)
        {
            _mediator = mediator;
            _env = env;
            _logger = logger;
        }

        // ── GET ALL ──────────────────────────────────────────────────────────

        [HttpGet]
        [Authorize(Roles = "Admin,Partner")]
        [ProducesResponseType(typeof(List<BillingResponseDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<BillingResponseDto>>> GetAll(
            [FromQuery] string? paymentStatus,
            [FromQuery] Guid? clientId,
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            var result = await _mediator.Send(new GetAllBillingsQuery
            {
                PaymentStatus = paymentStatus,
                ClientId = clientId,
                Search = search,
                Page = page,
                PageSize = pageSize,
            });
            return Ok(result);
        }

        // ── GET BY ID ─────────────────────────────────────────────────────────

        [HttpGet("{id:guid}")]
        [Authorize(Roles = "Admin,Partner,Employee")]
        [ProducesResponseType(typeof(BillingResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<BillingResponseDto>> GetById(Guid id)
        {
            try
            {
                var result = await _mediator.Send(new GetBillingByIdQuery { Id = id });
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // ── CREATE ───────────────────────────────────────────────────────────

        [HttpPost]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(BillingResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<BillingResponseDto>> Create([FromBody] CreateBillingDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var callerName = User.Identity?.Name ?? "admin";
                var result = await _mediator.Send(new CreateBillingCommand
                {
                    QuotationId = dto.QuotationId,
                    PaymentMethod = dto.PaymentMethod,
                    Notes = dto.Notes,
                    CreatedBy = callerName,
                });
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ── UPLOAD PAYMENT PROOF ─────────────────────────────────────────────

        [HttpPost("upload-payment")]
        [Authorize(Roles = "Admin,Employee")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(typeof(PaymentReferenceDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<PaymentReferenceDto>> UploadPayment(
            [FromForm] UploadPaymentRequest request)
        {
            var file = request.File;
            var billingId = request.BillingId;

            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file provided." });

            if (file.Length > MaxFileSizeBytes)
                return BadRequest(new { message = "File size must not exceed 5 MB." });

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(ext))
                return BadRequest(new { message = "Only JPG, JPEG, PNG, and PDF files are allowed." });

            // Validate content type as secondary check
            if (!AllowedMimeTypes.Contains(file.ContentType.ToLowerInvariant()))
                return BadRequest(new { message = "Invalid file content type." });

            // Save to wwwroot/uploads/payments/
            var uploadsDir = Path.Combine(_env.WebRootPath, "uploads", "payments");
            Directory.CreateDirectory(uploadsDir);

            var storedName = $"{Guid.NewGuid()}{ext}";
            var filePath = Path.Combine(uploadsDir, storedName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var fileUrl = $"/uploads/payments/{storedName}";
            var callerName = User.Identity?.Name ?? "admin";

            try
            {
                var refId = await _mediator.Send(new AddPaymentReferenceCommand
                {
                    BillingId = billingId,
                    FileName = file.FileName,
                    FileUrl = fileUrl,
                    FileType = ext.TrimStart('.').ToUpper(),
                    FileSize = file.Length,
                    UploadedBy = callerName,
                });

                return StatusCode(StatusCodes.Status201Created, new PaymentReferenceDto
                {
                    Id = refId,
                    BillingId = billingId,
                    FileName = file.FileName,
                    FileUrl = fileUrl,
                    FileType = ext.TrimStart('.').ToUpper(),
                    FileSize = file.Length,
                    UploadedAt = DateTime.UtcNow,
                    UploadedBy = callerName,
                });
            }
            catch (InvalidOperationException ex)
            {
                // Clean up saved file if DB insert fails
                if (System.IO.File.Exists(filePath))
                    System.IO.File.Delete(filePath);

                return BadRequest(new { message = ex.Message });
            }
        }

        // ── VERIFY PAYMENT ───────────────────────────────────────────────────

        [HttpPost("{id:guid}/verify")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(BillingResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<BillingResponseDto>> Verify(Guid id)
        {
            try
            {
                var callerName = User.Identity?.Name ?? "admin";
                var result = await _mediator.Send(new VerifyPaymentCommand
                {
                    BillingId = id,
                    VerifiedBy = callerName,
                });
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ── APPROVE BILLING ──────────────────────────────────────────────────

        [HttpPost("{id:guid}/approve")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(BillingResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<BillingResponseDto>> Approve(Guid id, [FromBody] ApproveBillingDto dto)
        {
            try
            {
                var callerName = User.Identity?.Name ?? "admin";
                var result = await _mediator.Send(new ApproveBillingCommand
                {
                    BillingId = id,
                    ApprovalNotes = dto.ApprovalNotes,
                    ApprovedBy = callerName,
                });
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ── REJECT BILLING ───────────────────────────────────────────────────

        [HttpPost("{id:guid}/reject")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(BillingResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<BillingResponseDto>> Reject(Guid id, [FromBody] RejectBillingDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var callerName = User.Identity?.Name ?? "admin";
                var result = await _mediator.Send(new RejectBillingCommand
                {
                    BillingId = id,
                    RejectionReason = dto.RejectionReason,
                    RejectedBy = callerName,
                });
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
