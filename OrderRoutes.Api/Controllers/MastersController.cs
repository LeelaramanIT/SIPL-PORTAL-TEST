using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrderRoutes.Api.Contracts;
using OrderRoutes.Api.Data;
using OrderRoutes.Api.Domain;
using OrderRoutes.Api.Infrastructure;

namespace OrderRoutes.Api.Controllers;

/// <summary>Read-only master data for the builder: status library and Start Rules pick lists.</summary>
[ApiController]
[Route("api/masters")]
public class MastersController(AppDbContext db) : ControllerBase
{
    private static readonly Dictionary<int, string> TypeNames = new() { [1] = "Sales Order", [2] = "Inward" };

    /// <summary>GET api/masters/status-types</summary>
    [HttpGet("status-types")]
    public async Task<ActionResult<List<StatusTypeDto>>> GetStatusTypes(CancellationToken ct)
    {
        var counts = await db.OrderStatuses.GroupBy(s => s.TypeId).Select(g => new { g.Key, Count = g.Count() }).ToListAsync(ct);
        return counts.OrderBy(c => c.Key)
            .Select(c => new StatusTypeDto(c.Key, TypeNames.GetValueOrDefault(c.Key, $"Type {c.Key}"), c.Count)).ToList();
    }

    /// <summary>GET api/masters/statuses?typeId=1&amp;search=proforma&amp;category=Proforma</summary>
    [HttpGet("statuses")]
    public async Task<ActionResult<List<StatusDto>>> GetStatuses(int? typeId, string? search, string? category, CancellationToken ct)
    {
        var q = db.OrderStatuses.AsNoTracking();
        if (typeId is not null) q = q.Where(s => s.TypeId == typeId);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            q = int.TryParse(term, out var id) ? q.Where(s => s.Id == id || s.StatusText.Contains(term)) : q.Where(s => s.StatusText.Contains(term));
        }

        var rows = await q.OrderBy(s => s.Id).ToListAsync(ct);
        var list = rows.Select(s => new StatusDto(s.Id, s.StatusText, s.TypeId, StatusCategory.From(s.StatusText, s.TypeId)));
        if (!string.IsNullOrWhiteSpace(category)) list = list.Where(s => string.Equals(s.Category, category, StringComparison.OrdinalIgnoreCase));
        return list.OrderBy(s => Array.IndexOf(StatusCategory.Order, s.Category)).ThenBy(s => s.Id).ToList();
    }

    /// <summary>GET api/masters/statuses/26</summary>
    [HttpGet("statuses/{id:int}")]
    public async Task<ActionResult<StatusDto>> GetStatus(int id, CancellationToken ct)
    {
        var s = await db.OrderStatuses.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct)
                ?? throw new NotFoundException($"Status {id} does not exist.");
        return new StatusDto(s.Id, s.StatusText, s.TypeId, StatusCategory.From(s.StatusText, s.TypeId));
    }

    /// <summary>GET api/masters/entities</summary>
    [HttpGet("entities")]
    public async Task<ActionResult<List<EntityDto>>> GetEntities(CancellationToken ct) =>
        await db.CompanyEntities.AsNoTracking().OrderBy(e => e.ShortName)
            .Select(e => new EntityDto(e.ShortName, e.Name, e.Code, e.Country)).ToListAsync(ct);

    /// <summary>GET api/masters/export-addresses?entity=SIPL</summary>
    [HttpGet("export-addresses")]
    public async Task<ActionResult<List<ExportAddressDto>>> GetExportAddresses(string? entity, CancellationToken ct)
    {
        var q = db.ExportAddresses.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(entity)) q = q.Where(a => a.EntityShortName == entity);
        return await q.OrderBy(a => a.AdCode).Select(a => new ExportAddressDto(a.AdCode, a.PortName, a.PortCode, a.EntityShortName)).ToListAsync(ct);
    }

    /// <summary>GET api/masters/customers?search=north&amp;page=1&amp;pageSize=50</summary>
    [HttpGet("customers")]
    public async Task<ActionResult<PagedResult<CustomerDto>>> GetCustomers(string? search, int page = 1, int pageSize = 50, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);
        var q = db.Customers.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(search)) q = q.Where(c => c.Name.Contains(search.Trim()) || c.Code.Contains(search.Trim()));
        var total = await q.CountAsync(ct);
        var items = await q.OrderBy(c => c.Name).Skip((page - 1) * pageSize).Take(pageSize)
            .Select(c => new CustomerDto(c.Code, c.Name, c.Country)).ToListAsync(ct);
        return new PagedResult<CustomerDto>(items, page, pageSize, total);
    }

    /// <summary>GET api/masters/lookups/OrderType  (OrderType | ShipmentMode | Incoterm | Country)</summary>
    [HttpGet("lookups/{category}")]
    public async Task<ActionResult<List<LookupDto>>> GetLookups(LookupCategory category, CancellationToken ct) =>
        await Lookups(category, ct);

    /// <summary>GET api/masters/start-rule-options — every small list the Start Rules panel needs, in one call.</summary>
    [HttpGet("start-rule-options")]
    public async Task<ActionResult<StartRuleOptionsDto>> GetStartRuleOptions(CancellationToken ct)
    {
        var entities = (await GetEntities(ct)).Value!;
        var addresses = (await GetExportAddresses(null, ct)).Value!;
        return new StartRuleOptionsDto(entities, addresses,
            await Lookups(LookupCategory.OrderType, ct),
            await Lookups(LookupCategory.ShipmentMode, ct),
            await Lookups(LookupCategory.Incoterm, ct),
            await Lookups(LookupCategory.Country, ct));
    }

    private Task<List<LookupDto>> Lookups(LookupCategory category, CancellationToken ct) =>
        db.LookupValues.AsNoTracking().Where(l => l.Category == category && l.IsActive)
            .OrderBy(l => l.SortOrder).ThenBy(l => l.Name)
            .Select(l => new LookupDto(l.Code, l.Name)).ToListAsync(ct);
}
