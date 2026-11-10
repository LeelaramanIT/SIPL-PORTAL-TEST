// Example routes shown while MOCK.list is true in OrderRoutesSlice.
import { emptyRules } from "./ruleOptions";
import { newSendBack, newStep } from "../helpers";

export const buildSampleRoutes = () => [
  {
    id: "sample_export",
    name: "Export Order to Payment",
    status: "Active",
    statusTypeId: 1,
    rules: { ...emptyRules(), entityId: 1, orderTypeId: 1 },
    steps: [
      newStep("waypoint", 1, { assignee: "CRM desk", slaHours: 4 }),
      newStep("task", 45, { assignment: "Round Robin", assignee: "CRM team", slaHours: 8 }),
      newStep("waypoint", 2, { assignee: "CRM desk", slaHours: 4 }),
      newStep("waypoint", 22, { assignee: "CRM desk", slaHours: 2 }),
      newStep("waypoint", 3, { assigneeType: "Customer", assignee: "Buyer contact", slaHours: 48 }),
      newStep("task", 23, { assignee: "Production planning", slaHours: 8 }),
      newStep("approval", 26, {
        assignment: "Round Robin",
        assignee: "Department heads",
        slaHours: 24,
        sendBack: [newSendBack(29, "Logistics"), newSendBack(31, "Logistics")],
      }),
      newStep("waypoint", 4, { assignee: "Production planning", slaHours: 8 }),
      newStep("task", 24, { assignee: "PPC", slaHours: 72 }),
      newStep("approval", 19, { assignee: "Quality · PDI", slaHours: 24, sendBack: [newSendBack(37, "PPC")] }),
      newStep("task", 7, { assignment: "Round Robin", assignee: "Accounts", slaHours: 8 }),
      newStep("task", 43, { assignee: "Accounts", slaHours: 4 }),
      newStep("task", 20, { assigneeType: "Service Provider", assignee: "Transporter", slaHours: 24 }),
      newStep("waypoint", 5, { assignee: "Logistics", slaHours: 2 }),
      newStep("task", 9, { assignee: "Logistics", slaHours: 24 }),
      newStep("task", 10, { assigneeType: "Service Provider", assignee: "Courier partner", slaHours: 72 }),
      newStep("waypoint", 11, { assignee: "Accounts", slaHours: 720 }),
    ],
  },
  {
    id: "sample_inward",
    name: "Inward Receipt",
    status: "Draft",
    statusTypeId: 2,
    rules: { ...emptyRules(), entityId: 2, orderTypeId: 5 },
    steps: [
      newStep("waypoint", 48, { assignee: "Stores", slaHours: 24 }),
      newStep("waypoint", 49, { assignment: "Round Robin", assignee: "Stores team", slaHours: 8 }),
      newStep("task", 46, { assignee: "Scanning desk", slaHours: 4 }),
      newStep("task", 47, { assignee: "Stores admin", slaHours: 4 }),
      newStep("waypoint", 50, { assignee: "Stores", slaHours: 2 }),
    ],
  },
];
