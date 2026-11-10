using Microsoft.EntityFrameworkCore;
using OrderRoutes.Api.Contracts;
using OrderRoutes.Api.Data;
using OrderRoutes.Api.Domain;
using OrderRoutes.Api.Infrastructure;

namespace OrderRoutes.Api.Services;

public class OrderRouteService(AppDbContext db)
{
    // Which StartRulesDto list feeds which rule key.
    private static readonly (RuleKey Key, Func<StartRulesDto, List<string>> Values)[] RuleMap =
    [
        (RuleKey.Entity, r => r.Entities),
        (RuleKey.ExportAddress, r => r.ExportAddresses),
        (RuleKey.OrderType, r => r.OrderTypes),
        (RuleKey.ShipmentMode, r => r.ShipmentModes),
        (RuleKey.Incoterm, r => r.Incoterms),
        (RuleKey.Customer, r => r.Customers),
        (RuleKey.ShipToCountry, r => r.ShipToCountries),
        (RuleKey.BillToCountry, r => r.BillToCountries),
    ];

    // ======================= GET =======================

    public async Task<List<OrderRouteSummaryDto>> ListAsync(RouteState? state, int? statusTypeId, string? search, CancellationToken ct)
    {
        var q = db.OrderRoutes.AsNoTracking();
        if (state is not null) q = q.Where(r => r.State == state);
        if (statusTypeId is not null) q = q.Where(r => r.StatusTypeId == statusTypeId);
        if (!string.IsNullOrWhiteSpace(search)) q = q.Where(r => r.Name.Contains(search.Trim()));

        return await q.OrderBy(r => r.Name)
            .Select(r => new OrderRouteSummaryDto(
                r.Id, r.Name, r.State, r.StatusTypeId,
                r.Steps.Count,
                r.Steps.Sum(s => s.SlaHours ?? 0),
                r.ModifiedAt ?? r.CreatedAt))
            .ToListAsync(ct);
    }

    public async Task<OrderRouteDto> GetAsync(int id, CancellationToken ct)
    {
        var route = await LoadAsync(id, tracked: false, ct) ?? throw new NotFoundException($"Order route {id} does not exist.");
        return await ToDtoAsync(route, ct);
    }

    // ======================= POST =======================

    public async Task<OrderRouteDto> CreateAsync(SaveOrderRouteRequest req, string user, CancellationToken ct)
    {
        await ValidateAsync(req, routeId: null, ct);

        var route = new OrderRoute { CreatedBy = user, CreatedAt = DateTime.UtcNow };
        Apply(route, req);
        db.OrderRoutes.Add(route);
        await db.SaveChangesAsync(ct);
        return await GetAsync(route.Id, ct);
    }

    public async Task<OrderRouteDto> DuplicateAsync(int id, string user, CancellationToken ct)
    {
        var src = await LoadAsync(id, tracked: false, ct) ?? throw new NotFoundException($"Order route {id} does not exist.");

        var name = $"{src.Name} (copy)";
        for (var n = 2; await db.OrderRoutes.AnyAsync(r => r.Name == name, ct); n++) name = $"{src.Name} (copy {n})";

        var copy = new OrderRoute
        {
            Name = name, State = RouteState.Draft, StatusTypeId = src.StatusTypeId,
            MatchMode = src.MatchMode, ShipBillRule = src.ShipBillRule,
            CreatedBy = user, CreatedAt = DateTime.UtcNow,
            Rules = src.Rules.Select(r => new OrderRouteRule { Key = r.Key, Value = r.Value }).ToList(),
            Steps = src.Steps.Select(s => new OrderRouteStep
            {
                Sequence = s.Sequence, Kind = s.Kind, StatusId = s.StatusId, DisplayName = s.DisplayName,
                AssigneeType = s.AssigneeType, AssignmentMode = s.AssignmentMode, Assignee = s.Assignee, SlaHours = s.SlaHours,
                SendBackSteps = s.SendBackSteps.Select(b => new OrderRouteSendBackStep
                    { Sequence = b.Sequence, StatusId = b.StatusId, Assignee = b.Assignee, SlaHours = b.SlaHours }).ToList()
            }).ToList()
        };
        db.OrderRoutes.Add(copy);
        await db.SaveChangesAsync(ct);
        return await GetAsync(copy.Id, ct);
    }

