/* =====================================================================
   Order Routes — SQL Server schema
   Run once against your database. Table and column names match
   Data/AppDbContext.cs; if you rename anything here, rename it there too.
   ===================================================================== */

/* ---------- Existing status master ----------
   Your table already exists. Point AppDbContext at its real name
   (default: dbo.OrderStatusMaster). This block only creates it on an
   empty dev database. */
IF OBJECT_ID('dbo.OrderStatusMaster') IS NULL
CREATE TABLE dbo.OrderStatusMaster (
    ID          int           NOT NULL PRIMARY KEY,
    StatusText  nvarchar(200) NOT NULL,
    CreatedDate datetime      NULL,
    UserName    nvarchar(50)  NULL,
    TypeID      int           NOT NULL          -- 1 = Sales Order, 2 = Inward
);
GO

/* ---------- Masters used by Start Rules ---------- */
CREATE TABLE dbo.CompanyEntity (
    ShortName nvarchar(10)  NOT NULL PRIMARY KEY,  -- SIPL, SLTL, SITL, STA
    Name      nvarchar(200) NOT NULL,
    Code      nvarchar(20)  NOT NULL,              -- SI001 ...
    Country   nvarchar(100) NOT NULL
);

CREATE TABLE dbo.ExportAddress (
    AdCode          nvarchar(20)  NOT NULL PRIMARY KEY,   -- AD code
    PortName        nvarchar(100) NOT NULL,
    PortCode        nvarchar(10)  NOT NULL,               -- INMAA1 ...
    EntityShortName nvarchar(10)  NULL REFERENCES dbo.CompanyEntity(ShortName)
);

CREATE TABLE dbo.Customer (
    Code    nvarchar(20)  NOT NULL PRIMARY KEY,
    Name    nvarchar(200) NOT NULL,
    Country nvarchar(100) NULL
);

-- Small pick lists: OrderType, ShipmentMode, Incoterm, Country
CREATE TABLE dbo.LookupValue (
    Id        int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Category  nvarchar(30)  NOT NULL,
    Code      nvarchar(50)  NOT NULL,
    Name      nvarchar(100) NOT NULL,
    SortOrder int           NOT NULL DEFAULT 0,
    IsActive  bit           NOT NULL DEFAULT 1,
    CONSTRAINT UX_LookupValue_Category_Code UNIQUE (Category, Code)
);
GO

/* ---------- Order Routes ---------- */
CREATE TABLE dbo.OrderRoute (
    Id           int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Name         nvarchar(150) NOT NULL,
    State        nvarchar(20)  NOT NULL,   -- Draft | Active | Inactive
    StatusTypeId int           NOT NULL,   -- which status master type the route uses
    MatchMode    nvarchar(10)  NOT NULL,   -- All | Any
    ShipBillRule nvarchar(20)  NOT NULL,   -- Any | SameParty | DifferentParty
    RowVersion   rowversion    NOT NULL,   -- optimistic concurrency for PUT
    CreatedBy    nvarchar(100) NOT NULL,
    CreatedAt    datetime2     NOT NULL,
    ModifiedBy   nvarchar(100) NULL,
    ModifiedAt   datetime2     NULL,
    CONSTRAINT UX_OrderRoute_Name UNIQUE (Name)
);

-- One row per selected value, e.g. (Entity, SIPL), (OrderType, Export)
CREATE TABLE dbo.OrderRouteRule (
    Id           int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    OrderRouteId int          NOT NULL REFERENCES dbo.OrderRoute(Id) ON DELETE CASCADE,
    [Key]        nvarchar(30) NOT NULL,   -- Entity | ExportAddress | OrderType | ShipmentMode | Incoterm | Customer | ShipToCountry | BillToCountry
    Value        nvarchar(100) NOT NULL
);
CREATE INDEX IX_OrderRouteRule_Route_Key ON dbo.OrderRouteRule (OrderRouteId, [Key]);

