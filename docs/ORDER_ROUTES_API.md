# Order Routes — API contract

Page: `/Masters/Master-creation/order-routes` (`src/pages/Masters/MasterManagement/OrderRoutes/OrderRoutes.jsx`)
Redux: `src/Redux/Slices/Master/OrderRoutes/OrderRoutesSlice.jsx` (store key `orderRoutes`)

All calls use the shared `api` axios instance (`src/utils/axios.jsx`), so paths are relative to `VITE_BASE_URL` (for local work: `http://localhost:5300/api/`). Each call has its own switch in `MOCK` in the slice.

| Call | Path | State |
|---|---|---|
| List routes | `GET WorkFlow/workflow-rule-status` | **live** |
| Create route | `POST WorkFlow/create-workflow` | **live** |
| Entities + customers (Start Rules) | `GET /OrderProcess/customer-master` (same as Order Entry) | **live** |
| Status master | — | sample data (`data/statusMaster.js`) |
| Update route | — | not available: edits to a saved route stay in memory |
| Delete route | — | not available: hidden for the session only |

## GET WorkFlow/workflow-rule-status

```json
{
  "isSuccess": true,
  "statusCode": 200,
  "message": "Workflow rule status details retrieved successfully.",
  "data": [
    {
      "ruleHeaderID": 3,
      "workflowDescription": "WorkFlow2",
      "orderStatus": [
        { "ruleStatusID": 5, "statusName": "WAITING FOR INVOICE PREPARE", "statusMasterID": 7, "wayPointOrderID": 1 }
      ]
    }
  ]
}
```

| API field | Page |
|---|---|
| `ruleHeaderID` | route id |
| `workflowDescription` | route name |
| `orderStatus[]` sorted by `wayPointOrderID` | steps, in order |
| `statusMasterID` | step status |
| `ruleStatusID` | kept on the step |

Not returned yet, so the page shows defaults: Start Rules empty, every step a Waypoint, owner "Internal User / Direct", no SLA. If the GET starts returning `entityID`, `exportAuthorizeAddressID`, `orderTypeID`, `customerCode`, `shipID`, `billID` on each workflow, the page reads them into Start Rules automatically.

## POST WorkFlow/create-workflow

Built by `toCreateWorkflowBody()` in `helpers.js`; the page's **Export JSON** button shows the exact body.

```json
{
  "workflowDescription": "Export Order to Payment",
  "entityID": 1,
  "exportAuthorizeAddressID": 0,
  "orderTypeID": 1,
  "customerCode": 0,
  "shipID": 0,
  "billID": 0,
  "workFlowRuleStatus": [
    { "statusName": "ORDER RECEIVED", "statusMasterID": 1, "wayPointOrderID": 1 },
    { "statusName": "PROFORMA GENERATED", "statusMasterID": 2, "wayPointOrderID": 2 }
  ]
}
```

- A Start Rule left on **Any** is sent as `0`.
- `wayPointOrderID` is the step's position in the timeline (1, 2, 3…).
- Where the ids come from (`/OrderProcess/customer-master`):
  - `entityID` = `companyEntities[].entityID`
  - `exportAuthorizeAddressID` = `companyEntities[].addresses[].id`
  - `customerCode` = `customers[].custID`
  - `shipID` / `billID` = `customers[].addresses[].id` (addressType 1 = ship, 2 = bill). Picking a ship-to pre-fills its linked `billID`.
  - `orderTypeID` = 1 Standard Sales Order, 2 Sales Agreement, 3 Make-to-Stock, 4 Trial / Sample, 5 Inter-Plant Transfer (`ORDER_TYPE_OPTIONS` in `data/ruleOptions.js`).

### Needs confirming with the backend

1. **Route name.** The create contract has no name field, but the GET returns `workflowDescription`. The page sends `workflowDescription` anyway; please accept it in the create DTO, otherwise new routes have no name.
2. **Order type ids.** There is no order-type master; the ids above are an assumption.
3. **customerCode.** The page sends `custID`. If the API expects the customer's `customerCode` instead, change `id` in `mapCustomerMaster` (`data/ruleOptions.js`).
4. **Create response.** If the response includes the new `ruleHeaderID` (as `data.ruleHeaderID`), the page uses it; otherwise it reloads the list and picks the new workflow.
5. **Not stored yet:** step type (Waypoint/Task/Approval), owner, assignment, SLA and send-back paths. They work on the page but are not sent, so they are lost after a reload.
