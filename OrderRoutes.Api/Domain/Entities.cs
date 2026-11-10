namespace OrderRoutes.Api.Domain;

public enum RouteState { Draft, Active, Inactive }
public enum StepKind { Waypoint, Task, Approval }
public enum MatchMode { All, Any }
public enum ShipBillRule { Any, SameParty, DifferentParty }
public enum AssigneeType { InternalUser, ServiceProvider, Customer }
public enum AssignmentMode { Direct, RoundRobin }
public enum RuleKey { Entity, ExportAddress, OrderType, ShipmentMode, Incoterm, Customer, ShipToCountry, BillToCountry }
public enum LookupCategory { OrderType, ShipmentMode, Incoterm, Country }

/// <summary>Your existing status master table (ID, StatusText, CreatedDate, UserName, TypeID).</summary>
public class OrderStatus
{
    public int Id { get; set; }
    public string StatusText { get; set; } = "";
    public DateTime? CreatedDate { get; set; }
    public string? UserName { get; set; }
    public int TypeId { get; set; }
}

public class CompanyEntity
{
    public string ShortName { get; set; } = "";   // SIPL
    public string Name { get; set; } = "";        // SUNDARAM INDUSTRIES PRIVATE LIMITED
    public string Code { get; set; } = "";        // SI001
    public string Country { get; set; } = "";     // INDIA
}

public class ExportAddress
{
    public string AdCode { get; set; } = "";
    public string PortName { get; set; } = "";
    public string PortCode { get; set; } = "";
    public string? EntityShortName { get; set; }
}

public class Customer
{
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
    public string? Country { get; set; }
}

public class LookupValue
{
    public int Id { get; set; }
    public LookupCategory Category { get; set; }
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
}

public class OrderRoute
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public RouteState State { get; set; } = RouteState.Draft;
    public int StatusTypeId { get; set; }
    public MatchMode MatchMode { get; set; } = MatchMode.All;
    public ShipBillRule ShipBillRule { get; set; } = ShipBillRule.Any;
    public byte[] RowVersion { get; set; } = [];
    public string CreatedBy { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public string? ModifiedBy { get; set; }
    public DateTime? ModifiedAt { get; set; }

    public List<OrderRouteRule> Rules { get; set; } = [];
    public List<OrderRouteStep> Steps { get; set; } = [];
}

public class OrderRouteRule
{
    public int Id { get; set; }
    public int OrderRouteId { get; set; }
    public RuleKey Key { get; set; }
    public string Value { get; set; } = "";
}

public class OrderRouteStep
{
    public int Id { get; set; }
    public int OrderRouteId { get; set; }
    public int Sequence { get; set; }
    public StepKind Kind { get; set; }
    public int? StatusId { get; set; }
    public string? DisplayName { get; set; }
    public AssigneeType AssigneeType { get; set; }
    public AssignmentMode AssignmentMode { get; set; }
    public string? Assignee { get; set; }
    public int? SlaHours { get; set; }

    public List<OrderRouteSendBackStep> SendBackSteps { get; set; } = [];
}

public class OrderRouteSendBackStep
{
    public int Id { get; set; }
    public int OrderRouteStepId { get; set; }
    public int Sequence { get; set; }
    public int StatusId { get; set; }
    public string? Assignee { get; set; }
    public int? SlaHours { get; set; }
}

/// <summary>Groups statuses into stages, the same way the builder UI does.</summary>
public static class StatusCategory
{
    public static readonly string[] Order =
        ["Order", "Proforma", "Production", "Stencil & PDI", "Invoice & Payment", "Dispatch & Shipping", "Revisions", "Cancellation", "Inward"];

    public static string From(string text, int typeId)
    {
        if (typeId == 2) return "Inward";
        bool Has(params string[] k) => k.Any(text.Contains);
        if (Has("CANCEL")) return "Cancellation";
        if (text.StartsWith("REQUEST FOR") || Has("REVISION", "CHANGES", "RE-PREPARE", "SUBSTITUTION")) return "Revisions";
        if (Has("STENCIL", "PDI")) return "Stencil & PDI";
        if (Has("PROFORMA", "DRAFT PI")) return "Proforma";
        if (Has("INVOICE", "PAYMENT", "TCS")) return "Invoice & Payment";
        if (Has("PRODUCTION", "PPC", "WORK ORDER", "SCHEDULE", "APPROVAL")) return "Production";
        if (Has("DISPATCH", "VEHICLE", "SAILING", "CONTAINER", "DOCUMENT", "SHIPPING", "LOADING")) return "Dispatch & Shipping";
        return "Order";
    }
}