CREATE TABLE dbo.OrderRouteStep (
    Id             int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    OrderRouteId   int           NOT NULL REFERENCES dbo.OrderRoute(Id) ON DELETE CASCADE,
    Sequence       int           NOT NULL,
    Kind           nvarchar(20)  NOT NULL,   -- Waypoint | Task | Approval
    StatusId       int           NULL REFERENCES dbo.OrderStatusMaster(ID),
    DisplayName    nvarchar(150) NULL,
    AssigneeType   nvarchar(20)  NOT NULL,   -- InternalUser | ServiceProvider | Customer
    AssignmentMode nvarchar(20)  NOT NULL,   -- Direct | RoundRobin
    Assignee       nvarchar(150) NULL,
    SlaHours       int           NULL
);
CREATE INDEX IX_OrderRouteStep_Route_Seq ON dbo.OrderRouteStep (OrderRouteId, Sequence);

-- Send-back path of an Approval step; the last one returns to the approval
CREATE TABLE dbo.OrderRouteSendBackStep (
    Id               int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    OrderRouteStepId int           NOT NULL REFERENCES dbo.OrderRouteStep(Id) ON DELETE CASCADE,
    Sequence         int           NOT NULL,
    StatusId         int           NOT NULL REFERENCES dbo.OrderStatusMaster(ID),
    Assignee         nvarchar(150) NULL,
    SlaHours         int           NULL
);
CREATE INDEX IX_OrderRouteSendBackStep_Step_Seq ON dbo.OrderRouteSendBackStep (OrderRouteStepId, Sequence);
GO

/* ---------- Seed data ---------- */
INSERT dbo.CompanyEntity (ShortName, Name, Code, Country) VALUES
 ('SIPL','SUNDARAM INDUSTRIES PRIVATE LIMITED','SI001','INDIA'),
 ('SLTL','SUNDARAM LANKA TYRES LIMITED','SL001','SRI LANKA'),
 ('SITL','SUN INDUSTRIAL TYRES LIMITED','SI002','SRI LANKA'),
 ('STA','SUN TWS AMERICA','ST002','AMERICA');

INSERT dbo.LookupValue (Category, Code, Name, SortOrder) VALUES
 ('OrderType','EXPORT','Export',1),('OrderType','MERCHANT_EXPORT','Merchant Export',2),('OrderType','DEEMED_EXPORT','Deemed Export',3),
 ('OrderType','DOMESTIC','Domestic',4),('OrderType','SAMPLE','Sample',5),('OrderType','SPARES','Spares',6),('OrderType','STOCK_TRANSFER','Stock Transfer',7),
 ('ShipmentMode','FCL','FCL',1),('ShipmentMode','LCL','LCL',2),('ShipmentMode','AIR','Air',3),('ShipmentMode','ROAD','Road',4),('ShipmentMode','RAIL','Rail',5),('ShipmentMode','COURIER','Courier',6),
 ('Incoterm','EXW','EXW',1),('Incoterm','FCA','FCA',2),('Incoterm','FOB','FOB',3),('Incoterm','CFR','CFR',4),('Incoterm','CIF','CIF',5),
 ('Incoterm','CPT','CPT',6),('Incoterm','CIP','CIP',7),('Incoterm','DAP','DAP',8),('Incoterm','DDP','DDP',9),
 ('Country','IN','India',1),('Country','LK','Sri Lanka',2),('Country','US','United States',3),('Country','NG','Nigeria',4),('Country','KE','Kenya',5),
 ('Country','TZ','Tanzania',6),('Country','AE','UAE',7),('Country','BD','Bangladesh',8),('Country','NP','Nepal',9),('Country','GB','United Kingdom',10);

-- Sample rows: replace with your real AD codes and customers
INSERT dbo.ExportAddress (AdCode, PortName, PortCode, EntityShortName) VALUES
 ('AD0510001','Chennai Sea Port','INMAA1','SIPL'),('AD0510002','Chennai Air Cargo','INMAA4','SIPL'),
 ('AD0270003','Nhava Sheva','INNSA1','SIPL'),('AD0820004','Tuticorin','INTUT1','SIPL');
INSERT dbo.Customer (Code, Name, Country) VALUES
 ('C1001','Northwind Traders','United Kingdom'),('C1002','Contoso Motors','Kenya'),('C1003','Fabrikam Industries','UAE');

