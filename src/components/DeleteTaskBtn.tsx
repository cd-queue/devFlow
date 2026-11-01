
"use client";

import { useTransition } from "react";
import { deleteTask } from "@/app/actions/taskActions";

export default function DeleteTaskButton({
  taskId,
}: {
  taskId: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
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
      className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