    // ======================= PUT =======================

    /// <summary>Replaces the whole route definition (rules + steps), the way the builder's Save button works.</summary>
    public async Task<OrderRouteDto> UpdateAsync(int id, SaveOrderRouteRequest req, string user, CancellationToken ct)
    {
        var route = await LoadAsync(id, tracked: true, ct) ?? throw new NotFoundException($"Order route {id} does not exist.");
        await ValidateAsync(req, id, ct);
        ExpectRowVersion(route, req.RowVersion);

        db.RemoveRange(route.Steps.SelectMany(s => s.SendBackSteps));
        db.RemoveRange(route.Steps);
        db.RemoveRange(route.Rules);
        route.Steps = [];
        route.Rules = [];

        Apply(route, req);
        route.ModifiedBy = user;
        route.ModifiedAt = DateTime.UtcNow;   // always changes, so the route row's rowversion is checked

        await SaveWithConcurrencyAsync(ct);
        return await GetAsync(id, ct);
    }

    public async Task<OrderRouteDto> SetStateAsync(int id, UpdateRouteStateRequest req, string user, CancellationToken ct)
    {
        var route = await LoadAsync(id, tracked: true, ct) ?? throw new NotFoundException($"Order route {id} does not exist.");
        ExpectRowVersion(route, req.RowVersion);

        if (req.State == RouteState.Active)
        {
            if (route.Steps.Count == 0)
                throw new ApiValidationException(new Dictionary<string, string[]> { ["state"] = ["Add at least one step before activating this route."] });
            await EnsureNoTwinActiveRouteAsync(route.Id, route.StatusTypeId, route.MatchMode, route.ShipBillRule,
                route.Rules.Select(r => (r.Key, r.Value)), ct);
        }

        route.State = req.State;
        route.ModifiedBy = user;
        route.ModifiedAt = DateTime.UtcNow;
        await SaveWithConcurrencyAsync(ct);
        return await GetAsync(id, ct);
    }

    // ======================= Runtime match =======================

    /// <summary>
    /// Finds the Active route a new order should follow. Empty rule groups are ignored.
    /// When several routes match, the one with the most matching rules wins; equal scores are flagged as ambiguous.
    /// </summary>
    public async Task<MatchOrderResponse> MatchAsync(MatchOrderRequest o, CancellationToken ct)
    {
        var routes = await db.OrderRoutes.AsNoTracking()
            .Include(r => r.Rules).Include(r => r.Steps)
            .Where(r => r.State == RouteState.Active && r.StatusTypeId == o.StatusTypeId)
            .ToListAsync(ct);

        var orderValues = new Dictionary<RuleKey, string?>
        {
            [RuleKey.Entity] = o.Entity, [RuleKey.ExportAddress] = o.ExportAddress, [RuleKey.OrderType] = o.OrderType,
            [RuleKey.ShipmentMode] = o.ShipmentMode, [RuleKey.Incoterm] = o.Incoterm, [RuleKey.Customer] = o.Customer,
            [RuleKey.ShipToCountry] = o.ShipToCountry, [RuleKey.BillToCountry] = o.BillToCountry,
        };

        var hits = new List<(OrderRoute Route, int Score)>();
        foreach (var r in routes)
        {
            var results = r.Rules.GroupBy(x => x.Key)
                .Select(g => orderValues[g.Key] is { } v && g.Any(x => string.Equals(x.Value, v.Trim(), StringComparison.OrdinalIgnoreCase)))
                .ToList();

            if (r.ShipBillRule != ShipBillRule.Any)
            {
                var both = !string.IsNullOrWhiteSpace(o.ShipToParty) && !string.IsNullOrWhiteSpace(o.BillToParty);
                var same = both && string.Equals(o.ShipToParty!.Trim(), o.BillToParty!.Trim(), StringComparison.OrdinalIgnoreCase);
                results.Add(both && (r.ShipBillRule == ShipBillRule.SameParty ? same : !same));
            }

            var ok = results.Count == 0 || (r.MatchMode == MatchMode.All ? results.All(x => x) : results.Any(x => x));
            if (ok) hits.Add((r, results.Count(x => x)));
        }

        hits = hits.OrderByDescending(h => h.Score).ThenBy(h => h.Route.Id).ToList();
        var candidates = hits.Select(h => new RouteCandidateDto(h.Route.Id, h.Route.Name, h.Score)).ToList();
        if (hits.Count == 0) return new MatchOrderResponse(false, false, null, null, null, null, candidates);

        var best = hits[0].Route;
        var first = best.Steps.OrderBy(s => s.Sequence).FirstOrDefault();
        var ambiguous = hits.Count > 1 && hits[1].Score == hits[0].Score;
        return new MatchOrderResponse(true, ambiguous, best.Id, best.Name, first?.Id, first?.StatusId, candidates);
    }

