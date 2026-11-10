using OrderRoutes.Api.Domain;

namespace OrderRoutes.Api.Contracts;

// ---------- Masters (GET) ----------
public record StatusTypeDto(int TypeId, string Name, int StatusCount);
public record StatusDto(int Id, string StatusText, int TypeId, string Category);
public record EntityDto(string ShortName, string Name, string Code, string Country);
public record ExportAddressDto(string AdCode, string PortName, string PortCode, string? EntityShortName);
public record CustomerDto(string Code, string Name, string? Country);
public record LookupDto(string Code, string Name);
public record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, int Total);

/// <summary>Everything the Start Rules panel needs in one call (customers are searched separately).</summary>
public record StartRuleOptionsDto(
    IReadOnlyList<EntityDto> Entities,
    IReadOnlyList<ExportAddressDto> ExportAddresses,
    IReadOnlyList<LookupDto> OrderTypes,
    IReadOnlyList<LookupDto> ShipmentModes,
    IReadOnlyList<LookupDto> Incoterms,
    IReadOnlyList<LookupDto> Countries);

// ---------- Order route: request bodies (POST / PUT) ----------
public sealed class StartRulesDto
{
    public MatchMode MatchMode { get; init; } = MatchMode.All;
    public List<string> Entities { get; init; } = [];
    public List<string> ExportAddresses { get; init; } = [];
    public List<string> OrderTypes { get; init; } = [];
    public List<string> ShipmentModes { get; init; } = [];
    public List<string> Incoterms { get; init; } = [];
    public List<string> Customers { get; init; } = [];
    public List<string> ShipToCountries { get; init; } = [];
    public List<string> BillToCountries { get; init; } = [];
    public ShipBillRule ShipBill { get; init; } = ShipBillRule.Any;
}

public sealed class SendBackStepDto
{
    public int StatusId { get; init; }
    public string? Assignee { get; init; }
    public int? SlaHours { get; init; }
}

public sealed class RouteStepDto
{
    public StepKind Kind { get; init; } = StepKind.Waypoint;
    public int? StatusId { get; init; }
    public string? DisplayName { get; init; }
    public AssigneeType AssigneeType { get; init; } = AssigneeType.InternalUser;
    public AssignmentMode Assignment { get; init; } = AssignmentMode.Direct;
    public string? Assignee { get; init; }
    public int? SlaHours { get; init; }
    /// <summary>Approval steps only: where the order goes when sent back.</summary>
    public List<SendBackStepDto> SendBack { get; init; } = [];
}

/// <summary>Body for POST /api/order-routes and PUT /api/order-routes/{id}. Steps are in route order.</summary>
public sealed class SaveOrderRouteRequest
{
    public string Name { get; init; } = "";
    public RouteState State { get; init; } = RouteState.Draft;
    public int StatusTypeId { get; init; } = 1;
    public StartRulesDto StartRules { get; init; } = new();
    public List<RouteStepDto> Steps { get; init; } = [];
    /// <summary>Required on PUT: the rowVersion you received from GET.</summary>
    public string? RowVersion { get; init; }
}

public sealed class UpdateRouteStateRequest
{
    public RouteState State { get; init; }
    public string RowVersion { get; init; } = "";
}

// ---------- Order route: responses ----------
public record OrderRouteSummaryDto(int Id, string Name, RouteState State, int StatusTypeId, int StepCount, int TotalSlaHours, DateTime LastChangedAt);

public record SendBackStepViewDto(int Id, int Sequence, int StatusId, string? StatusText, string? Assignee, int? SlaHours);

public record RouteStepViewDto(
    int Id, int Sequence, StepKind Kind, int? StatusId, string? StatusText, string? Category, string Name,
    AssigneeType AssigneeType, AssignmentMode Assignment, string? Assignee, int? SlaHours,
    IReadOnlyList<SendBackStepViewDto> SendBack);

public record OrderRouteDto(
    int Id, string Name, RouteState State, int StatusTypeId, StartRulesDto StartRules,
    IReadOnlyList<RouteStepViewDto> Steps, int TotalSlaHours, string RowVersion,
    string CreatedBy, DateTime CreatedAt, string? ModifiedBy, DateTime? ModifiedAt);

// ---------- Runtime: which route does a new order follow? ----------
public sealed class MatchOrderRequest
{
    public int StatusTypeId { get; init; } = 1;
    public string? Entity { get; init; }
    public string? ExportAddress { get; init; }
    public string? OrderType { get; init; }
    public string? ShipmentMode { get; init; }
    public string? Incoterm { get; init; }
    public string? Customer { get; init; }
    public string? ShipToCountry { get; init; }
    public string? BillToCountry { get; init; }
    public string? ShipToParty { get; init; }
    public string? BillToParty { get; init; }
}

public record RouteCandidateDto(int RouteId, string Name, int RulesMatched);

public record MatchOrderResponse(
    bool Matched, bool Ambiguous, int? RouteId, string? RouteName,
    int? FirstStepId, int? FirstStatusId, IReadOnlyList<RouteCandidateDto> Candidates);
