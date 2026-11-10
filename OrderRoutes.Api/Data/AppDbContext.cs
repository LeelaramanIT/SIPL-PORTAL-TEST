using Microsoft.EntityFrameworkCore;
using OrderRoutes.Api.Domain;

namespace OrderRoutes.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<OrderStatus> OrderStatuses => Set<OrderStatus>();
    public DbSet<CompanyEntity> CompanyEntities => Set<CompanyEntity>();
    public DbSet<ExportAddress> ExportAddresses => Set<ExportAddress>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<LookupValue> LookupValues => Set<LookupValue>();
    public DbSet<OrderRoute> OrderRoutes => Set<OrderRoute>();
    public DbSet<OrderRouteRule> OrderRouteRules => Set<OrderRouteRule>();
    public DbSet<OrderRouteStep> OrderRouteSteps => Set<OrderRouteStep>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        // Existing table: change "OrderStatusMaster" to your real table name.
        b.Entity<OrderStatus>(e =>
        {
            e.ToTable("OrderStatusMaster");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("ID").ValueGeneratedNever();
            e.Property(x => x.StatusText).HasMaxLength(200).IsRequired();
            e.Property(x => x.UserName).HasMaxLength(50);
            e.Property(x => x.TypeId).HasColumnName("TypeID");
        });

        b.Entity<CompanyEntity>(e =>
        {
            e.ToTable("CompanyEntity");
            e.HasKey(x => x.ShortName);
            e.Property(x => x.ShortName).HasMaxLength(10);
            e.Property(x => x.Name).HasMaxLength(200);
            e.Property(x => x.Code).HasMaxLength(20);
            e.Property(x => x.Country).HasMaxLength(100);
        });

        b.Entity<ExportAddress>(e =>
        {
            e.ToTable("ExportAddress");
            e.HasKey(x => x.AdCode);
            e.Property(x => x.AdCode).HasMaxLength(20);
            e.Property(x => x.PortName).HasMaxLength(100);
            e.Property(x => x.PortCode).HasMaxLength(10);
            e.Property(x => x.EntityShortName).HasMaxLength(10);
        });

        b.Entity<Customer>(e =>
        {
            e.ToTable("Customer");
            e.HasKey(x => x.Code);
            e.Property(x => x.Code).HasMaxLength(20);
            e.Property(x => x.Name).HasMaxLength(200);
            e.Property(x => x.Country).HasMaxLength(100);
        });

        b.Entity<LookupValue>(e =>
        {
            e.ToTable("LookupValue");
            e.Property(x => x.Category).HasConversion<string>().HasMaxLength(30);
            e.Property(x => x.Code).HasMaxLength(50);
            e.Property(x => x.Name).HasMaxLength(100);
            e.HasIndex(x => new { x.Category, x.Code }).IsUnique();
        });

        b.Entity<OrderRoute>(e =>
        {
            e.ToTable("OrderRoute");
            e.Property(x => x.Name).HasMaxLength(150).IsRequired();
            e.HasIndex(x => x.Name).IsUnique();
            e.Property(x => x.State).HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.MatchMode).HasConversion<string>().HasMaxLength(10);
            e.Property(x => x.ShipBillRule).HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.CreatedBy).HasMaxLength(100);
            e.Property(x => x.ModifiedBy).HasMaxLength(100);
            e.HasMany(x => x.Rules).WithOne().HasForeignKey(x => x.OrderRouteId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(x => x.Steps).WithOne().HasForeignKey(x => x.OrderRouteId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<OrderRouteRule>(e =>
        {
            e.ToTable("OrderRouteRule");
            e.Property(x => x.Key).HasConversion<string>().HasMaxLength(30);
            e.Property(x => x.Value).HasMaxLength(100);
            e.HasIndex(x => new { x.OrderRouteId, x.Key });
        });

        b.Entity<OrderRouteStep>(e =>
        {
            e.ToTable("OrderRouteStep");
            e.Property(x => x.Kind).HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.AssigneeType).HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.AssignmentMode).HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.DisplayName).HasMaxLength(150);
            e.Property(x => x.Assignee).HasMaxLength(150);
            e.HasOne<OrderStatus>().WithMany().HasForeignKey(x => x.StatusId).OnDelete(DeleteBehavior.Restrict);
            e.HasMany(x => x.SendBackSteps).WithOne().HasForeignKey(x => x.OrderRouteStepId).OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(x => new { x.OrderRouteId, x.Sequence });
        });

        b.Entity<OrderRouteSendBackStep>(e =>
        {
            e.ToTable("OrderRouteSendBackStep");
            e.Property(x => x.Assignee).HasMaxLength(150);
            e.HasOne<OrderStatus>().WithMany().HasForeignKey(x => x.StatusId).OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(x => new { x.OrderRouteStepId, x.Sequence });
        });
    }
}
