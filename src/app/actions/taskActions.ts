
"use server";
import { createTaskSchema } from "@/lib/validations/taskSchema";
import { updateTaskStatusSchema } from "@/lib/validations/taskSchema";
import { editTaskSchema } from "@/lib/validations/taskSchema";
import { deleteTaskSchema } from "@/lib/validations/taskSchema";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/server";

async function getCurrentUser() {
  const { data, error } = await auth.getSession();

  if (error || !data?.session || !data.user) {
    return null;
  }

  const authUser = data.user;

  const user = await prisma.user.upsert({
    where: {
      id: authUser.id,
    },
    update: {
      email: authUser.email,
      name: authUser.name,
    },
    create: {
      id: authUser.id,
      email: authUser.email,
      name: authUser.name,
    },
  });

  return user;
}
type CreateTaskInput = {
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "DONE";
};


export async function createTask(input: CreateTaskInput) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, message: "Please login first." };
    }

    const validation = createTaskSchema.safeParse(input);

    if (!validation.success) {
      return {
        success: false,
        message: validation.error.issues[0].message,
      };
    }
    const { title, description, priority, status } = validation.data;


    await prisma.task.create({
      data: {
        title,
        description: description.trim() || null,
        priority,
        status,
        userId: user.id,
      },
    });

    revalidatePath("/");

    return { success: true, message: "Task created successfully." };
  } catch (error) {
    console.error("Create task failed:", error);
    return { success: false, message: "Failed to create task." };
  }
}

export async function updateTaskStatus(
  taskId: string,
  status: "TODO" | "IN_PROGRESS" | "DONE"
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, message: "Please login first." };
    }

    const validation = updateTaskStatusSchema.safeParse({
      taskId,
      status,
    });

    if (!validation.success) {
      return {
        success: false,
        message: validation.error.issues[0].message,
      };
    }

    const result = await prisma.task.updateMany({
      where: {
        id: taskId,
        userId: user.id,
      },
      data: {
        status,
      },
    });

    if (result.count === 0) {
      return { success: false, message: "Task not found." };
    }

    revalidatePath("/");

    return { success: true, message: "Task status updated." };
  } catch (error) {
    console.error("Update task status failed:", error);
    return { success: false, message: "Failed to update task status." };
  }
}


export async function deleteTask(taskId: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, message: "Please login first." };
    }
    const validation = deleteTaskSchema.safeParse({ taskId });

    if (!validation.success) {
      return {
        success: false,
        message: validation.error.issues[0].message,
      };
    }

    const result = await prisma.task.deleteMany({
      where: {
        id: validation.data.taskId,
        userId: user.id,
      },
    });

    if (result.count === 0) {
      return { success: false, message: "Task not found." };
    }

    revalidatePath("/");

    return { success: true, message: "Task deleted successfully." };
  } catch (error) {
    console.error("Delete task failed:", error);
    return { success: false, message: "Failed to delete task." };
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
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, message: "Please login first." };
    }
    const validation = editTaskSchema.safeParse(input);

    if (!validation.success) {
      return {
        success: false,
        message: validation.error.issues[0].message,
      };
    }

    const { taskId, title, description, priority } = validation.data;

    const result = await prisma.task.updateMany({
      where: {
        id: taskId,
        userId: user.id,
      },
      data: {
        title,
        description: description.trim() || null,
        priority,
      },
    });

    if (result.count === 0) {
      return { success: false, message: "Task not found." };
    }

    revalidatePath("/");
    return { success: true, message: "Task updated successfully." };
  } catch (error) {
    console.error("Edit task failed:", error);
    return { success: false, message: "Failed to edit task." };
  }
}
