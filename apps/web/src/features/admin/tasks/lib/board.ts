import { INITIAL_TASKS } from "../mocks";
import type {
  ComputedDepartmentRow,
  DepartmentReportRow,
  EisenhowerTab,
  KanbanColumnId,
  PriorityFilter,
  SubTask,
  TaskItem,
  TaskStatus,
} from "../types";

export function toggleTaskCompletion(tasks: TaskItem[], taskId: string): TaskItem[] {
  return tasks.map((task) => {
    if (task.id !== taskId) return task;
    const nextStatus: TaskStatus = task.status === "completed" ? "todo" : "completed";
    return {
      ...task,
      status: nextStatus,
      progress: nextStatus === "completed" ? 100 : 0,
      overdue: nextStatus === "completed" ? false : task.overdue,
    };
  });
}

export function toggleTaskPriority(
  tasks: TaskItem[],
  taskId: string,
  field: "urgent" | "important",
): TaskItem[] {
  return tasks.map((task) => {
    if (task.id !== taskId) return task;
    return {
      ...task,
      [field]: !task[field],
    };
  });
}

export function moveTaskToColumn(
  tasks: TaskItem[],
  taskId: string,
  targetColumn: KanbanColumnId,
): TaskItem[] {
  return tasks.map((task) => {
    if (task.id !== taskId) return task;
    let nextProgress = task.progress;
    if (targetColumn === "todo") nextProgress = 0;
    else if (
      targetColumn === "in_progress" &&
      (task.progress === 0 || task.progress === 100)
    ) {
      nextProgress = 45;
    } else if (
      targetColumn === "review" &&
      (task.progress < 75 || task.progress === 100)
    ) {
      nextProgress = 80;
    } else if (targetColumn === "completed") {
      nextProgress = 100;
    }

    return {
      ...task,
      status: targetColumn,
      progress: nextProgress,
      overdue: targetColumn === "completed" ? false : task.overdue,
    };
  });
}

export function createTaskInColumn(
  tasks: TaskItem[],
  columnId: KanbanColumnId,
  title: string,
  urgent: boolean = true,
  important: boolean = true,
): TaskItem[] {
  const trimmed = title.trim();
  if (!trimmed) return tasks;

  const progress =
    columnId === "completed"
      ? 100
      : columnId === "review"
        ? 80
        : columnId === "in_progress"
          ? 40
          : 0;

  const newTask: TaskItem = {
    id: `task-${Date.now()}-${tasks.length + 1}`,
    title: trimmed,
    dueDate: "30/11/2023",
    startDate: "25/11/2023",
    createdAt: "10:00 25/11/2023",
    updatedAt: "10:00 25/11/2023",
    urgent,
    important,
    overdue: false,
    status: columnId,
    progress,
    project: "DỰ ÁN TĂNG TRƯỞNG",
    stage: columnId === "review" ? "CHỜ DUYỆT" : "TRIỂN KHAI",
    departmentId: "du_an_tang_truong",
    metaText: "Dự án: DỰ ÁN TĂNG TRƯỞNG · K...",
    description: "",
    assignee: {
      name: "Nguyễn Hoàng Long",
      role: "Phó Giám đốc",
      avatar: "male_dark_hair",
    },
    assigner: {
      name: "Trần Tuấn Anh Nghĩa",
      role: "Giám đốc",
      avatar: "male_suit",
    },
    followers: [
      {
        name: "Trần Tuấn Anh Nghĩa",
        role: "Giám đốc",
        avatar: "male_suit",
      },
    ],
    widgetGroup: urgent ? "urgent_important" : "growth_project",
    subtasks: [],
  };

  return [newTask, ...tasks];
}

export function addSubTaskToTask(
  tasks: TaskItem[],
  taskId: string,
  subtaskTitle: string,
): TaskItem[] {
  const trimmed = subtaskTitle.trim();
  if (!trimmed) return tasks;
  return tasks.map((task) => {
    if (task.id !== taskId) return task;
    const newSub: SubTask = {
      id: `sub-${Date.now()}-${task.subtasks.length + 1}`,
      title: trimmed,
      completed: false,
      assigneeName: task.assignee.name,
    };
    return {
      ...task,
      subtasks: [...task.subtasks, newSub],
    };
  });
}

export function filterTasksForWidget(
  tasks: TaskItem[],
  widgetGroup: "urgent_important" | "growth_project",
  searchQuery: string,
  activeTab: EisenhowerTab | string,
): TaskItem[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  return tasks.filter((task) => {
    if (widgetGroup === "urgent_important") {
      if (activeTab === "urgent_important" && !(task.urgent && task.important)) {
        return false;
      }
      if (activeTab === "urgent_not_important" && !(task.urgent && !task.important)) {
        return false;
      }
      if (activeTab === "not_urgent_important" && !(!task.urgent && task.important)) {
        return false;
      }
    } else if (task.widgetGroup !== widgetGroup && task.widgetGroup !== "both") {
      return false;
    }

    if (!normalizedQuery) return true;
    return (
      task.title.toLowerCase().includes(normalizedQuery) ||
      task.project.toLowerCase().includes(normalizedQuery) ||
      task.assignee.name.toLowerCase().includes(normalizedQuery)
    );
  });
}

export function filterTasksForKanbanColumn(
  tasks: TaskItem[],
  columnId: KanbanColumnId,
  searchQuery: string,
  priorityFilter: PriorityFilter,
): TaskItem[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  return tasks.filter((task) => {
    if (task.status !== columnId) return false;
    if (priorityFilter === "urgent_important" && !(task.urgent && task.important)) {
      return false;
    }
    if (priorityFilter === "urgent_only" && !(task.urgent && !task.important)) {
      return false;
    }
    if (priorityFilter === "important_only" && !(!task.urgent && task.important)) {
      return false;
    }
    if (!normalizedQuery) return true;
    return (
      task.title.toLowerCase().includes(normalizedQuery) ||
      task.project.toLowerCase().includes(normalizedQuery) ||
      task.stage.toLowerCase().includes(normalizedQuery) ||
      task.assignee.name.toLowerCase().includes(normalizedQuery)
    );
  });
}

export function computeDepartmentMetrics(
  departments: DepartmentReportRow[],
  currentTasks: TaskItem[],
  initialTasks: TaskItem[] = INITIAL_TASKS,
): ComputedDepartmentRow[] {
  const deltaCompletedByDept: Record<string, number> = {};

  for (const curr of currentTasks) {
    const init = initialTasks.find((t) => t.id === curr.id);
    const wasCompleted = init ? init.status === "completed" : false;
    const isNowCompleted = curr.status === "completed";

    if (!wasCompleted && isNowCompleted) {
      deltaCompletedByDept[curr.departmentId] =
        (deltaCompletedByDept[curr.departmentId] || 0) + 1;
    } else if (wasCompleted && !isNowCompleted) {
      deltaCompletedByDept[curr.departmentId] =
        (deltaCompletedByDept[curr.departmentId] || 0) - 1;
    }
  }

  return departments.map((dept) => {
    const delta = deltaCompletedByDept[dept.id] || 0;
    const completed = Math.max(0, dept.baseCompleted + delta);
    const inTime = Math.max(0, dept.baseInTime - delta);
    const workload = Math.max(0, dept.baseWorkload - delta);
    return {
      ...dept,
      total: dept.baseTotal,
      inTime,
      overdue: dept.baseOverdue,
      completed,
      pendingOther: dept.basePendingOther,
      workload,
    };
  });
}
