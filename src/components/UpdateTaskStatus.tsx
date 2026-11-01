
"use client";

import { useTransition } from "react";
import { updateTaskStatus } from "@/app/actions/taskActions";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export default function UpdateTaskStatus({
  taskId,
  currentStatus,
}: {
  taskId: string;
  currentStatus: TaskStatus;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(status: TaskStatus) {
    startTransition(async () => {
      await updateTaskStatus(taskId, status);
    });
  }

  return (
    <select
      value={currentStatus}
      disabled={isPending}
      onChange={(e) => handleChange(e.target.value as TaskStatus)}
      className="text-xs border border-slate-200 rounded-md p-1 bg-white"
    >
      <option value="TODO">To Do</option>
      <option value="IN_PROGRESS">In Progress</option>
      <option value="DONE">Completed</option>
    </select>
  );
}