    // ======================= Helpers =======================

    private Task<OrderRoute?> LoadAsync(int id, bool tracked, CancellationToken ct)
    {
        IQueryable<OrderRoute> q = db.OrderRoutes
            .Include(r => r.Rules)
            .Include(r => r.Steps).ThenInclude(s => s.SendBackSteps)
            .AsSplitQuery();
        if (!tracked) q = q.AsNoTracking();
        return q.FirstOrDefaultAsync(r => r.Id == id, ct);
    }

    private static void Apply(OrderRoute route, SaveOrderRouteRequest req)
    {
        route.Name = req.Name.Trim();
        route.State = req.State;
        route.StatusTypeId = req.StatusTypeId;
        route.MatchMode = req.StartRules.MatchMode;
        route.ShipBillRule = req.StartRules.ShipBill;
        route.Rules = NormalizedRules(req.StartRules).Select(x => new OrderRouteRule { Key = x.Key, Value = x.Value }).ToList();
        route.Steps = req.Steps.Select((s, i) => new OrderRouteStep
        {
            Sequence = i + 1,
            Kind = s.Kind,
            StatusId = s.StatusId,
            DisplayName = string.IsNullOrWhiteSpace(s.DisplayName) ? null : s.DisplayName.Trim(),
            AssigneeType = s.AssigneeType,
            AssignmentMode = s.Assignment,
            Assignee = string.IsNullOrWhiteSpace(s.Assignee) ? null : s.Assignee.Trim(),
            SlaHours = s.SlaHours,
            SendBackSteps = s.Kind != StepKind.Approval ? [] : s.SendBack.Select((b, j) => new OrderRouteSendBackStep
            {
                Sequence = j + 1, StatusId = b.StatusId,
                Assignee = string.IsNullOrWhiteSpace(b.Assignee) ? null : b.Assignee.Trim(),
                SlaHours = b.SlaHours
            }).ToList()
        }).ToList();
    }

