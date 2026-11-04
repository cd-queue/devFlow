"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTask, editTask } from "@/app/actions/taskActions";

/**
 * TaskPayload Type definition for Editing
 */
type TaskToEdit = {
  id: string;
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "DONE";
};

type CreateTaskFormProps = {
  taskToEdit?: TaskToEdit | null;
  onTaskSaved?: () => void;
};

/**
 * CreateTaskForm Component
 * 
 * Manages the creation and editing of tasks.
 * Connects directly to `createTask` and `editTask` Next.js Server Actions.
 * Features full Dark/Light mode, segmented priority chips, validation alerts,
 * and an animated spinning circle while persisting to PostgreSQL.
 */
export default function CreateTaskForm({
  taskToEdit = null,
  onTaskSaved,
}: CreateTaskFormProps) {
  const router = useRouter();

  // Form input states initialized from prop (or default for new task)
  const [title, setTitle] = useState(taskToEdit?.title ?? "");
  const [description, setDescription] = useState(
    taskToEdit?.description ?? ""
  );
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">(
    taskToEdit?.priority ?? "MEDIUM"
  );
  const [status, setStatus] = useState<"TODO" | "IN_PROGRESS" | "DONE">(
    taskToEdit?.status ?? "TODO"
  );

  // User feedback and submission loading states
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  function resetForm() {
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setStatus("TODO");
    setMessage("");
    setIsSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      setMessage("Task title is required.");
      setIsSuccess(false);
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      if (taskToEdit) {
        // Edit existing task in Postgres
        const result = await editTask({
          taskId: taskToEdit.id,
          title: title.trim(),
          description: description.trim(),
          priority,
        });

        setMessage(result.message);
        setIsSuccess(result.success);

        if (result.success) {
          router.refresh();
          setTimeout(() => {
            resetForm();
            onTaskSaved?.();
          }, 300);
        }
      } else {
        // Create new task in Postgres
        const result = await createTask({
          title: title.trim(),
          description: description.trim(),
          priority,
          status,
        });

        setMessage(result.message);
        setIsSuccess(result.success);

        if (result.success) {
          router.refresh();
          resetForm();
          onTaskSaved?.();
        }
      }
    } catch (error) {
      console.error("Failed to save task:", error);
      setMessage("An unexpected error occurred. Please try again.");
      setIsSuccess(false);
    } finally {
      setIsSaving(false);
    }
  }

  // Priority color palettes for Light & Dark mode
  const priorityOptions = [
    {
      value: "LOW",
      label: "Low Priority",
      color: "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60",
      activeColor: "border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/30",
      dot: "bg-blue-400",
    },
    {
      value: "MEDIUM",
      label: "Medium Priority",
      color: "border-slate-200 dark:border-slate-800 text-amber-800 dark:text-amber-300 bg-amber-50/50 dark:bg-amber-950/30",
      activeColor: "border-amber-500 bg-amber-100/70 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/30",
      dot: "bg-amber-500",
    },
    {
      value: "HIGH",
      label: "High Priority",
      color: "border-slate-200 dark:border-slate-800 text-rose-800 dark:text-rose-300 bg-rose-50/50 dark:bg-rose-950/30",
      activeColor: "border-rose-500 bg-rose-100/70 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/30",
      dot: "bg-rose-500",
    },
  ] as const;

  // Initial column status options
  const statusOptions = [
    { value: "TODO", label: "To Do" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "DONE", label: "Completed" },
  ] as const;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Task Title Field */}
      <div>
        <label
          htmlFor="task-title"
          className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2"
        >
          Task Title <span className="text-rose-500">*</span>
        </label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Implement real-time WebSocket connection"
          disabled={isSaving}
          required
          className="w-full text-sm font-medium px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition shadow-[0_1px_2px_rgba(0,0,0,0.02)] disabled:opacity-60"
        />
      </div>

      {/* Segmented Priority Control */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
          Priority Level
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          {priorityOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={isSaving}
              onClick={() => setPriority(opt.value)}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold rounded-xl border transition cursor-pointer ${
                priority === opt.value
                  ? opt.activeColor
                  : `${opt.color} hover:bg-white dark:hover:bg-slate-800`
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Initial Status Column (Only when creating a new task) */}
      {!taskToEdit && (
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Target Column
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={isSaving}
                onClick={() => setStatus(opt.value)}
                className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition cursor-pointer ${
                  status === opt.value
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/30"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Task Description Field */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label
            htmlFor="task-description"
            className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
          >
            Description <span className="text-slate-400 dark:text-slate-500 font-normal lowercase">(optional)</span>
          </label>
          <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
            {description.length}/500
          </span>
        </div>
        <textarea
          id="task-description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          placeholder="Add acceptance criteria, technical implementation details or links..."
          disabled={isSaving}
          className="w-full text-sm px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition shadow-[0_1px_2px_rgba(0,0,0,0.02)] resize-none disabled:opacity-60"
        />
      </div>

      {/* Feedback Alert Pill */}
      {message && (
        <div
          role="status"
          className={`text-sm font-semibold px-4 py-3 rounded-xl flex items-center gap-2.5 ${
            isSuccess
              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              : "bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
          }`}
        >
          {isSuccess ? (
            <svg
              className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          )}
          <span>{message}</span>
        </div>
      )}

      {/* Form Submission Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {taskToEdit && (
          <button
            type="button"
            disabled={isSaving}
            onClick={() => {
              resetForm();
              onTaskSaved?.();
            }}
            className="px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={isSaving || !title.trim()}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSaving && (
            /* Animated Spinning Circle Indicator */
            <svg
              className="w-4 h-4 animate-spin text-white"
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
          )}
          <span>
            {isSaving
              ? taskToEdit
                ? "Updating..."
                : "Saving..."
              : taskToEdit
              ? "Update Task"
              : "Create Task"}
          </span>
        </button>
      </div>
    </form>
  );
}
