"use client";

import React, { useMemo, useState } from "react";
import { CreateTaskModal } from "./components/CreateTaskModal";
import {
  ReportTableWidget,
  RequestListWidget,
  TaskListWidget,
  WorkloadChartWidget,
} from "./components/DashboardWidgets";
import { KanbanBoardView } from "./components/KanbanBoardView";
import { RequestApprovalModal } from "./components/RequestApprovalModal";
import { TaskDetailModal } from "./components/TaskDetailModal";
import { TasksSubHeader } from "./components/TasksSubHeader";
import { BaseLeftRail, BaseTopBar } from "./components/TopBarAndSidebar";
import { useTaskBoard } from "./hooks/useTaskBoard";
import { filterTasksForWidget } from "./lib/board";
import type {
  DashboardViewMode,
  DisplayMode,
  EisenhowerTab,
  KanbanColumnId,
  PriorityFilter,
  RequestItem,
} from "./types";

interface TasksScreenProps {
  defaultMode?: DisplayMode;
}

export default function TasksScreen({
  defaultMode = "kanban",
}: TasksScreenProps) {
  const {
    tasks,
    requests,
    departmentMetrics,
    reminderCount,
    handleToggleTask,
    handleToggleTaskPriority,
    handleMoveTask,
    handleCreateTask,
    handleAddSubtask,
    handleUpdateDescription,
    handleToggleRequest,
  } = useTaskBoard();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeNav, setActiveNav] = useState(
    defaultMode === "dashboard" ? "home" : "wework",
  );
  const [displayMode, setDisplayMode] = useState<DisplayMode>(defaultMode);
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [activeTab, setActiveTab] = useState<EisenhowerTab>("urgent_important");
  const [viewMode, setViewMode] = useState<DashboardViewMode>("view");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(
    null,
  );
  const [showAddModal, setShowAddModal] = useState(false);

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) || null,
    [tasks, selectedTaskId],
  );

  // Counts for the 3 Eisenhower quadrants
  const urgentImportantCount = useMemo(
    () => tasks.filter((t) => t.urgent && t.important).length,
    [tasks],
  );
  const urgentNotImportantCount = useMemo(
    () => tasks.filter((t) => t.urgent && !t.important).length,
    [tasks],
  );
  const notUrgentImportantCount = useMemo(
    () => tasks.filter((t) => !t.urgent && t.important).length,
    [tasks],
  );

  const primaryWidgetTasks = useMemo(
    () =>
      filterTasksForWidget(tasks, "urgent_important", searchQuery, activeTab),
    [tasks, searchQuery, activeTab],
  );

  const primaryWidgetTitle = useMemo(() => {
    if (activeTab === "urgent_not_important") {
      return "THEO DÕI CÔNG VIỆC KHẨN CẤP & KHÔNG QUAN TRỌNG";
    }
    if (activeTab === "not_urgent_important") {
      return "THEO DÕI CÔNG VIỆC KHÔNG KHẨN CẤP & QUAN TRỌNG";
    }
    return "THEO DÕI CÔNG VIỆC KHẨN VÀ QUAN TRỌNG |...";
  }, [activeTab]);

  const growthProjectTasks = useMemo(
    () => filterTasksForWidget(tasks, "growth_project", searchQuery, activeTab),
    [tasks, searchQuery, activeTab],
  );

  const filteredRequests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.prefixTag.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q),
    );
  }, [requests, searchQuery]);

  const handleSelectNav = (navId: string) => {
    setActiveNav(navId);
    if (navId === "home") {
      setDisplayMode("dashboard");
    } else if (navId === "wework") {
      setDisplayMode("kanban");
    }
  };

  const handleChangePriorityFilter = (filter: PriorityFilter) => {
    setPriorityFilter(filter);
    if (filter === "urgent_important") {
      setActiveTab("urgent_important");
    } else if (filter === "urgent_only") {
      setActiveTab("urgent_not_important");
    } else if (filter === "important_only") {
      setActiveTab("not_urgent_important");
    }
  };

  const handleChangeActiveTab = (tab: EisenhowerTab) => {
    setActiveTab(tab);
    if (tab === "urgent_important") {
      setPriorityFilter("urgent_important");
    } else if (tab === "urgent_not_important") {
      setPriorityFilter("urgent_only");
    } else if (tab === "not_urgent_important") {
      setPriorityFilter("important_only");
    }
  };

  const handleInlineCreateInColumn = (
    columnId: KanbanColumnId,
    title: string,
  ) => {
    const urgent =
      priorityFilter === "important_only" ? false : true;
    const important =
      priorityFilter === "urgent_only" ? false : true;
    handleCreateTask(columnId, title, urgent, important);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#F2F3F5] overflow-hidden select-none">
      {/* Top Royal Blue Header Bar (with Hoàng Hà Logo) */}
      <BaseTopBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        reminderCount={reminderCount}
        onOpenQuickReminder={() => setSelectedTaskId("task-5")}
      />

      {/* Body Container: Left Navigation Rail + Main Workspace */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <BaseLeftRail activeNav={activeNav} onSelectNav={handleSelectNav} />

        {/* Main Workspace Column */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#F2F3F5] overflow-hidden">
          {/* Sub-Header Bar */}
          <TasksSubHeader
            displayMode={displayMode}
            onChangeDisplayMode={(mode) => {
              setDisplayMode(mode);
              setActiveNav(mode === "dashboard" ? "home" : "wework");
            }}
            priorityFilter={priorityFilter}
            onChangePriorityFilter={handleChangePriorityFilter}
            activeTab={activeTab}
            onChangeActiveTab={handleChangeActiveTab}
            viewMode={viewMode}
            onChangeViewMode={setViewMode}
            totalTasksCount={tasks.length}
            urgentImportantCount={urgentImportantCount}
            urgentNotImportantCount={urgentNotImportantCount}
            notUrgentImportantCount={notUrgentImportantCount}
            onOpenCreateModal={() => setShowAddModal(true)}
          />

          {/* Main Content Area: Kanban View OR Dashboard View */}
          {displayMode === "kanban" ? (
            <KanbanBoardView
              tasks={tasks}
              requests={filteredRequests}
              searchQuery={searchQuery}
              priorityFilter={priorityFilter}
              onToggleTask={handleToggleTask}
              onMoveTask={handleMoveTask}
              onCreateTask={handleInlineCreateInColumn}
              onSelectTask={(task) => setSelectedTaskId(task.id)}
              onToggleRequest={handleToggleRequest}
              onSelectRequest={(req) => setSelectedRequest(req)}
            />
          ) : (
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 custom-scrollbar">
              {/* Top Row: 3 Widgets */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
                <TaskListWidget
                  title={primaryWidgetTitle}
                  subtitle="Dự án/ Phòng ban: Tất cả"
                  filterCount={1}
                  tasks={primaryWidgetTasks}
                  showUrgentTags={true}
                  isEditMode={viewMode === "edit"}
                  onToggleTask={handleToggleTask}
                  onSelectTask={(task) => setSelectedTaskId(task.id)}
                  onRefresh={() => {}}
                  onExpand={() =>
                    setSelectedTaskId(primaryWidgetTasks[0]?.id || "task-5")
                  }
                />

                <TaskListWidget
                  title="DỰ ÁN TĂNG TRƯỞNG"
                  subtitle="Dự án: DỰ ÁN TĂNG TRƯỞNG"
                  filterCount={1}
                  tasks={growthProjectTasks}
                  showUrgentTags={false}
                  isEditMode={viewMode === "edit"}
                  onToggleTask={handleToggleTask}
                  onSelectTask={(task) => setSelectedTaskId(task.id)}
                  onRefresh={() => {}}
                  onExpand={() => setSelectedTaskId("task-8")}
                />

                <RequestListWidget
                  requests={filteredRequests}
                  isEditMode={viewMode === "edit"}
                  onToggleRequest={handleToggleRequest}
                  onSelectRequest={(req) => setSelectedRequest(req)}
                  onRefresh={() => {}}
                  onExpand={() =>
                    setSelectedRequest(filteredRequests[0] || null)
                  }
                />
              </div>

              {/* Bottom Row: 2 Widgets */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                <ReportTableWidget
                  rows={departmentMetrics}
                  isEditMode={viewMode === "edit"}
                  onRefresh={() => {}}
                  onExpand={() => {}}
                />

                <WorkloadChartWidget
                  rows={departmentMetrics}
                  isEditMode={viewMode === "edit"}
                  onRefresh={() => {}}
                  onExpand={() => {}}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Task Detail Modal ("Chi tiết công việc") */}
      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTaskId(null)}
        onToggleStatus={handleToggleTask}
        onTogglePriority={handleToggleTaskPriority}
        onAddSubtask={handleAddSubtask}
        onUpdateDescription={handleUpdateDescription}
      />

      {/* Request Approval Modal */}
      <RequestApprovalModal
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onToggleRequest={handleToggleRequest}
      />

      {/* Add Task Modal */}
      <CreateTaskModal
        open={showAddModal}
        defaultPriorityTab={activeTab}
        onClose={() => setShowAddModal(false)}
        onCreateTask={handleCreateTask}
      />
    </div>
  );
}
