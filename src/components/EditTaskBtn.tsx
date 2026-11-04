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
      className="inline-flex items-center justify-center w-7 h-7 rounded-md text-[#77716C] dark:text-[#A8A39D] hover:text-[#25232A] dark:hover:text-[#F5F3EF] hover:bg-[#EFECE5] dark:hover:bg-[#2A2731] border border-transparent hover:border-[#E5E0D7] dark:hover:border-[#33303C] transition-colors cursor-pointer"
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
