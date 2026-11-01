
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type CreateTaskInput = {
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  userId: string;
};
// In src/app/actions/taskActions.ts line 15:
export async function createDemoUser(): Promise<
  | { success: true; userId: string; message: string } // <-- Change "string | number" to "string"
  | { success: false; message: string }
>{
  try {
    const user = await prisma.user.upsert({
      where: { email: "demo@devflow.com" },
      update: {},
      create: {
        email: "demo@devflow.com",
        name: "Demo User",
      },
    });

    return {
      success: true,
      userId: user.id,
      message: "Demo user created successfully.",
    };
  } catch (error) {
    console.error("Failed to create demo user:", error);

    return {
      success: false,
      message: "Failed to create demo user.",
    };
  }
}

export async function createTask(input: CreateTaskInput) {
  try {
    const title = input.title.trim();

    if (!title) {
      return { success: false, message: "Title is required" };
    }

    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      select: { id: true },
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    await prisma.task.create({
      data: {
        title,
        description: input.description.trim() || null,
        priority: input.priority,
        status: input.status,
        userId: user.id,
      },
    });

    revalidatePath("/");

    return { success: true, message: "Task created successfully" };
  } catch (error) {
    console.error("Create task failed:", error);
    return { success: false, message: "Failed to create task" };
  }
}

export async function updateTaskStatus(
  taskId: string,
  status: "TODO" | "IN_PROGRESS" | "DONE"
) {
  try {
    await prisma.task.update({
      where: { id: taskId },
      data: { status },
    });

    revalidatePath("/");
    return { success: true, message: "Task status updated" };
  } catch (error) {
    console.error("Update task status failed:", error);
    return { success: false, message: "Failed to update task status" };
  }
}


export async function deleteTask(taskId: string) {
  try {
    await prisma.task.delete({
      where: {
        id: taskId,
      },
    });

    revalidatePath("/");
    return { success: true, message: "Task deleted successfully" };
  } catch (error) {
    console.error("Delete task failed:", error);
    return { success: false, message: "Failed to delete task" };
  }
}


type EditTaskInput = {
  taskId: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
};

export async function editTask(input: EditTaskInput) {
  try {
    const title = input.title.trim();

    if (!title) {
      return { success: false, message: "Title is required" };
    }

    await prisma.task.update({
      where: { id: input.taskId },
      data: {
        title,
        description: input.description.trim() || null,
        priority: input.priority,
      },
    });

    revalidatePath("/");

    return { success: true, message: "Task updated successfully" };
  } catch (error) {
    console.error("Edit task failed:", error);
    return { success: false, message: "Failed to update task" };
  }
}
