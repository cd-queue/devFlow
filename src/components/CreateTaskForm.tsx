
"use client";

import { useEffect, useState } from "react";
import {
  createTask,
  createDemoUser,
  editTask,
} from "@/app/actions/taskActions";

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

export default function CreateTaskForm({
  taskToEdit = null,
  onTaskSaved,
}: CreateTaskFormProps) {
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState(taskToEdit?.title ?? "");
  const [description, setDescription] = useState(
    taskToEdit?.description ?? ""
  );
  const [priority, setPriority] = useState<
    "LOW" | "MEDIUM" | "HIGH"
  >(taskToEdit?.priority ?? "MEDIUM");

  const [status, setStatus] = useState<
    "TODO" | "IN_PROGRESS" | "DONE"
  >(taskToEdit?.status ?? "TODO");

  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description ?? "");
      setPriority(taskToEdit.priority);
      setStatus(taskToEdit.status);
      setMessage("");
    }
  }, [taskToEdit]);

  function resetForm() {
  setTitle("");
  setDescription("");
  setPriority("MEDIUM");
  setStatus("TODO");
  setMessage("");
}
  async function handleSubmit() {
    if (!title.trim()) {
      setMessage("Title is required.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      if (taskToEdit) {
        // Update the existing task
        const result = await editTask({
          taskId: taskToEdit.id,
          title,
          description,
          priority,
        });

        setMessage(result.message);

        if (result.success) {
          resetForm();
          onTaskSaved?.();

        }
      } else {
        // Create a new task
        if (!userId) {
          setMessage("Please create a demo user first.");
          return;
        }

        const result = await createTask({
          title,
          description,
          priority,
          status,
        });

        if (result.success) {
          setTitle("");
          setDescription("");
          setPriority("MEDIUM");
          setStatus("TODO");
          setMessage("Task created successfully.");
          onTaskSaved?.();
        } else {
          setMessage(result.message);
        }
      }
    } catch (error) {
      console.error("Failed to save task:", error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateUser() {
    const result = await createDemoUser();

    if (result.success && "userId" in result) {
      setUserId(result.userId);
      setMessage(result.message);
    } else {
      setMessage(result.message);
    }
  }

  return (
    <>
      {!taskToEdit && (
        <button
          type="button"
          onClick={handleCreateUser}
          className="mb-4 rounded-lg border px-4 py-2 text-sm"
        >
          Create Demo User
        </button>
      )}

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div>
          <label htmlFor="task-title">Title</label>
          <input
            id="task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            className="w-full rounded-lg border p-3"
            required
          />
        </div>

        <div>
          <label htmlFor="task-description">Description</label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description"
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label htmlFor="task-priority">Priority</label>
          <select
            id="task-priority"
            value={priority}
            onChange={(e) =>
              setPriority(
                e.target.value as "LOW" | "MEDIUM" | "HIGH"
              )
            }
            className="w-full rounded-lg border p-3"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        {!taskToEdit && (
          <div>
            <label htmlFor="task-status">Status</label>
            <select
              id="task-status"
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value as "TODO" | "IN_PROGRESS" | "DONE"
                )
              }
              className="w-full rounded-lg border p-3"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>
        )}

        {message && (
          <p className="text-sm text-slate-600" role="status">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={isSaving || !title.trim() || (!taskToEdit && !userId)}
          className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving
            ? "Saving..."
            : taskToEdit
              ? "Update Task"
              : "Save Task"}
        </button>

        {taskToEdit && (
          <button
            type="button"
            disabled = {isSaving}
            onClick={() => {
              onTaskSaved?.(); 
              resetForm();
            }
            }
            className="ml-3 rounded-lg border px-6 py-2"
          >
            Cancel
          </button>
        )}
      </form>
    </>
  );
}
