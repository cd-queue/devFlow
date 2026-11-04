"use server";

import {
  createTaskSchema,
  updateTaskStatusSchema,
  editTaskSchema,
  deleteTaskSchema,
} from "@/lib/validations/taskSchema";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/server";

/**
 * -------------------------------------------------------------
 * Helper: getCurrentUser()
 * -------------------------------------------------------------
 * Validates the caller's session via Neon Auth (`auth.getSession()`).
 * If valid, finds or creates the matching user record in PostgreSQL
 * via Prisma, guaranteeing foreign key integrity for `userId`.
 */
async function getCurrentUser() {
  const { data, error } = await auth.getSession();

  // Return null if unauthenticated or session expired
  if (error || !data?.session || !data.user) {
    return null;
  }

  const authUser = data.user;

  // Find user by ID or unique email
  let user = await prisma.user.findFirst({
    where: {
      OR: [{ id: authUser.id }, { email: authUser.email }],
    },
  });

  // Automatically insert record if this is the user's first time
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: authUser.id,
        email: authUser.email,
        name: authUser.name,
      },
    });
  }

  return user;
}

/**
 * -------------------------------------------------------------
 * Action: createTask(input)
 * -------------------------------------------------------------
 * Validates the input with Zod (`createTaskSchema`), inserts the
 * task into PostgreSQL, and revalidates the "/" route.
 */
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

    // Validate payload against Zod schema
    const validation = createTaskSchema.safeParse(input);

    if (!validation.success) {
      return {
        success: false,
        message: validation.error.issues[0].message,
      };
    }

    const { title, description, priority, status } = validation.data;

    // Persist new task in PostgreSQL via Prisma ORM
    await prisma.task.create({
      data: {
        title,
        description: description.trim() || null,
        priority,
        status,
        userId: user.id,
      },
    });

    // Trigger Next.js cache revalidation for the home page
    revalidatePath("/");

    return { success: true, message: "Task created successfully." };
  } catch (error) {
    console.error("Create task failed:", error);
    return { success: false, message: "Failed to create task." };
  }
}

/**
 * -------------------------------------------------------------
 * Action: updateTaskStatus(taskId, status)
 * -------------------------------------------------------------
 * Updates a task's status (TODO, IN_PROGRESS, DONE).
 * Enforces ownership: only the task's creator can update its status.
 */
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

    // Update status scoped to the authenticated user's ID
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

/**
 * -------------------------------------------------------------
 * Action: deleteTask(taskId)
 * -------------------------------------------------------------
 * Permanently removes a task from PostgreSQL.
 * Scoped to the authenticated user's ID for authorization security.
 */
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

    // Delete task belonging only to this user
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

/**
 * -------------------------------------------------------------
 * Action: editTask(input)
 * -------------------------------------------------------------
 * Modifies an existing task's title, description, and priority level.
 */
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

    // Update task scoped to user ownership
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
    return { success: false, message: "Failed to update task." };
  }
}
