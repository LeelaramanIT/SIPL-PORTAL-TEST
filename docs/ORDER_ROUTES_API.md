# Order Routes — API contract

Page: `/Masters/Master-creation/order-routes` (`src/pages/Masters/MasterManagement/OrderRoutes/OrderRoutes.jsx`)
Redux: `src/Redux/Slices/Master/OrderRoutes/OrderRoutesSlice.jsx` (store key `orderRoutes`)

All calls use the shared `api` axios instance (`src/utils/axios.jsx`), so paths are relative to `VITE_BASE_URL` (for local work: `http://localhost:5300/api/`). Nothing on the page is hardcoded: every list comes from these calls.

Calls go through the service layer `src/Redux/Slices/Master/OrderRoutes/workflowApi.js`.

| Call | Path | Save type |
|---|---|---|
| Status master + all Start Rules lists | `GET WorkFlow/workflow-details` | — |
| List routes | `GET WorkFlow/workflow-rule-status` | — |
| Create route | `POST WorkFlow/create-workflow` | 1 |
| Add steps to a saved route | `POST WorkFlow/insert-workflow-status` | 2 |
| Switch a saved step on / off, or delete it | `PATCH WorkFlow/workflow-status-active-inactive` `{ ruleStatusID, isActive, isDeleted }` | 3 |
| Save the step order | `PUT WorkFlow/update-workflow-status-order` | 4 |
| Rename, change start rules, switch the whole workflow on/off | `PUT WorkFlow/modify-workflow-configuration` | 5 |
| Delete route | `PUT WorkFlow/modify-workflow-configuration` with `isDelete: true` | — |
| Change a saved step's status | — | not available: kept in memory and listed after Save |

## Save

`planSave()` in the slice picks the calls from the route's state; `saveOrderRoute()` runs them.

| What changed | Calls, in order |
|---|---|
| New route (no `ruleHeaderID`) | 1 `create-workflow` with the full ordered list. Blocked before any call only when an active workflow already has exactly the same combination of set and empty fields (the server answers 409 for that too). All six rules on Any is allowed: that is the **default workflow**. |
| Steps added to a saved route | 2 `insert-workflow-status` with only the new steps at their positions, then 4 `update-workflow-status-order` with the full ordered list |
| Steps reordered | 4 `update-workflow-status-order` with the full ordered list |
| **Delete step** on a saved step | Called **immediately** (no Save needed): 3 `workflow-status-active-inactive` with `{ ruleStatusID, isActive: false, isDeleted: true }`, then 4 `update-workflow-status-order` renumbers the remaining saved steps 1, 2, 3… in the server's order, then the list reloads. Unsaved edits on the route (name, rules, new steps) stay unsaved. The last remaining step cannot be deleted (delete the route instead). |
| Active switch changed | 3 `workflow-status-active-inactive` with `{ ruleStatusID, isActive, isDeleted: false }`, one call per changed step |
| Name, a start rule, or the route's Active/Inactive changed | 5 `modify-workflow-configuration` with only the changed fields (`workflowDescription`, the changed ids, `isActive`); blocked first if the new rules match another active workflow |
| Several of the above | deletes → 2 → 4 → 3 → 5, stopping at the first failure |
| New route saved as Inactive | 1 `create-workflow`, then 5 with `isActive: false` |

## PUT WorkFlow/modify-workflow-configuration

`{ ruleHeaderID, isDelete?, isActive?, entityID?, exportAuthorizeAddressID?, orderTypeID?, customerCode?, shipID?, billID?, workflowDescription? }` — every field except `ruleHeaderID` is optional; a missing field means "leave as is". Built by `toModifyHeaderBody()` in `helpers.js`. Delete sends `{ ruleHeaderID, isDelete: true }`.

- **A rule set to Any is sent as `0`**, exactly like on create; only rules that changed are sent. Example after setting Ship-to and Bill-to to Any on route 10:
  `{ "ruleHeaderID": 10, "shipID": 0, "billID": 0 }`
