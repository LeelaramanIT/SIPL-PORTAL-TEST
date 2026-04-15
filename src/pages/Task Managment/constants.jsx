export const STATUS_COLOR = {
  ACTIVE:"#10B981", PLANNING:"#3B82F6", ON_HOLD:"#F59E0B",
  COMPLETED:"#10B981", CANCELLED:"#EF4444",
  DONE:"#10B981", IN_PROGRESS:"#3B82F6", IN_REVIEW:"#8B5CF6",
  TESTING:"#F59E0B", TODO:"#64748B", BLOCKED:"#EF4444", NOT_STARTED:"#64748B",
};

export const STATUS_BG = {
  ACTIVE:"#052E16", PLANNING:"#1E3A5F", DONE:"#052E16",
  IN_PROGRESS:"#1E3A5F", IN_REVIEW:"#2E1065", TESTING:"#451A03",
  TODO:"#1E293B", BLOCKED:"#450A0A", NOT_STARTED:"#1E293B",
  ON_HOLD:"#451A03", CANCELLED:"#450A0A",
};

export const PRIORITY_COLOR = {
  CRITICAL:"#EF4444", HIGH:"#F59E0B", MEDIUM:"#3B82F6", LOW:"#64748B",
};

export const NAV = [
  { id:"dashboard", label:"Dashboard", icon:"◈" },
  { id:"projects",  label:"Projects",  icon:"⬡" },
  { id:"sprints",   label:"Sprints",   icon:"↻" },
  { id:"tasks",     label:"Tasks",     icon:"☰" },
  { id:"dailylog",  label:"Daily log", icon:"◷" },
  { id:"team",      label:"Team",      icon:"◎" },
  { id:"reports",   label:"Reports",   icon:"▦" },
  { id:"masters",   label:"Masters",   icon:"⚙" },
];

export const STATUS_DATA = [
  { module:"PROJECT", code:"PLANNING",    name:"Planning",    order:1 },
  { module:"PROJECT", code:"ACTIVE",      name:"Active",      order:2 },
  { module:"PROJECT", code:"COMPLETED",   name:"Completed",   order:4 },
  { module:"TASK",    code:"TODO",        name:"To do",       order:1 },
  { module:"TASK",    code:"IN_PROGRESS", name:"In progress", order:2 },
  { module:"TASK",    code:"DONE",        name:"Done",        order:5 },
  { module:"TASK",    code:"BLOCKED",     name:"Blocked",     order:6 },
  { module:"SPRINT",  code:"ACTIVE",      name:"Active",      order:2 },
  { module:"SPRINT",  code:"COMPLETED",   name:"Completed",   order:3 },
];

export const PRIORITY_DATA = [
  { code:"CRITICAL", name:"Critical", order:1 },
  { code:"HIGH",     name:"High",     order:2 },
  { code:"MEDIUM",   name:"Medium",   order:3 },
  { code:"LOW",      name:"Low",      order:4 },
];

export const TASKTYPE_DATA = [
  "FEATURE","BUG","ENHANCEMENT","TESTING",
  "MEETING","SUPPORT","REVIEW","DOCUMENTATION",
];
