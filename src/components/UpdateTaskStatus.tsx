"use client";

import { useTransition } from "react";
import { updateTaskStatus } from "@/app/actions/taskActions";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

/**
 * UpdateTaskStatus Component
 * 
 * Renders an accessible, styled status selector.
 * Uses `useTransition` to show a spinning loading circle while the server action
 * executes against the database.
 */
export default function UpdateTaskStatus({
  taskId,
  currentStatus,
}: {
  taskId: string;
  currentStatus: TaskStatus;
}) {
  const [isPending, startTransition] = useTransition();

  // Trigger server action in transition
  function handleChange(status: TaskStatus) {
    if (status === currentStatus) return;
    startTransition(async () => {
      await updateTaskStatus(taskId, status);
    });
  }

  // Dot colors per status
  const statusConfig = {
    TODO: {
      label: "To Do",
      dot: "bg-slate-400 dark:bg-slate-500",
    },
    IN_PROGRESS: {
      label: "In Progress",
      dot: "bg-amber-500 dark:bg-amber-400",
    },
    DONE: {
      label: "Completed",
      dot: "bg-emerald-500 dark:bg-emerald-400",
    },
  };

  return (
    <div className="relative inline-flex items-center">
      <select
        value={currentStatus}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.value as TaskStatus)}
        aria-label="Change task status"
        className="appearance-none text-xs font-semibold pl-6 pr-6 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-pointer disabled:opacity-60 disabled:cursor-wait"
      >
        <option value="TODO">To Do</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="DONE">Completed</option>
      </select>

      {/* Status indicator dot or animated spinner */}
      <div className="absolute left-2.5 pointer-events-none flex items-center justify-center">
        {isPending ? (
          <svg
            className="w-3 h-3 animate-spin text-blue-600 dark:text-blue-400"
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
              strokeWidth="4"
            />
            <path
              className="opacity-85"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        ) : (
          <span
            className={`w-2 h-2 rounded-full ${statusConfig[currentStatus].dot}`}
          />
        )}
      </div>

      {/* Down Chevron Icon */}
      <div className="absolute right-2.5 pointer-events-none text-slate-400 dark:text-slate-500">
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}