- **Backend:** `ModifyWorkflowConfigurationAsync` no longer rejects `0` (the `> 0` check at `WorkFlowService.cs:1060-1074` is commented out as of 2026-11-16); the stored procedure must treat `0` as "clear the rule". If it still answers "IDs must be greater than zero", the page adds a hint to the message.
- The server also needs at least one field, and a description of 1–500 characters. A route may have all rules on Any (the default workflow); the page only refuses a second *active* default.
- The GET has no header `isActive`, so a workflow switched off shows as Active again after a reload (the page remembers it for the session only). Please return `isActive` per workflow in `workflow-rule-status`.
- **Delete is soft and the GET still returns deleted workflows** (checked 2026-11-16: header 8 came back after `isDelete: true`). The page hides them for the session; after a reload they reappear. Please filter deleted headers out of `sp_GetWorkflowRuleStatus` (or return `isDelete` so the page can).
- The GET also hides steps switched off with save type 3, leaving gaps in `wayPointOrderID` (e.g. 1, 3). The page compares step order by sequence, so a gap alone does not trigger a reorder call.

- `wayPointOrderID` is always the timeline position, 1, 2, 3… with no gaps, recalculated on every save.
- Calls stop at the first failure. Steps that already reached the server keep their new ids, so saving again does not insert them twice.
- Save is disabled while a request is running.
- A response counts as failed when `isSuccess` is `false` (or the HTTP status is not 2xx). The body's `status` flag is ignored: the live API returns `status: false` on successful responses.
- Success and error toasts show the API's `message`. ASP.NET validation errors (`title` + `errors`) are shown too.
- After any successful call the workflow list is reloaded.
- An `insert-workflow-status` row with `statusCode` ≥ 400 counts as a failure.

## GET WorkFlow/workflow-details

One call for everything the editor needs to pick from. Loaded before the route list. Mapped by `normalizeStatuses()` (`data/statusMaster.js`) and `mapWorkflowDetails()` (`data/ruleOptions.js`).

| API list | Page | Used for |
|---|---|---|
| `orderStatuses[]` `{ id, statusText }` | status library + step status picker | `statusMasterID` |
| `legalEntities[]` `{ legalEntityId, entityCode, legalName, shortName }` | Entity | `entityID` = `legalEntityId` |
| `legalEntityAddresses[]` `{ legalEntityAddressId, addressName, address }` | Export authorised address | `exportAuthorizeAddressID` = `legalEntityAddressId` |
| `orderTypes[]` `{ orderTypeID, orderTypeName }` | Order type | `orderTypeID` |
| `customers[]` `{ customerID, custCode, custFullName }` | Customer | `customerCode` = `customerID` |
| `shipAddresses[]` `{ shipID, companyName }` (3,592 rows on 2026-11-16) | Ship-to | `shipID` |
| `billAddresses[]` `{ billID, companyName }` (2,280 rows, only 1,254 distinct `billID`: duplicates are dropped, first wins) | Bill-to | `billID` |

- **Status type.** Send `typeId` on each status and a `statusTypes[]` list `{ typeId, typeName }`. The type picker and the status library filter use them. Until they are sent, there is no type picker and every status is offered for every route.
- **Export addresses are not linked to an entity.** All of them are offered whatever entity is picked. Add `legalEntityId` to each address and the list filters by the chosen entity automatically.
- **Ship / bill addresses.** Both lists are now returned and shown as dropdowns (if a list ever comes back empty the editor falls back to a number field for the id; empty = Any). The rows carry no `customerID`, so every address is offered for every customer and changing the customer keeps the chosen addresses. Add `customerID` to each row and the lists filter by the chosen customer (and an address not belonging to the new customer is dropped); add `billID` to a ship row to pre-fill the bill-to. With ~3,600 ship rows the rules panel takes about a second to open; a customer-filtered list would fix that too.
- If the call fails, the lists stay empty and the page shows an error.

## GET WorkFlow/workflow-rule-status

```json
{
  "isSuccess": true,
  "statusCode": 200,
  "message": "Workflow rule status details retrieved successfully.",
  "data": [
    {
      "ruleHeaderID": 2,
      "workflowDescription": "WorkFlow1",
      "entityID": 1,
      "entityName": "SUNDARAM INDUSTRIES PRIVATE LIMITED",
      "customerCode": 2669,
      "customerName": null,
      "orderTypeID": 1,
      "orderTypeName": "Standard Sales Order",
      "shipID": 1,
      "shipAddress": null,
      "billID": 2,
      "billAddress": "D-14 SOUTH SIDE, B-BLOCK ,~AUTO NAGAR, CANARA BANK ROAD, VISHAKAPATNAM - 530012",
      "exportAuthorizeAddressID": 0,
      "exportAddress": "  ",
      "orderStatus": [
        { "ruleStatusID": 10, "statusName": "WAITING FOR INVOICE PREPARE", "statusMasterID": 7, "wayPointOrderID": 1 }
      ]
    }
  ]
}
```

