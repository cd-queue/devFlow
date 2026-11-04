"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import CreateTaskForm from "@/components/CreateTaskForm";
import UpdateTaskStatus from "@/components/UpdateTaskStatus";
import DeleteTaskBtn from "@/components/DeleteTaskBtn";
import EditTaskButton from "@/components/EditTaskBtn";

/**
 * Task Data Model (Matches Prisma schema output)
 */
type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
};

type TaskBoardClientProps = {
  tasks: Task[];
  isLoggedIn: boolean;
};

/**
 * TaskBoardClient Component
 * 
 * Interactive Kanban board for DevFlow.
 * Handles:
 * - 3 execution columns (To Do, In Progress, Completed)
 * - Real-time client-side task search & priority filtering
 * - Server re-render sync indicator (rotating spinner circle)
 * - Modal dialog for creating and editing tasks
 * - Dark & Light mode visual styles
 */
export default function TaskBoardClient({
  tasks,
  isLoggedIn,
}: TaskBoardClientProps) {
  const router = useRouter();

  // Selected task state for editing
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

  // React Transition state to show a loading circle while router.refresh() executes
  const [isRefreshing, startRefreshTransition] = useTransition();

  // Manual board sync with server
  function handleManualRefresh() {
    startRefreshTransition(() => {
      router.refresh();
    });
  }

  // Open modal pre-populated for editing
  function handleEditTask(task: Task) {
    setSelectedTask(task);
    setIsModalOpen(true);
  }

  // Open modal clean for creating new
  function handleOpenCreateModal() {
    setSelectedTask(null);
    setIsModalOpen(true);
  }

  // Filter tasks based on search text and priority level
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description &&
        task.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPriority =
      priorityFilter === "ALL" || task.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  // Kanban Column Definitions
  const columns = [
    {
      status: "TODO" as const,
      title: "To Do",
      dotColor: "bg-slate-400 dark:bg-slate-500",
      badgeColor: "bg-slate-200/70 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700",
      emptyText: "No tasks to do right now",
    },
    {
      status: "IN_PROGRESS" as const,
      title: "In Progress",
      dotColor: "bg-amber-500 dark:bg-amber-400",
      badgeColor: "bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800",
      emptyText: "No tasks currently in progress",
    },
    {
      status: "DONE" as const,
      title: "Completed",
      dotColor: "bg-emerald-500 dark:bg-emerald-400",
      badgeColor: "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800",
      emptyText: "No completed tasks yet",
    },
  ];

  return (
    <section id="board" className="max-w-7xl mx-auto px-6 mb-16">
      {/* ------------------------------------------------------------- */}
      {/* 1. Board Controls & Filter Bar                                */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Execution Board
            </h2>

            {/* Server Sync Status Badge with Live Rotating Circle */}
            <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              {isRefreshing ? (
                <>
                  <svg
                    className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="opacity-80"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    Syncing with server...
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Synced</span>
                </>
              )}
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time pipeline orchestration powered by Neon PostgreSQL
          </p>
        </div>

        {/* Filter Tools & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Live Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="text-sm font-medium pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 w-44 sm:w-56 transition shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            />
            <svg
              className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Priority Filter Selector */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          {/* Manual Refresh Button with Spinner Animation */}
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            title="Refresh tasks from PostgreSQL"
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-[0_1px_2px_rgba(0,0,0,0.02)] disabled:opacity-50 cursor-pointer"
          >
            <svg
              className={`w-4 h-4 ${isRefreshing ? "animate-spin text-blue-600 dark:text-blue-400" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>

          {/* New Task Trigger Button */}
          {isLoggedIn ? (
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm hover:shadow cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>New Task</span>
            </button>
          ) : (
            <a
              href="/auth/sign-in"
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm"
            >
              Sign In to Add
            </a>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. 3-Column Kanban Board Grid                                 */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => {
          const columnTasks = filteredTasks.filter(
            (task) => task.status === column.status
          );

          return (
            <div
              key={column.status}
              className="flex flex-col rounded-2xl bg-slate-200/60 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800/90 p-4 min-h-[480px] shadow-sm"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${column.dotColor}`} />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    {column.title}
                  </h3>
                </div>

                <span
                  className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${column.badgeColor}`}
                >
                  {columnTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
                {columnTasks.length === 0 ? (
                  /* Empty state placeholder */
                  <div className="h-48 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-5 text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      {column.emptyText}
                    </p>
                  </div>
                ) : (
                  columnTasks.map((task) => {
                    // Priority Pill Styles
                    const priorityBadge =
                      task.priority === "HIGH"
                        ? "bg-rose-50 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800"
                        : task.priority === "MEDIUM"
                        ? "bg-amber-50 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";

                    // Left-edge border color
                    const cardBorderAccent =
                      task.priority === "HIGH"
                        ? "border-l-rose-500"
                        : task.priority === "MEDIUM"
                        ? "border-l-amber-500"
                        : "border-l-blue-500";

                    return (
                      <div
                        key={task.id}
                        className={`group bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 border-l-4 ${cardBorderAccent} p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-150 space-y-3`}
                      >
                        {/* Task Title & Priority Chip */}
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-bold text-base text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {task.title}
                          </h4>

                          <span
                            className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border shrink-0 ${priorityBadge}`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        {/* Task Description */}
                        {task.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                            {task.description}
                          </p>
                        )}

                        {/* Task Card Footer Actions */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 gap-2">
                          {isLoggedIn ? (
                            <>
                              <UpdateTaskStatus
                                taskId={task.id}
                                currentStatus={task.status}
                              />

                              <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <EditTaskButton
                                  onEdit={() => handleEditTask(task)}
                                />
                                <DeleteTaskBtn taskId={task.id} />
                              </div>
                            </>
                          ) : (
                            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                              Read-only
                            </span>
                          )}

                          <span className="text-xs font-mono text-slate-400 dark:text-slate-500 ml-auto">
                            #{task.id.slice(0, 6)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. Modal Dialog for Create or Edit Task                       */}
      {/* ------------------------------------------------------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Title & Close Button */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">
                  {selectedTask ? "Edit Task" : "Create New Task"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedTask
                    ? "Update properties, priority level, and description."
                    : "Add an actionable item to your execution pipeline."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Create / Edit Form */}
            <CreateTaskForm
              key={selectedTask?.id ?? "new"}
              taskToEdit={selectedTask}
              onTaskSaved={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. Guest Callout Box                                          */}
      {/* ------------------------------------------------------------- */}
      {!isLoggedIn && (
        <div className="mt-10 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
              Ready to orchestrate your own engineering pipelines?
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sign in with Google or Email to create, prioritize, and manage personal tasks.
            </p>
          </div>
          <a
            href="/auth/sign-in"
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-md shrink-0"
          >
            Sign In to DevFlow
          </a>
        </div>
      )}
    </section>
  );
}
