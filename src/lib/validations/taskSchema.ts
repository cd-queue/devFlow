
import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().max(500, "Description is too long"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
});

export const editTaskSchema = z.object({
  taskId: z.string().uuid(),
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().max(500, "Description is too long"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

export const updateTaskStatusSchema = z.object({
  taskId: z.string().uuid(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
});

export const deleteTaskSchema = z.object({
  taskId: z.string().uuid(),
});