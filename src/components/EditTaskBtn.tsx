
"use client";

type EditTaskButtonProps = {
  onEdit: () => void;
};

export default function EditTaskButton({
  onEdit,
}: EditTaskButtonProps) {
  return (
    <button
      type="button"
      onClick={onEdit}
      className="text-xs font-medium text-blue-600 hover:text-blue-700"
    >
      Edit
    </button>
  );
}