    private static IEnumerable<(RuleKey Key, string Value)> NormalizedRules(StartRulesDto rules) =>
        RuleMap.SelectMany(m => (m.Values(rules) ?? [])
            .Where(v => !string.IsNullOrWhiteSpace(v))
            .Select(v => v.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Select(v => (m.Key, v)));

    private async Task<OrderRouteDto> ToDtoAsync(OrderRoute r, CancellationToken ct)
    {
        var ids = r.Steps.Select(s => s.StatusId).OfType<int>()
            .Concat(r.Steps.SelectMany(s => s.SendBackSteps).Select(b => b.StatusId)).Distinct().ToList();
        var statuses = await db.OrderStatuses.AsNoTracking().Where(s => ids.Contains(s.Id)).ToDictionaryAsync(s => s.Id, ct);

        List<string> Values(RuleKey k) => r.Rules.Where(x => x.Key == k).Select(x => x.Value).ToList();
        var rules = new StartRulesDto
        {
            MatchMode = r.MatchMode, ShipBill = r.ShipBillRule,
            Entities = Values(RuleKey.Entity), ExportAddresses = Values(RuleKey.ExportAddress),
            OrderTypes = Values(RuleKey.OrderType), ShipmentModes = Values(RuleKey.ShipmentMode),
            Incoterms = Values(RuleKey.Incoterm), Customers = Values(RuleKey.Customer),
            ShipToCountries = Values(RuleKey.ShipToCountry), BillToCountries = Values(RuleKey.BillToCountry),
        };

        var steps = r.Steps.OrderBy(s => s.Sequence).Select(s =>
        {
            var st = s.StatusId is int sid && statuses.TryGetValue(sid, out var x) ? x : null;
            return new RouteStepViewDto(
                s.Id, s.Sequence, s.Kind, s.StatusId, st?.StatusText,
                st is null ? null : StatusCategory.From(st.StatusText, st.TypeId),
                s.DisplayName ?? st?.StatusText ?? "Untitled step",
                s.AssigneeType, s.AssignmentMode, s.Assignee, s.SlaHours,
                s.SendBackSteps.OrderBy(b => b.Sequence).Select(b => new SendBackStepViewDto(
                    b.Id, b.Sequence, b.StatusId, statuses.TryGetValue(b.StatusId, out var bs) ? bs.StatusText : null, b.Assignee, b.SlaHours)).ToList());
        }).ToList();

        return new OrderRouteDto(r.Id, r.Name, r.State, r.StatusTypeId, rules, steps,
            r.Steps.Sum(s => s.SlaHours ?? 0), Convert.ToBase64String(r.RowVersion),
            r.CreatedBy, r.CreatedAt, r.ModifiedBy, r.ModifiedAt);
    }

    private void ExpectRowVersion(OrderRoute route, string? rowVersion)
    {
        if (string.IsNullOrWhiteSpace(rowVersion))
            throw new ApiValidationException(new Dictionary<string, string[]> { ["rowVersion"] = ["Send the rowVersion you received from GET."] });
        byte[] bytes;
        try { bytes = Convert.FromBase64String(rowVersion); }
        catch (FormatException) { throw new ApiValidationException(new Dictionary<string, string[]> { ["rowVersion"] = ["rowVersion is not valid."] }); }

        if (!bytes.AsSpan().SequenceEqual(route.RowVersion))
            throw new ConflictException("Someone else saved this route after you opened it. Reload it and apply your changes again.");
        db.Entry(route).Property(r => r.RowVersion).OriginalValue = bytes;
    }

    private async Task SaveWithConcurrencyAsync(CancellationToken ct)
    {
        try { await db.SaveChangesAsync(ct); }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException("Someone else saved this route after you opened it. Reload it and apply your changes again.");
        }
    }

