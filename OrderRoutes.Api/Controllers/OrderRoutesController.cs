using Microsoft.AspNetCore.Mvc;
using OrderRoutes.Api.Contracts;
using OrderRoutes.Api.Domain;
using OrderRoutes.Api.Services;

namespace OrderRoutes.Api.Controllers;

[ApiController]
[Route("api/order-routes")]
public class OrderRoutesController(OrderRouteService service) : ControllerBase
{
    // Replace with your real auth (JWT / Windows) — User.Identity.Name is used for CreatedBy / ModifiedBy.
    private string CurrentUser => User.Identity?.Name ?? "system";

    /// <summary>GET api/order-routes?state=Active&amp;statusTypeId=1&amp;search=export — list for the left panel.</summary>
    [HttpGet]
    public async Task<ActionResult<List<OrderRouteSummaryDto>>> List(RouteState? state, int? statusTypeId, string? search, CancellationToken ct) =>
        await service.ListAsync(state, statusTypeId, search, ct);

    /// <summary>GET api/order-routes/5 — full definition: start rules, steps, send-back paths, rowVersion.</summary>
    [HttpGet("{id:int}", Name = "GetOrderRoute")]
    public async Task<ActionResult<OrderRouteDto>> Get(int id, CancellationToken ct) =>
        await service.GetAsync(id, ct);

    /// <summary>POST api/order-routes — create a route. Returns 201 with Location header.</summary>
    [HttpPost]
    public async Task<ActionResult<OrderRouteDto>> Create(SaveOrderRouteRequest request, CancellationToken ct)
    {
        var dto = await service.CreateAsync(request, CurrentUser, ct);
        return CreatedAtRoute("GetOrderRoute", new { id = dto.Id }, dto);
    }

    /// <summary>PUT api/order-routes/5 — replace the whole definition. Send rowVersion from GET; 409 if someone saved first.</summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<OrderRouteDto>> Update(int id, SaveOrderRouteRequest request, CancellationToken ct) =>
        await service.UpdateAsync(id, request, CurrentUser, ct);

    /// <summary>PUT api/order-routes/5/state — Draft / Active / Inactive. Inactive is the "delete" for routes.</summary>
    [HttpPut("{id:int}/state")]
    public async Task<ActionResult<OrderRouteDto>> SetState(int id, UpdateRouteStateRequest request, CancellationToken ct) =>
        await service.SetStateAsync(id, request, CurrentUser, ct);

    /// <summary>POST api/order-routes/5/duplicate — copy as a new Draft.</summary>
    [HttpPost("{id:int}/duplicate")]
    public async Task<ActionResult<OrderRouteDto>> Duplicate(int id, CancellationToken ct)
    {
        var dto = await service.DuplicateAsync(id, CurrentUser, ct);
        return CreatedAtRoute("GetOrderRoute", new { id = dto.Id }, dto);
    }

    /// <summary>POST api/order-routes/match — which Active route should this new order follow?</summary>
    [HttpPost("match")]
    public async Task<ActionResult<MatchOrderResponse>> Match(MatchOrderRequest request, CancellationToken ct) =>
        await service.MatchAsync(request, ct);
}
