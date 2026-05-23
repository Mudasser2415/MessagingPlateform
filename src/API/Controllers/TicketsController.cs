using Application.Common.Interfaces;
using Application.DTOs;
using Domain.Entities;
using Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/tickets")]
    public partial class TicketsController : ControllerBase
    {
        private readonly IApplicationDbContext _db;
        private readonly ICurrentRequestContext _ctx;
        private readonly ILogger<TicketsController> _logger;

        // SLA thresholds (hours) — kept consistent with SlaBreachJob
        private static readonly Dictionary<TicketPriority, double> SlaHours = new()
        {
            { TicketPriority.Critical, 4  },
            { TicketPriority.High,     8  },
            { TicketPriority.Medium,   24 },
            { TicketPriority.Low,      48 },
        };

        public TicketsController(
            IApplicationDbContext db,
            ICurrentRequestContext ctx,
            ILogger<TicketsController> logger)
        {
            _db = db;
            _ctx = ctx;
            _logger = logger;
        }

        // ── 1. Create Ticket ─────────────────────────────────────────────────

        /// <summary>POST /api/tickets</summary>
        [HttpPost]
        [Authorize(Roles = "Admin,Employee,Partner")]
        [ProducesResponseType(typeof(TicketResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<TicketResponseDto>> Create(
            [FromBody] CreateTicketDto dto,
            CancellationToken cancellationToken)
        {
            if (!MobileRegex().IsMatch(dto.MobileNumber))
                return BadRequest(new { message = "Invalid mobile number format." });

            if (dto.IssueDescription.Trim().Length < 10)
                return BadRequest(new { message = "Issue description must be at least 10 characters." });

            var client = await _db.Clients
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == dto.ClientId, cancellationToken);

            if (client is null)
                return BadRequest(new { message = "Client not found." });

            var now = DateTime.UtcNow;
            var ticketNumber = await GenerateTicketNumberAsync(dto.TicketType, now, cancellationToken);

            var ticket = new Ticket
            {
                Id = Guid.NewGuid(),
                TicketNumber = ticketNumber,
                ClientId = dto.ClientId,
                ClientName = client.Name,
                MobileNumber = dto.MobileNumber.Trim(),
                IssueDate = now,
                IssueDescription = dto.IssueDescription.Trim(),
                Priority = dto.Priority,
                TicketType = dto.TicketType,
                Status = TicketStatus.Open,
                SlaStatus = SlaStatus.Met,
                CreatedBy = _ctx.UserName,
                CreatedAt = now,
                UpdatedAt = now,
            };

            _db.Tickets.Add(ticket);
            await _db.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Ticket {Number} created by {User}", ticketNumber, _ctx.UserName);

            return CreatedAtAction(nameof(GetById), new { id = ticket.Id }, MapToDto(ticket));
        }

        // ── 2. Get All Tickets (paginated + filtered) ────────────────────────

        /// <summary>GET /api/tickets</summary>
        [HttpGet]
        [Authorize(Roles = "Admin,Employee,Partner")]
        [ProducesResponseType(typeof(TicketPagedResponseDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<TicketPagedResponseDto>> GetAll(
            [FromQuery] TicketQueryDto query,
            CancellationToken cancellationToken)
        {
            var q = _db.Tickets
                .Include(t => t.AssignedTo)
                .AsNoTracking()
                .AsQueryable();

            // Role-based scoping
            if (_ctx.Role == "Employee")
            {
                q = q.Where(t => t.AssignedToUserId == _ctx.UserId);
            }
            else if (_ctx.Role == "Partner")
            {
                // Partners see only their clients' tickets
                var partnerClientIds = await _db.Clients
                    .Where(c => c.PartnerId != null &&
                                _db.Partners.Any(p => p.UserId == _ctx.UserId && p.Id == c.PartnerId))
                    .Select(c => c.Id)
                    .ToListAsync(cancellationToken);
                q = q.Where(t => partnerClientIds.Contains(t.ClientId));
            }

            // Filters
            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var s = query.Search.Trim().ToLower();
                q = q.Where(t =>
                    t.TicketNumber.ToLower().Contains(s) ||
                    t.ClientName.ToLower().Contains(s) ||
                    t.MobileNumber.Contains(s) ||
                    t.IssueDescription.ToLower().Contains(s));
            }

            if (!string.IsNullOrWhiteSpace(query.Status) &&
                Enum.TryParse<TicketStatus>(query.Status, true, out var statusEnum))
                q = q.Where(t => t.Status == statusEnum);

            if (!string.IsNullOrWhiteSpace(query.Priority) &&
                Enum.TryParse<TicketPriority>(query.Priority, true, out var priorityEnum))
                q = q.Where(t => t.Priority == priorityEnum);

            if (!string.IsNullOrWhiteSpace(query.TicketType) &&
                Enum.TryParse<TicketType>(query.TicketType, true, out var typeEnum))
                q = q.Where(t => t.TicketType == typeEnum);

            if (!string.IsNullOrWhiteSpace(query.SlaStatus) &&
                Enum.TryParse<SlaStatus>(query.SlaStatus, true, out var slaEnum))
                q = q.Where(t => t.SlaStatus == slaEnum);

            if (query.ClientId.HasValue)
                q = q.Where(t => t.ClientId == query.ClientId.Value);

            if (query.FromDate.HasValue)
                q = q.Where(t => t.IssueDate >= query.FromDate.Value);

            if (query.ToDate.HasValue)
                q = q.Where(t => t.IssueDate <= query.ToDate.Value.AddDays(1));

            var totalCount = await q.CountAsync(cancellationToken);

            var page = Math.Max(1, query.Page);
            var pageSize = Math.Clamp(query.PageSize, 1, 100);

            var items = await q
                .OrderByDescending(t => t.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return Ok(new TicketPagedResponseDto
            {
                Items = items.Select(MapToDto).ToList(),
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
            });
        }

        // ── 3. Get Ticket By Id ──────────────────────────────────────────────

        /// <summary>GET /api/tickets/{id}</summary>
        [HttpGet("{id:guid}")]
        [Authorize(Roles = "Admin,Employee,Partner")]
        [ProducesResponseType(typeof(TicketResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<TicketResponseDto>> GetById(
            Guid id,
            CancellationToken cancellationToken)
        {
            var ticket = await _db.Tickets
                .Include(t => t.AssignedTo)
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

            if (ticket is null)
                return NotFound(new { message = "Ticket not found." });

            return Ok(MapToDto(ticket));
        }

        // ── 4. Update Ticket ─────────────────────────────────────────────────

        /// <summary>PUT /api/tickets/{id}</summary>
        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin,Employee")]
        [ProducesResponseType(typeof(TicketResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<TicketResponseDto>> Update(
            Guid id,
            [FromBody] UpdateTicketDto dto,
            CancellationToken cancellationToken)
        {
            var ticket = await _db.Tickets
                .Include(t => t.AssignedTo)
                .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

            if (ticket is null)
                return NotFound(new { message = "Ticket not found." });

            var now = DateTime.UtcNow;

            if (dto.Status.HasValue)
            {
                ticket.Status = dto.Status.Value;

                if (dto.Status.Value == TicketStatus.Resolved && ticket.ResolvedAt is null)
                    ticket.ResolvedAt = now;

                if (dto.Status.Value == TicketStatus.Closed && ticket.ClosedAt is null)
                    ticket.ClosedAt = now;
            }

            if (dto.ResolutionDescription is not null)
                ticket.ResolutionDescription = dto.ResolutionDescription.Trim();

            if (dto.AssignedToUserId.HasValue)
                ticket.AssignedToUserId = dto.AssignedToUserId.Value;

            // Recalculate SLA inline after update
            if (ticket.Status != TicketStatus.Resolved &&
                ticket.Status != TicketStatus.Closed &&
                ticket.Status != TicketStatus.Rejected)
            {
                var elapsed = (now - ticket.IssueDate).TotalHours;
                ticket.SlaStatus = elapsed > SlaHours[ticket.Priority]
                    ? SlaStatus.Breached
                    : SlaStatus.Met;
            }

            ticket.UpdatedAt = now;
            await _db.SaveChangesAsync(cancellationToken);

            // Reload navigation
            await _db.Database
                .GetDbConnection()
                .OpenAsync(cancellationToken);

            var refreshed = await _db.Tickets
                .Include(t => t.AssignedTo)
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

            return Ok(MapToDto(refreshed ?? ticket));
        }

        // ── 5. Close Ticket ──────────────────────────────────────────────────

        /// <summary>POST /api/tickets/{id}/close</summary>
        [HttpPost("{id:guid}/close")]
        [Authorize(Roles = "Admin,Employee")]
        [ProducesResponseType(typeof(TicketResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<TicketResponseDto>> Close(
            Guid id,
            CancellationToken cancellationToken)
        {
            var ticket = await _db.Tickets
                .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

            if (ticket is null)
                return NotFound(new { message = "Ticket not found." });

            if (ticket.Status == TicketStatus.Closed)
                return BadRequest(new { message = "Ticket is already closed." });

            var now = DateTime.UtcNow;
            ticket.Status = TicketStatus.Closed;
            ticket.ClosedAt = now;
            ticket.UpdatedAt = now;

            await _db.SaveChangesAsync(cancellationToken);

            return Ok(MapToDto(ticket));
        }

        // ── Helpers ──────────────────────────────────────────────────────────

        private async Task<string> GenerateTicketNumberAsync(
            TicketType type,
            DateTime now,
            CancellationToken ct)
        {
            var prefix = type == TicketType.INC ? "INC" : "SR";
            var datePart = now.ToString("yyyyMMdd");

            // Count today's tickets of this type to generate sequence
            var startOfDay = now.Date;
            var endOfDay = startOfDay.AddDays(1);

            var count = await _db.Tickets
                .CountAsync(
                    t => t.TicketType == type &&
                         t.CreatedAt >= startOfDay &&
                         t.CreatedAt < endOfDay,
                    ct);

            return $"{prefix}-{datePart}-{(count + 1):D4}";
        }

        private static TicketResponseDto MapToDto(Ticket t) => new()
        {
            TicketId = t.Id,
            TicketNumber = t.TicketNumber,
            ClientId = t.ClientId,
            ClientName = t.ClientName,
            MobileNumber = t.MobileNumber,
            IssueDate = t.IssueDate,
            IssueDescription = t.IssueDescription,
            Priority = t.Priority.ToString(),
            TicketType = t.TicketType.ToString(),
            Status = t.Status.ToString(),
            ResolutionDescription = t.ResolutionDescription,
            SlaStatus = t.SlaStatus.ToString(),
            AssignedToUserId = t.AssignedToUserId,
            AssignedToName = t.AssignedTo?.Name,
            ResolvedAt = t.ResolvedAt,
            ClosedAt = t.ClosedAt,
            CreatedBy = t.CreatedBy,
            CreatedAt = t.CreatedAt,
            UpdatedAt = t.UpdatedAt,
        };

        [GeneratedRegex(@"^\+?[0-9\s\-]{7,20}$")]
        private static partial Regex MobileRegex();
    }
}