    private async Task ValidateAsync(SaveOrderRouteRequest req, int? routeId, CancellationToken ct)
    {
        var errors = new Dictionary<string, List<string>>();
        void Add(string field, string msg) { if (!errors.TryGetValue(field, out var l)) errors[field] = l = []; l.Add(msg); }

        // Route
        var name = req.Name?.Trim() ?? "";
        if (name.Length == 0) Add("name", "Name is required.");
        else if (name.Length > 150) Add("name", "Name must be 150 characters or fewer.");
        else if (await db.OrderRoutes.AnyAsync(r => r.Name == name && r.Id != routeId, ct)) Add("name", "Another order route already uses this name.");

        if (!await db.OrderStatuses.AnyAsync(s => s.TypeId == req.StatusTypeId, ct)) Add("statusTypeId", $"Status type {req.StatusTypeId} has no statuses.");
        if (req.State == RouteState.Active && req.Steps.Count == 0) Add("steps", "An active route needs at least one step.");

        // Steps
        var statusIds = req.Steps.Select(s => s.StatusId).OfType<int>()
            .Concat(req.Steps.SelectMany(s => s.SendBack ?? []).Select(b => b.StatusId)).Distinct().ToList();
        var statuses = await db.OrderStatuses.AsNoTracking().Where(s => statusIds.Contains(s.Id)).ToDictionaryAsync(s => s.Id, s => s.TypeId, ct);

        void CheckStatus(string field, int id)
        {
            if (!statuses.TryGetValue(id, out var type)) Add(field, $"Status {id} does not exist.");
            else if (type != req.StatusTypeId) Add(field, $"Status {id} belongs to type {type}, but this route uses type {req.StatusTypeId}.");
        }

        for (var i = 0; i < req.Steps.Count; i++)
        {
            var s = req.Steps[i];
            var f = $"steps[{i}]";
            if (s.StatusId is int sid) CheckStatus($"{f}.statusId", sid);
            else if (s.Kind == StepKind.Waypoint) Add($"{f}.statusId", "A waypoint needs a status.");
            else if (string.IsNullOrWhiteSpace(s.DisplayName)) Add($"{f}.statusId", "Pick a status or give the step a name.");

            if (s.SlaHours is < 0) Add($"{f}.slaHours", "SLA cannot be negative.");
            if (s.DisplayName?.Length > 150) Add($"{f}.displayName", "Name must be 150 characters or fewer.");

            var back = s.SendBack ?? [];
            if (back.Count > 0 && s.Kind != StepKind.Approval) Add($"{f}.sendBack", "Only approval steps can have a send-back path.");
            for (var j = 0; j < back.Count; j++)
            {
                CheckStatus($"{f}.sendBack[{j}].statusId", back[j].StatusId);
                if (back[j].SlaHours is < 0) Add($"{f}.sendBack[{j}].slaHours", "SLA cannot be negative.");
            }
        }

        // Start rules: every selected value must exist in its master
        var rules = req.StartRules ?? new StartRulesDto();
        async Task CheckCodes(string field, List<string>? values, IQueryable<string> known)
        {
            var list = (values ?? []).Where(v => !string.IsNullOrWhiteSpace(v)).Select(v => v.Trim()).Distinct().ToList();
            if (list.Count == 0) return;
            var found = await known.Where(c => list.Contains(c)).ToListAsync(ct);
            var missing = list.Except(found, StringComparer.OrdinalIgnoreCase).ToList();
            if (missing.Count > 0) Add($"startRules.{field}", $"Unknown value(s): {string.Join(", ", missing)}");
        }
        IQueryable<string> Lookup(LookupCategory c) => db.LookupValues.Where(l => l.Category == c && l.IsActive).Select(l => l.Code);

        await CheckCodes("entities", rules.Entities, db.CompanyEntities.Select(e => e.ShortName));
        await CheckCodes("exportAddresses", rules.ExportAddresses, db.ExportAddresses.Select(e => e.AdCode));
        await CheckCodes("customers", rules.Customers, db.Customers.Select(c => c.Code));
        await CheckCodes("orderTypes", rules.OrderTypes, Lookup(LookupCategory.OrderType));
        await CheckCodes("shipmentModes", rules.ShipmentModes, Lookup(LookupCategory.ShipmentMode));
        await CheckCodes("incoterms", rules.Incoterms, Lookup(LookupCategory.Incoterm));
        await CheckCodes("shipToCountries", rules.ShipToCountries, Lookup(LookupCategory.Country));
        await CheckCodes("billToCountries", rules.BillToCountries, Lookup(LookupCategory.Country));

        if (errors.Count > 0) throw new ApiValidationException(errors.ToDictionary(e => e.Key, e => e.Value.ToArray()));

        if (req.State == RouteState.Active)
            await EnsureNoTwinActiveRouteAsync(routeId, req.StatusTypeId, rules.MatchMode, rules.ShipBill, NormalizedRules(rules), ct);
    }

    /// <summary>Stops two Active routes with exactly the same start rules, which would make matching ambiguous.</summary>
    private async Task EnsureNoTwinActiveRouteAsync(int? routeId, int statusTypeId, MatchMode mode, ShipBillRule shipBill,
        IEnumerable<(RuleKey Key, string Value)> rules, CancellationToken ct)
    {
        static string Sig(MatchMode m, ShipBillRule sb, IEnumerable<(RuleKey Key, string Value)> rs) =>
            $"{m}|{sb}|" + string.Join(";", rs.Select(x => $"{x.Key}={x.Value.ToUpperInvariant()}").OrderBy(x => x, StringComparer.Ordinal));

        var mine = Sig(mode, shipBill, rules);
        var others = await db.OrderRoutes.AsNoTracking().Include(r => r.Rules)
            .Where(r => r.State == RouteState.Active && r.StatusTypeId == statusTypeId && r.Id != routeId)
            .ToListAsync(ct);
        var twin = others.FirstOrDefault(o => Sig(o.MatchMode, o.ShipBillRule, o.Rules.Select(x => (x.Key, x.Value))) == mine);
        if (twin is not null)
            throw new ConflictException($"Active route “{twin.Name}” already has exactly these start rules. Change the rules or deactivate that route first.");
    }
}
