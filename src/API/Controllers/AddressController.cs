using Application.Common.Interfaces;
using Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;

namespace API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/address")]
    public partial class AddressController : ControllerBase
    {
        private readonly IAddressLookupService _addressLookupService;

        public AddressController(IAddressLookupService addressLookupService)
        {
            _addressLookupService = addressLookupService;
        }

        /// <summary>
        /// Looks up address details for an India PIN code.
        /// Results are cached for 24 hours to reduce external API calls.
        /// </summary>
        [HttpGet("pincode/{pincode}")]
        [ProducesResponseType(typeof(AddressLookupResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<AddressLookupResponseDto>> GetByPinCode(
            string pincode,
            CancellationToken cancellationToken)
        {
            if (!PinCodeRegex().IsMatch(pincode))
                return BadRequest(new { message = "PIN code must be exactly 6 digits." });

            var result = await _addressLookupService.LookupAsync(pincode, cancellationToken);
            if (result is null)
                return NotFound(new { message = "No address data found for this PIN code." });

            return Ok(result);
        }

        [GeneratedRegex(@"^\d{6}$")]
        private static partial Regex PinCodeRegex();
    }
}
