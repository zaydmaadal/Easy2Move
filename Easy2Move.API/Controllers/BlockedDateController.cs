using Easy2Move.API.Filters;
using Easy2Move.Contracts.Interfaces;
using Easy2Move.Contracts.Models;
using Microsoft.AspNetCore.Mvc;

namespace Easy2Move.API.Controllers;

[ApiController]
[Route("api/blocked-dates")]
public class BlockedDateController(IBlockedDateService blockedDateService) : ControllerBase
{
    // Publiek: de boekingskalender moet geblokkeerde dagen kunnen tonen
    // en uitschakelen, ook zonder ingelogd te zijn.
    [HttpGet]
    public async Task<ActionResult<List<BlockedDateDto>>> GetAll()
    {
        return Ok(await blockedDateService.GetAll());
    }

    [HttpPost]
    [AdminOnly]
    public async Task<ActionResult<BlockedDateDto>> Create(BlockedDateDto blockedDate)
    {
        var created = await blockedDateService.Create(blockedDate);
        return Ok(created);
    }

    // Blokkeert in één keer elke dag tussen Van en Tot (bv. een vakantie).
    [HttpPost("range")]
    [AdminOnly]
    public async Task<ActionResult<List<BlockedDateDto>>> CreateRange(BlockRangeRequest request)
    {
        var created = await blockedDateService.CreateRange(request.Van, request.Tot, request.Reden ?? string.Empty);
        return Ok(created);
    }

    [HttpDelete("{id:int}")]
    [AdminOnly]
    public async Task<ActionResult> Delete(int id)
    {
        var success = await blockedDateService.Delete(id);
        if (!success) return NotFound();
        return NoContent();
    }
}

public record BlockRangeRequest(DateTime Van, DateTime Tot, string Reden);
