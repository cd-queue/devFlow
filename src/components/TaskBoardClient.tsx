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

  // Kanban Column Definitions matching the approved warm editorial system
  const columns = [
    {
      status: "TODO" as const,
      title: "To Do",
      dotColor: "bg-[#969089]",
      badgeColor: "bg-[#FFFFFF] dark:bg-[#23202B] text-[#77716C] dark:text-[#A8A39D] border-[#E5E0D7] dark:border-[#2A2731]",
      emptyText: "No tasks to do right now",
    },
    {
      status: "IN_PROGRESS" as const,
      title: "In Progress",
      dotColor: "bg-[#C58A37]",
      badgeColor: "bg-[#C58A37]/10 dark:bg-[#C58A37]/15 text-[#C58A37] border-[#C58A37]/25",
      emptyText: "No tasks currently in progress",
    },
    {
      status: "DONE" as const,
      title: "Completed",
      dotColor: "bg-[#278568]",
      badgeColor: "bg-[#278568]/10 dark:bg-[#278568]/15 text-[#278568] border-[#278568]/25",
      emptyText: "No completed tasks yet",
    },
  ];

  return (
    <section id="board" className="max-w-7xl mx-auto px-6 mb-16 scroll-mt-24">
      {/* ------------------------------------------------------------- */}
      {/* 1. Board Controls & Filter Bar                                */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-[#E5E0D7] dark:border-[#2A2731]">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-[#25232A] dark:text-[#F5F3EF]">
              Execution Board
            </h2>

            {/* Server Sync Status Badge with Live Rotating Circle */}
            <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border border-[#E5E0D7] dark:border-[#2A2731] bg-[#FFFFFF] dark:bg-[#1C1A22] text-[#77716C] dark:text-[#A8A39D] shadow-2xs">
              {isRefreshing ? (
                <>
                  <svg
                    className="w-3.5 h-3.5 animate-spin text-[#6D4AFF] dark:text-[#8A6BFF]"
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
                  <span className="text-[#6D4AFF] dark:text-[#8A6BFF] font-medium">
                    Syncing with server...
                  </span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#278568]" />
                  <span>Synced</span>
                </>
              )}
            </div>
          </div>
          <p className="text-xs text-[#77716C] dark:text-[#A8A39D] mt-1">
            Real-time pipeline orchestration powered by Neon PostgreSQL
          </p>
        </div>

        {/* Filter Tools & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="text-xs font-medium pl-8 pr-3 py-2 rounded-lg border border-[#E5E0D7] dark:border-[#2A2731] bg-[#FFFFFF] dark:bg-[#1C1A22] text-[#25232A] dark:text-[#F5F3EF] placeholder:text-[#969089] dark:placeholder:text-[#757069] focus:outline-none focus:ring-1 focus:ring-[#6D4AFF]/30 focus:border-[#6D4AFF] w-40 sm:w-52 transition shadow-2xs"
            />
            <svg
              className="w-3.5 h-3.5 text-[#969089] absolute left-2.5 top-1/2 -translate-y-1/2"
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
            className="text-xs font-medium px-3 py-2 rounded-lg border border-[#E5E0D7] dark:border-[#2A2731] bg-[#FFFFFF] dark:bg-[#1C1A22] text-[#25232A] dark:text-[#F5F3EF] hover:border-[#D4CCBF] dark:hover:border-[#3D3847] hover:bg-[#F7F5F0] dark:hover:bg-[#23202B] focus:outline-none focus:ring-1 focus:ring-[#6D4AFF]/30 focus:border-[#6D4AFF] transition shadow-2xs cursor-pointer"
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
            className="p-2 rounded-lg border border-[#E5E0D7] dark:border-[#2A2731] bg-[#FFFFFF] dark:bg-[#1C1A22] text-[#77716C] dark:text-[#A8A39D] hover:text-[#25232A] dark:hover:text-[#F5F3EF] hover:bg-[#EFECE5] dark:hover:bg-[#23202B] transition shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            <svg
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#6D4AFF] dark:text-[#8A6BFF]" : ""}`}
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
              className="inline-flex items-center gap-1.5 bg-[#6D4AFF] hover:bg-[#5939D6] text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              <svg
                className="w-3.5 h-3.5"
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
              className="inline-flex items-center gap-1.5 bg-[#6D4AFF] hover:bg-[#5939D6] text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-colors shadow-2xs"
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
              className="flex flex-col rounded-xl bg-[#EFECE5]/60 dark:bg-[#1A1820]/60 border border-[#E5E0D7] dark:border-[#2A2731] p-4 min-h-[480px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-[#E5E0D7] dark:border-[#2A2731]">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${column.dotColor}`} />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#25232A] dark:text-[#F5F3EF]">
                    {column.title}
                  </h3>
                </div>

                <span
                  className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded border ${column.badgeColor}`}
                >
                  {columnTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {columnTasks.length === 0 ? (
                  /* Empty state placeholder */
                  <div className="h-44 flex flex-col items-center justify-center border border-dashed border-[#E5E0D7] dark:border-[#2A2731] rounded-lg p-5 text-center">
                    <div className="w-9 h-9 rounded-full bg-[#F7F5F0] dark:bg-[#23202B] border border-[#E5E0D7] dark:border-[#2A2731] flex items-center justify-center text-[#969089] mb-2">
                      <svg
                        className="w-4 h-4"
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
                    <p className="text-xs font-medium text-[#969089] dark:text-[#757069]">
                      {column.emptyText}
                    </p>
                  </div>
                ) : (
                  columnTasks.map((task) => {
                    // Priority Pill Styles matching approved palette
                    const priorityBadge =
                      task.priority === "HIGH"
                        ? "bg-[#CE5C62]/10 text-[#CE5C62] border-[#CE5C62]/20"
                        : task.priority === "MEDIUM"
                        ? "bg-[#C58A37]/10 text-[#C58A37] border-[#C58A37]/20"
                        : "bg-[#F0ECFF] dark:bg-[#6D4AFF]/15 text-[#6D4AFF] dark:text-[#8A6BFF] border-[#6D4AFF]/20";

                    // Left-edge border accent
                    const cardBorderAccent =
                      task.priority === "HIGH"
                        ? "border-l-[#CE5C62]"
                        : task.priority === "MEDIUM"
                        ? "border-l-[#C58A37]"
                        : "border-l-[#6D4AFF]";

                    return (
                      <div
                        key={task.id}
                        className={`group bg-[#FFFFFF] dark:bg-[#201E25] rounded-xl border border-[#E5E0D7] dark:border-[#2A2731] border-l-3 ${cardBorderAccent} p-4 shadow-[0_1px_3px_rgba(37,35,42,0.03)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.25)] hover:border-[#D4CCBF] dark:hover:border-[#3D3847] hover:shadow-md transition-all duration-150 space-y-2.5`}
                      >
                        {/* Task Title & Priority Chip */}
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-semibold text-sm text-[#25232A] dark:text-[#F5F3EF] leading-snug group-hover:text-[#6D4AFF] dark:group-hover:text-[#8A6BFF] transition-colors">
                            {task.title}
                          </h4>

                          <span
                            className={`text-[10px] font-mono font-medium uppercase tracking-wider px-2 py-0.5 rounded border shrink-0 ${priorityBadge}`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        {/* Task Description */}
                        {task.description && (
                          <p className="text-xs text-[#77716C] dark:text-[#A8A39D] leading-relaxed line-clamp-3">
                            {task.description}
                          </p>
                        )}

                        {/* Task Card Footer Actions */}
                        <div className="flex items-center justify-between pt-2.5 border-t border-[#E5E0D7]/70 dark:border-[#2A2731] gap-2">
                          {isLoggedIn ? (
                            <>
                              <UpdateTaskStatus
                                taskId={task.id}
                                currentStatus={task.status}
                              />

                              <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <EditTaskButton
                                  onEdit={() => handleEditTask(task)}
                                />
                                <DeleteTaskBtn taskId={task.id} />
                              </div>
                            </>
                          ) : (
                            <span className="text-[11px] font-mono text-[#969089] dark:text-[#757069]">
                              Read-only
                            </span>
                          )}

                          <span className="text-[11px] font-mono text-[#969089] dark:text-[#757069] ml-auto">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#25232A]/50 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-[#FFFFFF] dark:bg-[#1E1C24] rounded-2xl border border-[#E5E0D7] dark:border-[#2A2731] max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Title & Close Button */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E0D7] dark:border-[#2A2731]">
              <div>
                <h3 className="font-bold text-lg text-[#25232A] dark:text-[#F5F3EF]">
                  {selectedTask ? "Edit Task" : "Create New Task"}
                </h3>
                <p className="text-xs text-[#77716C] dark:text-[#A8A39D] mt-0.5">
                  {selectedTask
                    ? "Update properties, priority level, and description."
                    : "Add an actionable item to your execution pipeline."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg text-[#969089] hover:text-[#25232A] dark:hover:text-[#F5F3EF] hover:bg-[#EFECE5] dark:hover:bg-[#2A2731] flex items-center justify-center transition cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
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
        <div className="mt-10 p-6 sm:p-8 rounded-xl border border-[#E5E0D7] dark:border-[#2A2731] bg-[#FFFFFF] dark:bg-[#1E1C24] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-bold text-[#25232A] dark:text-[#F5F3EF] text-sm sm:text-base">
              Ready to orchestrate your own engineering pipelines?
            </h4>
            <p className="text-xs text-[#77716C] dark:text-[#A8A39D]">
              Sign in with Google or Email to create, prioritize, and manage personal tasks.
            </p>
          </div>
          <a
            href="/auth/sign-in"
            className="bg-[#6D4AFF] hover:bg-[#5939D6] text-white font-medium text-xs px-5 py-2.5 rounded-lg transition shadow-xs shrink-0"
          >
            Sign In to DevFlow
          </a>
        </div>
      )}
    </section>
  );
}
