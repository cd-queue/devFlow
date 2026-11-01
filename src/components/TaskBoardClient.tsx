
"use client";

import { useState } from "react";
import CreateTaskForm from "@/components/CreateTaskForm";
import UpdateTaskStatus from "@/components/UpdateTaskStatus";
import DeleteTaskBtn from "@/components/DeleteTaskBtn";
import EditTaskButton from "@/components/EditTaskBtn";

type Task = {
    id: string;
    title: string;
    description: string | null;
    status: "TODO" | "IN_PROGRESS" | "DONE";
    priority: "LOW" | "MEDIUM" | "HIGH";
};

type TaskBoardClientProps = {
    tasks: Task[];
};

export default function TaskBoardClient({
    tasks,
}: TaskBoardClientProps) {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const columns = [
        { status: "TODO", title: "To Do" },
        { status: "IN_PROGRESS", title: "In Progress" },
        { status: "DONE", title: "Completed" },
    ] as const;

    return (
        <>
            <section id="board" className="max-w-7xl mx-auto px-6 mb-16">
                <h2 className="text-2xl font-bold mb-6">Task Board</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {columns.map((column) => {
                        const columnTasks = tasks.filter(
                            (task) => task.status === column.status
                        );

                        return (
                            <div
                                key={column.status}
                                className="bg-slate-100/70 border border-slate-200 rounded-xl p-4"
                            >
                                <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                                    <h3 className="font-semibold text-sm text-slate-700">
                                        {column.title}
                                    </h3>

                                    <span className="text-xs bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-full">
                                        {columnTasks.length}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {columnTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="font-medium text-sm text-slate-900">
                                                    {task.title}
                                                </h4>

                                                <span className="text-xs font-semibold uppercase">
                                                    {task.priority}
                                                </span>
                                            </div>

                                            <p className="text-xs text-slate-500">
                                                {task.description || "No description"}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
                                                <UpdateTaskStatus
                                                    taskId={task.id}
                                                    currentStatus={task.status}
                                                />

                                                <EditTaskButton
                                                    onEdit={() => {
                                                        setSelectedTask(task);

                                                        document
                                                            .getElementById("create-task")
                                                            ?.scrollIntoView({ behavior: "smooth" });
                                                    }}
                                                />

                                                <DeleteTaskBtn taskId={task.id} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section
                id="create-task"
                className="max-w-3xl mx-auto px-6 w-full mb-16"
            >
                <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 mb-1">
                        {selectedTask ? "Edit Task" : "Create New Task"}
                    </h2>

                    <p className="text-sm text-slate-500 mb-6">
                        {selectedTask
                            ? "Update the selected task."
                            : "Add a new task to your board."}
                    </p>

                    <CreateTaskForm
                        taskToEdit={selectedTask}
                        onTaskSaved={() => setSelectedTask(null)}
                    />
                </div>
            </section>
        </>
    );
}