-- Dev only: fill the status master when it is empty
IF NOT EXISTS (SELECT 1 FROM dbo.OrderStatusMaster)
INSERT dbo.OrderStatusMaster (ID, StatusText, UserName, TypeID) VALUES
 (1,'ORDER RECEIVED','Nathan',1),(2,'PROFORMA GENERATED','Nathan',1),(3,'PROFORMA CONFIRMED','Nathan',1),(4,'MOVED TO PRODUCTION','Nathan',1),
 (5,'DISPATCHED','Nathan',1),(6,'CANCELLED','Nathan',1),(7,'WAITING FOR INVOICE PREPARE','Nathan',1),(8,'WAITING FOR PAYMENT CONFIRMATION','Nathan',1),
 (9,'WAITING FOR SHIPPING DOCUMENTS E-MAIL','Nathan',1),(10,'WAITING FOR DOCUMENT COURIER','Nathan',1),(11,'WAITING FOR PAYMENT RECEIVED','Nathan',1),
 (12,'WAITING FOR INVOICE RE-PREPARE','Nathan',1),(13,'WAITING FOR GST INVOICE PREPARE','Nathan',1),(14,'REQUEST FOR ORDER MASTER DETAILS REVISE','Nathan',1),
 (15,'REQUEST FOR ORDER ITEM DETAILS REVISE','Nathan',1),(16,'REQUEST FOR OTHER DETAILS REVISE','Nathan',1),(17,'WAITING FOR CRM REVISIONS','Nathan',1),
 (18,'REQUEST FOR ORDER CANCEL','Nathan',1),(19,'WAITING FOR PDI','Nathan',1),(20,'WAITING FOR VEHICLE LOADING','Nathan',1),(21,'WAITING FOR DISPATCH','Nathan',1),
 (22,'PROFORMA SENT','Nathan',1),(23,'WAITING FOR WORK ORDER PREPARE','Nathan',1),(24,'WAITING FOR PPC RFD','Nathan',1),(25,'WAITING FOR TENTATIVE SCHEDULE','Nathan',1),
 (26,'WAITING FOR ALL DEPT APPROVAL','Nathan',1),(27,'REQUEST FOR ORDER SPLIT','Nathan',1),(28,'REQUEST FOR PRICE CHANGE','Nathan',1),
 (29,'REQUEST FOR LOGISTICS REVISION','Nathan',1),(30,'REQUEST FOR PPC REVISION','Nathan',1),(31,'WAITING FOR LOGISTICS CHANGES','Nathan',1),
 (32,'WAITING FOR PPC CHANGES','Nathan',1),(33,'WAITING FOR SUBSTITUTION CONFIRMATION','Nathan',1),(34,'WAITING FOR CRM STENCIL ASSIGN','Nathan',1),
 (35,'WAITING FOR ASSIGNED STENCIL VERIFICATION','Nathan',1),(36,'WAITING FOR REVOKE THE STENCIL FROM ASSIGNED','Nathan',1),
 (37,'WAITING FOR REVOKE THE STENCIL FROM PDI REJECT','Nathan',1),(38,'WAITING FOR ACTUAL SAILING DETAILS','Nathan',1),
 (39,'WAITING FOR CONTAINER DELIVERED CONFIRMATION','Nathan',1),(40,'DISPATCHED TO FINAL LOADING','Nathan',1),(41,'WAITING FOR PPC STENCIL ASSIGN','Nathan',1),
 (42,'WAITING FOR APPROVAL TO PRODUCTION','Nathan',1),(43,'WAITING FOR TCS CONFIRMATION','Nathan',1),(44,'E-INVOICE CANCELLED','Nathan',1),
 (45,'WAITING FOR DRAFT PI PREPARE','ADMIN',1),(46,'SCANNING IN PROGRESS','ADMIN',2),(47,'PENDING DC PREPARATION','ADMIN',2),
 (48,'PENDING RECEIPT','ADMIN',2),(49,'RECEIVING IN PROGRESS','ADMIN',2),(50,'INWARD COMPLETED','ADMIN',2);
GO
