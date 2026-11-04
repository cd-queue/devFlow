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

  // Priority color palettes matching the approved warm editorial system
  const priorityOptions = [
    {
      value: "LOW",
      label: "Low Priority",
      color: "border-[#E5E0D7] dark:border-[#2A2731] text-[#77716C] dark:text-[#A8A39D] bg-[#F7F5F0] dark:bg-[#1A1820]",
      activeColor: "border-[#6D4AFF] bg-[#F0ECFF] dark:bg-[#6D4AFF]/15 text-[#6D4AFF] dark:text-[#8A6BFF] ring-1 ring-[#6D4AFF]/30",
      dot: "bg-[#6D4AFF] dark:bg-[#8A6BFF]",
    },
    {
      value: "MEDIUM",
      label: "Medium Priority",
      color: "border-[#E5E0D7] dark:border-[#2A2731] text-[#77716C] dark:text-[#A8A39D] bg-[#F7F5F0] dark:bg-[#1A1820]",
      activeColor: "border-[#C58A37] bg-[#C58A37]/10 dark:bg-[#C58A37]/15 text-[#C58A37] ring-1 ring-[#C58A37]/30",
      dot: "bg-[#C58A37]",
    },
    {
      value: "HIGH",
      label: "High Priority",
      color: "border-[#E5E0D7] dark:border-[#2A2731] text-[#77716C] dark:text-[#A8A39D] bg-[#F7F5F0] dark:bg-[#1A1820]",
      activeColor: "border-[#CE5C62] bg-[#CE5C62]/10 dark:bg-[#CE5C62]/15 text-[#CE5C62] ring-1 ring-[#CE5C62]/30",
      dot: "bg-[#CE5C62]",
    },
  ] as const;

  // Initial column status options
  const statusOptions = [
    { value: "TODO", label: "To Do" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "DONE", label: "Completed" },
  ] as const;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Task Title Field */}
      <div>
        <label
          htmlFor="task-title"
          className="block text-xs font-semibold text-[#25232A] dark:text-[#F5F3EF] uppercase tracking-wider mb-1.5"
        >
          Task Title <span className="text-[#CE5C62]">*</span>
        </label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Implement real-time WebSocket connection"
          disabled={isSaving}
          required
          className="w-full text-xs font-medium px-3.5 py-2.5 rounded-lg border border-[#E5E0D7] dark:border-[#2A2731] bg-[#FFFFFF] dark:bg-[#1A1820] text-[#25232A] dark:text-[#F5F3EF] placeholder:text-[#969089] dark:placeholder:text-[#757069] focus:outline-none focus:ring-1 focus:ring-[#6D4AFF]/30 focus:border-[#6D4AFF] transition shadow-2xs disabled:opacity-60"
        />
      </div>

      {/* Segmented Priority Control */}
      <div>
        <label className="block text-xs font-semibold text-[#25232A] dark:text-[#F5F3EF] uppercase tracking-wider mb-1.5">
          Priority Level
        </label>
        <div className="grid grid-cols-3 gap-2">
          {priorityOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={isSaving}
              onClick={() => setPriority(opt.value)}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-medium rounded-lg border transition cursor-pointer ${
                priority === opt.value
                  ? opt.activeColor
                  : `${opt.color} hover:border-[#D4CCBF] dark:hover:border-[#3D3847]`
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${opt.dot}`} />
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Initial Status Column (Only when creating a new task) */}
      {!taskToEdit && (
        <div>
          <label className="block text-xs font-semibold text-[#25232A] dark:text-[#F5F3EF] uppercase tracking-wider mb-1.5">
            Target Column
          </label>
          <div className="grid grid-cols-3 gap-2">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={isSaving}
                onClick={() => setStatus(opt.value)}
                className={`py-2 px-2.5 text-xs font-medium rounded-lg border transition cursor-pointer ${
                  status === opt.value
                    ? "border-[#6D4AFF] bg-[#F0ECFF] dark:bg-[#6D4AFF]/15 text-[#6D4AFF] dark:text-[#8A6BFF] ring-1 ring-[#6D4AFF]/30"
                    : "border-[#E5E0D7] dark:border-[#2A2731] bg-[#FFFFFF] dark:bg-[#1A1820] text-[#77716C] dark:text-[#A8A39D] hover:bg-[#F7F5F0] dark:hover:bg-[#23202B]"
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
        <div className="flex justify-between items-center mb-1.5">
          <label
            htmlFor="task-description"
            className="block text-xs font-semibold text-[#25232A] dark:text-[#F5F3EF] uppercase tracking-wider"
          >
            Description <span className="text-[#969089] dark:text-[#757069] font-normal lowercase">(optional)</span>
          </label>
          <span className="text-[11px] font-mono text-[#969089] dark:text-[#757069]">
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
          className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E5E0D7] dark:border-[#2A2731] bg-[#FFFFFF] dark:bg-[#1A1820] text-[#25232A] dark:text-[#F5F3EF] placeholder:text-[#969089] dark:placeholder:text-[#757069] focus:outline-none focus:ring-1 focus:ring-[#6D4AFF]/30 focus:border-[#6D4AFF] transition shadow-2xs resize-none disabled:opacity-60"
        />
      </div>

      {/* Feedback Alert Pill */}
      {message && (
        <div
          role="status"
          className={`text-xs font-medium px-3.5 py-2.5 rounded-lg flex items-center gap-2 ${
            isSuccess
              ? "bg-[#278568]/10 text-[#278568] border border-[#278568]/20"
              : "bg-[#CE5C62]/10 text-[#CE5C62] border border-[#CE5C62]/20"
          }`}
        >
          {isSuccess ? (
            <svg
              className="w-4 h-4 text-[#278568] shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 text-[#CE5C62] shrink-0"
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
      <div className="flex items-center justify-end gap-2.5 pt-2">
        {taskToEdit && (
          <button
            type="button"
            disabled={isSaving}
            onClick={() => {
              resetForm();
              onTaskSaved?.();
            }}
            className="px-4 py-2 text-xs font-medium text-[#77716C] dark:text-[#A8A39D] hover:text-[#25232A] dark:hover:text-[#F5F3EF] bg-[#EFECE5] dark:bg-[#2A2731] hover:bg-[#E5E0D7] dark:hover:bg-[#33303C] border border-[#E5E0D7] dark:border-[#33303C] rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={isSaving || !title.trim()}
          className="inline-flex items-center gap-1.5 bg-[#6D4AFF] hover:bg-[#5939D6] text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSaving && (
            /* Animated Spinning Circle Indicator */
            <svg
              className="w-3.5 h-3.5 animate-spin text-white"
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
