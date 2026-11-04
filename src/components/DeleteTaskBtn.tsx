"use client";

import { useTransition } from "react";
import { deleteTask } from "@/app/actions/taskActions";

/**
 * DeleteTaskButton Component
 * 
 * Prompts user confirmation before executing the `deleteTask` Server Action.
 * Displays a spinning loader circle during deletion.
 */
export default function DeleteTaskButton({ taskId }: { taskId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this task?"
    );

    if (!confirmed) return;

    startTransition(async () => {
      await deleteTask(taskId);
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      title="Delete task"
      aria-label="Delete task"
      className="inline-flex items-center justify-center w-7 h-7 rounded-md text-[#77716C] dark:text-[#A8A39D] hover:text-[#CE5C62] dark:hover:text-[#CE5C62] hover:bg-[#CE5C62]/10 border border-transparent hover:border-[#CE5C62]/20 transition-colors disabled:opacity-50 disabled:cursor-wait cursor-pointer"
    >
      {isPending ? (
        /* Spinning Circle Indicator while deleting */
        <svg
          className="w-3.5 h-3.5 animate-spin text-[#CE5C62]"
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
      ) : (
        /* Trash Icon */
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
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      )}
    </button>
  );
}