| API field | Page |
|---|---|
| `ruleHeaderID` | route id |
| `workflowDescription` | route name |
| `entityID`, `exportAuthorizeAddressID`, `orderTypeID`, `customerCode`, `shipID`, `billID` | Start Rules (`0` = Any) |
| `entityName`, `exportAddress`, `orderTypeName`, `customerName`, `shipAddress`, `billAddress` | label for that rule when its id is not in the `workflow-details` lists (`~` in addresses shown as a space; blank/null falls back to `#id`) |
| `orderStatus[]` sorted by `wayPointOrderID` | steps, in order |
| `statusMasterID` | step status |
| `ruleStatusID` | kept on the step |

Not returned yet, so the page shows defaults: every step a Waypoint, owner "Internal User / Direct", no SLA.

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

- **Start Rules: any combination of the six fields, including none.** `CreateWorkflowRequestDto` keeps the six ids as non-nullable `long`, so a rule on Any is sent as **`0`**. **All six on Any (all `0`) is the default workflow**: the fallback used when no more specific workflow matches the order. Rules for the backend / order process:
  - Matching at runtime: the matching workflow with the **most set fields** wins; the default (0 set fields) matches every order, so it only wins when nothing more specific matches. Tie-break between equally specific workflows: lowest `ruleHeaderID` (or your choice; the page does not depend on it).
  - Only **one active default** is allowed. The page refuses a second one ("A default workflow … is already active") and the stored procedure should answer 409 for it, comparing null-safely (`ISNULL(col, 0) = ISNULL(@param, 0)`) against active headers only. An Inactive default does not conflict.
  - Stored value: `0` or NULL for "Any", as long as `sp_GetWorkflowRuleStatus` returns the same thing the page sent (the page reads both `0` and `null` as Any).
  - The service checks that rejected a `0` (`WorkFlowService.cs:198-206` and `1060-1074`) are commented out as of 2026-11-16. Note that the create check also covered `request == null` and "at least one status": with it commented out an empty `WorkFlowRuleStatus` is accepted and a null list throws at the `.Any(...)` in step 2. The page always sends at least one step, but keep that guard server-side (`request == null || request.WorkFlowRuleStatus == null || Count == 0`).
- Each `statusName` must be non-blank and ≤ 150 characters, `statusMasterID` and `wayPointOrderID` > 0, and no two steps may share a `wayPointOrderID`. A duplicate combination of the six ids returns 409.
- `wayPointOrderID` is the step's position in the timeline (1, 2, 3…).
- The ids come from `WorkFlow/workflow-details` (table above). Picking a ship-to pre-fills its linked `billID`.

### Needs confirming with the backend

1. **Route name.** `CreateWorkflowRequestDto.WorkflowDescription` is accepted since 2026-11-16 and stored by `SP_CreateWorkflow`; the page sends the trimmed route name and requires it to be non-empty. Routes created before that show as "Untitled order route". There is still no API to rename a saved route.
2. **customerCode.** The page sends the number `customerID` (e.g. 6204). It doesn't send `custCode`, because `custCode` isn't unique: `DE0048` is both ABC Engineering and BALAJI ENTERPRISES. If the API needs the code instead, change `id` in `mapWorkflowDetails` (`data/ruleOptions.js`).
3. **Ship / bill addresses.** `shipAddresses` is empty and there is no bill-to list, so users must type those ids when they want to set them. Please fill `shipAddresses` and add a `billAddresses` list (see the workflow-details section above).
4. **Active flag in the GET.** `orderStatus[]` has no `isActive`, so after a reload every step looks active. Please return `isActive` on each row.
5. **Create response.** The page uses `data.ruleHeaderID` and warns when `data.totalStatusInserted` is lower than the number of steps sent.
6. **Not stored yet:** step type (Waypoint/Task/Approval), owner, assignment, SLA and send-back paths. They work on the page but are not sent, so they are lost after a reload.
