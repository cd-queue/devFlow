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

  // Dot colors per status matching the approved warm editorial system
  const statusConfig = {
    TODO: {
      label: "To Do",
      dot: "bg-[#969089]",
    },
    IN_PROGRESS: {
      label: "In Progress",
      dot: "bg-[#C58A37]",
    },
    DONE: {
      label: "Completed",
      dot: "bg-[#278568]",
    },
  };

  return (
    <div className="relative inline-flex items-center">
      <select
        value={currentStatus}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.value as TaskStatus)}
        aria-label="Change task status"
        className="appearance-none text-xs font-medium pl-6 pr-6 py-1.5 rounded-lg border border-[#E5E0D7] dark:border-[#2A2731] bg-[#FFFFFF] dark:bg-[#1E1C24] text-[#25232A] dark:text-[#F5F3EF] hover:border-[#D4CCBF] dark:hover:border-[#3D3847] hover:bg-[#F7F5F0] dark:hover:bg-[#23202B] focus:outline-none focus:ring-1 focus:ring-[#6D4AFF]/30 focus:border-[#6D4AFF] transition cursor-pointer disabled:opacity-60 disabled:cursor-wait shadow-2xs"
      >
        <option value="TODO">To Do</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="DONE">Completed</option>
      </select>

      {/* Status indicator dot or animated spinner */}
      <div className="absolute left-2.5 pointer-events-none flex items-center justify-center">
        {isPending ? (
          <svg
            className="w-3 h-3 animate-spin text-[#6D4AFF] dark:text-[#8A6BFF]"
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
      <div className="absolute right-2.5 pointer-events-none text-[#969089]">
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
