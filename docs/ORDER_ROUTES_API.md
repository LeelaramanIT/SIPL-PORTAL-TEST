# Order Routes — API contract

Page: `/Masters/Master-creation/order-routes` (`src/pages/Masters/MasterManagement/OrderRoutes/OrderRoutes.jsx`)
Redux: `src/Redux/Slices/Master/OrderRoutes/OrderRoutesSlice.jsx` (store key `orderRoutes`)

All calls use the shared `api` axios instance (`src/utils/axios.jsx`), so paths are relative to `VITE_BASE_URL` (for local work: `http://localhost:5300/api/`). Each call has its own switch in `MOCK` in the slice.

| Call | Path | State |
|---|---|---|
| List routes | `GET WorkFlow/workflow-rule-status` | **live** |
| Create route | `POST WorkFlow/create-workflow` | **live** |
| Status master + all Start Rules lists | `GET WorkFlow/workflow-details` | **live** |
| Add steps to a saved route | `POST WorkFlow/insert-workflow-status` | **live** |
| Other edits to a saved route (name, start rules, reorder, remove, change a step's status) | — | not available: kept in memory, listed in a message after Save |
| Delete route | — | not available: hidden for the session only |

## GET WorkFlow/workflow-details

One call for everything the editor needs to pick from. Loaded before the route list. Mapped by `normalizeStatuses()` (`data/statusMaster.js`) and `mapWorkflowDetails()` (`data/ruleOptions.js`).

| API list | Page | Used for |
|---|---|---|
| `orderStatuses[]` `{ id, statusText }` | status library + step status picker | `statusMasterID` |
| `legalEntities[]` `{ legalEntityId, entityCode, legalName, shortName }` | Entity | `entityID` = `legalEntityId` |
| `legalEntityAddresses[]` `{ legalEntityAddressId, addressName, address }` | Export authorised address | `exportAuthorizeAddressID` = `legalEntityAddressId` |
| `orderTypes[]` `{ orderTypeID, orderTypeName }` | Order type | `orderTypeID` |
| `customers[]` `{ customerID, custCode, custFullName }` | Customer | `customerCode` = `customerID` |
| `shipAddresses[]` (empty so far) | Ship-to / Bill-to | `shipID` / `billID` |

- **Status type.** `orderStatuses` has no TypeID, so the page uses the known split: 1–45 Sales Order, 46–50 Inward. Send `typeId` on each status and the page uses it instead, so new statuses are grouped correctly.
- **Export addresses are not linked to an entity.** All of them are offered whatever entity is picked. Add `legalEntityId` to each address and the list filters by the chosen entity automatically.
- **Ship / bill addresses.** The sample returns `shipAddresses: []`, so Ship-to and Bill-to show "No addresses loaded". The page reads each address as `{ shipAddressId (or addressId / id), customerID, addressName, address, city, stateName, country, billID, addressType }`, where `addressType` 2 = bill-to and anything else is ship-to, and `customerID` filters by the chosen customer. Tell us the real field names when this list is filled.
- If the call fails, the page falls back to the sample statuses and the four entities, and shows an error.

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

## POST WorkFlow/insert-workflow-status

Used when you press **Save** on a route that already exists on the server. It sends only the steps added since the last save (via **+ Add step here**, **+ Add step**, the status library, or **Duplicate**). Built by `toInsertStatusBody()` in `helpers.js`.

```json
{
  "ruleHeaderID": 3,
  "workFlows": [
    { "statusName": "WAITING FOR DISPATCH", "statusMasterID": 21, "wayPointOrderID": 3 }
  ]
}
```

- `wayPointOrderID` is the new step's position in the timeline after the insert. A step added between steps 2 and 3 is sent as `3`.
- **The backend must shift the existing steps** at that position and after it (old 3 → 4, 4 → 5 …). If it doesn't, two steps end up with the same `wayPointOrderID`.
- A step counts as new when it has no `ruleStatusID` from the GET. After a successful save the page reloads the list, so the new steps get their `ruleStatusID` and aren't sent twice.

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
- The ids come from `WorkFlow/workflow-details` (table above). Picking a ship-to pre-fills its linked `billID`.

### Needs confirming with the backend

1. **Route name.** The create contract has no name field, but the GET returns `workflowDescription`. The page sends `workflowDescription` anyway; please accept it in the create DTO, otherwise new routes have no name.
2. **customerCode.** The page sends the number `customerID` (e.g. 6204). It doesn't send `custCode`, because `custCode` isn't unique: `DE0048` is both ABC Engineering and BALAJI ENTERPRISES. If the API needs the code instead, change `id` in `mapWorkflowDetails` (`data/ruleOptions.js`).
3. **Ship / bill addresses.** `shipAddresses` is empty, and there is no separate bill-to list. See the workflow-details section above.
4. **Create response.** If the response includes the new `ruleHeaderID` (as `data.ruleHeaderID`), the page uses it; otherwise it reloads the list and picks the new workflow.
5. **Not stored yet:** step type (Waypoint/Task/Approval), owner, assignment, SLA and send-back paths. They work on the page but are not sent, so they are lost after a reload.
