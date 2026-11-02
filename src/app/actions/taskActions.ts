
"use server";
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
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, message: "Please login first." };
    }

    const title = input.title.trim();

    if (!title) {
      return { success: false, message: "Title is required." };
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

    const result = await prisma.task.deleteMany({
      where: {
        id: taskId,
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

    const title = input.title.trim();

    if (!title) {
      return { success: false, message: "Title is required." };
    }

    const result = await prisma.task.updateMany({
      where: {
        id: input.taskId,
        userId: user.id,
      },
      data: {
        title,
        description: input.description.trim() || null,
        priority: input.priority,
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
