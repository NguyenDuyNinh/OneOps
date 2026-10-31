import { Module } from "@nestjs/common";
import { WorkspaceTodayModule } from "./coordination/workspace-today/index.js";
import { TasksModule } from "./work/tasks/index.js";
import { TaskWorkflowModule } from "./work/task-workflow/index.js";
import { TaskCommentsModule } from "./work/task-comments/index.js";
import { ProjectSpacesModule } from "./projects/project-spaces/index.js";
import { MilestonesQaModule } from "./projects/milestones-qa/index.js";
import { TimesheetsModule } from "./projects/timesheets/index.js";
import { CalendarModule } from "./coordination/workspace-today/calendar/index.js";
import { TicketsApprovalsModule } from "./coordination/tickets-approvals/index.js";
import { InternalChatModule } from "./coordination/internal-chat/index.js";
import { NotificationsModule } from "./coordination/notifications/index.js";
import { KnowledgeSopModule } from "./coordination/knowledge-sop/index.js";
import { ReportsModule } from "./coordination/workspace-today/reports/index.js";
import { WorkspaceInsightsModule } from "./work-management.insights.module.js";
import {
  QaGateComposition,
  QaTaskRefComposition,
  TaskCommentSinkComposition,
  TaskSnapshotComposition,
  TaskStateComposition,
  TimesheetTaskRefComposition,
} from "./work-management.composition.js";

// Declared once and imported twice: the workflow needs the comment and QA
// modules in its own injector, and this module needs them on their own.
const taskComments = TaskCommentsModule.forRoot({
  tasks: TaskSnapshotComposition,
  imports: [TasksModule],
});
const milestonesQa = MilestonesQaModule.forRoot({
  tasks: QaTaskRefComposition,
  imports: [TasksModule],
});
const timesheets = TimesheetsModule.forRoot({
  tasks: TimesheetTaskRefComposition,
  imports: [TasksModule],
});
const taskWorkflow = TaskWorkflowModule.forRoot({
  tasks: TaskStateComposition,
  comments: TaskCommentSinkComposition,
  qa: QaGateComposition,
  imports: [TasksModule, taskComments, milestonesQa],
});

@Module({
  imports: [
    WorkspaceTodayModule,
    TasksModule,
    taskComments,
    taskWorkflow,
    ProjectSpacesModule,
    milestonesQa,
    timesheets,
    CalendarModule,
    TicketsApprovalsModule,
    InternalChatModule,
    NotificationsModule,
    KnowledgeSopModule,
    ReportsModule,
    WorkspaceInsightsModule,
  ],
})
export class WorkManagementModule {}
