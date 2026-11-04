"use client";

type EditTaskButtonProps = {
  onEdit: () => void;
};

/**
 * EditTaskButton Component
 * 
 * Invokes the parent callback to populate the modal with this task's payload for editing.
 */
export default function EditTaskButton({ onEdit }: EditTaskButtonProps) {
  return (
    <button
      type="button"
      onClick={onEdit}
      title="Edit task"
      aria-label="Edit task"
      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition"
    >
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
          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
        />
      </svg>
    </button>
  );
}
