export const USERS = [
  { id:1, name:"Kannan",     role:"BACKEND",       initials:"KA", color:"#3B82F6" },
  { id:2, name:"Leelaraman", role:"BACKEND",       initials:"LE", color:"#8B5CF6" },
  { id:3, name:"Kaja",       role:"FRONTEND",      initials:"KJ", color:"#10B981" },
  { id:4, name:"Harish",     role:"DBA DEVELOPER", initials:"HA", color:"#F59E0B" },
];

export const PROJECTS = [
  { id:1, code:"TTS",    name:"TTS System v2",  type:"NEW DEV",     priority:"HIGH",   status:"ACTIVE",   pct:62, start:"01 Apr 2025", end:"30 Sep 2025" },
  { id:2, code:"MOBILE", name:"Mobile App",     type:"NEW DEV",     priority:"MEDIUM", status:"PLANNING", pct:5,  start:"01 Jun 2025", end:"31 Dec 2025" },
  { id:3, code:"RPT",    name:"Report Module",  type:"ENHANCEMENT", priority:"LOW",    status:"PLANNING", pct:0,  start:"01 Aug 2025", end:"31 Oct 2025" },
];

export const MODULES = [
  { id:1, pid:1, name:"Earmark module",       status:"IN_PROGRESS", pct:75, order:1 },
  { id:2, pid:1, name:"PDI module",           status:"IN_PROGRESS", pct:30, order:2 },
  { id:3, pid:1, name:"Dispatch module",      status:"NOT_STARTED", pct:0,  order:3 },
  { id:4, pid:1, name:"Management dashboard", status:"IN_PROGRESS", pct:40, order:4 },
  { id:5, pid:1, name:"Project management",   status:"IN_PROGRESS", pct:55, order:5 },
];

export const SPRINTS = [
  { id:1, pid:1, mid:1, name:"Sprint 1 — Earmark API",  status:"ACTIVE",   start:"01 Apr", end:"14 Apr", total:21, done:15 },
  { id:2, pid:1, mid:2, name:"Sprint 2 — PDI module",   status:"PLANNING", start:"15 Apr", end:"28 Apr", total:18, done:0  },
  { id:3, pid:1, mid:4, name:"Sprint 3 — Dashboard",    status:"PLANNING", start:"29 Apr", end:"12 May", total:13, done:0  },
];

export const TASKS_DATA = [
  { id:1, code:"TTS-001", title:"SP optimisation — stock part wise",       sprint:1, assignedTo:1, priority:"HIGH",     status:"DONE",        type:"FEATURE",     est:4, actual:4.5, due:"03 Apr", pid:1, mid:1 },
  { id:2, code:"TTS-002", title:"Earmark initial load combined SP",         sprint:1, assignedTo:1, priority:"HIGH",     status:"IN_PROGRESS", type:"FEATURE",     est:6, actual:3.0, due:"07 Apr", pid:1, mid:1 },
  { id:3, code:"TTS-003", title:"Stencil verification UI serial check",     sprint:1, assignedTo:3, priority:"HIGH",     status:"IN_REVIEW",   type:"FEATURE",     est:6, actual:6.0, due:"10 Apr", pid:1, mid:1 },
  { id:4, code:"TTS-004", title:"PDI scan module — barcode list API",       sprint:1, assignedTo:2, priority:"CRITICAL", status:"BLOCKED",     type:"FEATURE",     est:8, actual:2.0, due:"08 Apr", pid:1, mid:2 },
  { id:5, code:"TTS-005", title:"Dashboard charts — Recharts integration",  sprint:1, assignedTo:3, priority:"MEDIUM",   status:"TODO",        type:"FEATURE",     est:5, actual:0,   due:"14 Apr", pid:1, mid:4 },
  { id:6, code:"TTS-006", title:"Redis cache — master data layer",          sprint:1, assignedTo:1, priority:"MEDIUM",   status:"TODO",        type:"ENHANCEMENT", est:3, actual:0,   due:"14 Apr", pid:1, mid:1 },
  { id:7, code:"TTS-007", title:"DB index review + query plan analysis",    sprint:1, assignedTo:4, priority:"MEDIUM",   status:"DONE",        type:"REVIEW",      est:3, actual:3.5, due:"05 Apr", pid:1, mid:1 },
];

export const LOGS = [
  { id:1, userId:1, taskId:2, date:"Today", type:"TIMED",  hours:3.0, desc:"Built GetInitialLoadAsync with QueryMultiple" },
  { id:2, userId:1, taskId:1, date:"Today", type:"TIMED",  hours:2.5, desc:"SP optimisation — 6 queries to 1 CTE" },
  { id:3, userId:3, taskId:3, date:"Today", type:"TIMED",  hours:6.0, desc:"Stencil serial verification UI complete" },
  { id:4, userId:2, taskId:4, date:"Today", type:"MANUAL", hours:2.0, desc:"PDI scan research — schema analysis" },
  { id:5, userId:4, taskId:7, date:"Today", type:"MANUAL", hours:3.5, desc:"DB indexes reviewed, query plans documented" },
];

export const BLOCKERS = [
  { id:1, taskId:4, taskCode:"TTS-004", reportedBy:2, reason:"Dependency not ready", desc:"pdi_scanmasterdata schema not finalised — cannot build API", status:"OPEN", reportedOn:"Today" },
];

export const EOD = [
  { userId:1, done:"SP done, Earmark API 70% built", tomorrow:"Finish earmark API + start Redis cache", hours:6.5, submitted:true  },
  { userId:2, done:"PDI research done",               tomorrow:"Start PDI API once schema confirmed",    hours:2.0, submitted:true  },
  { userId:3, done:"Stencil UI complete",             tomorrow:"Fix review comments from Kannan",        hours:6.0, submitted:true  },
  { userId:4, done:"",                                tomorrow:"",                                       hours:0,   submitted:false },
];

export const getProgressColor = (pct) => {
    if (pct >= 100) return '#10B981'; // Success Green
    if (pct >= 75)  return '#8B5CF6'; // Violet
    if (pct >= 50)  return '#3B82F6'; // Sky Blue
    if (pct >= 25)  return '#F59E0B'; // Amber/Orange
    return '#EF4444';                // Danger Red
  };