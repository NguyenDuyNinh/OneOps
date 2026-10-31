import { definition as dashboard } from "@/features/work-management/coordination/workspace-today/index";
import { definition as tasks } from "@/features/work-management/work/tasks/index";
import { definition as projects } from "@/features/work-management/projects/project-spaces/index";
import { definition as milestones } from "@/features/work-management/projects/milestones-qa/index";
import { definition as timesheets } from "@/features/work-management/projects/timesheets/index";
import { definition as calendar } from "@/features/work-management/coordination/workspace-today/calendar/index";
import { definition as requests } from "@/features/work-management/coordination/tickets-approvals/index";
import { definition as messages } from "@/features/work-management/coordination/internal-chat/index";
import { definition as notes } from "@/features/work-management/coordination/knowledge-sop/index";
import { definition as notifications } from "@/features/work-management/coordination/notifications/index";
import { definition as reports } from "@/features/work-management/coordination/workspace-today/reports/index";
import { definition as organization } from "@/features/hr-management/organization/departments-teams/index";
import { definition as positions } from "@/features/hr-management/organization/positions-grades/index";
import { definition as employees } from "@/features/hr-management/employees/employee-directory/index";
import { definition as accounts } from "@/features/tenant-system/access-control/accounts/index";
import { definition as permissions } from "@/features/tenant-system/access-control/roles-permissions/index";
import { definition as checklog } from "@/features/tenant-system/checklog/index";
export const modules = [
  dashboard,
  tasks,
  projects,
  milestones,
  timesheets,
  calendar,
  requests,
  messages,
  notes,
  notifications,
  reports,
  organization,
  positions,
  employees,
  accounts,
  permissions,
  checklog,
];
const pageAliases: Record<string, string> = {
  "work-management/kanban": "work-management/tasks",
};
export const getModule = (id: string) =>
  modules.find((module) => module.id === (pageAliases[id] || id));
