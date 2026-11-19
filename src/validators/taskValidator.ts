
import { z } from "zod";

const objectIdSchema = z.string().regex(
  /^[a-f\d]{24}$/i,
  "Invalid MongoDB ID"
);

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  project: objectIdSchema,
  assignedTo: objectIdSchema.optional(),
  dueDate: z.iso.datetime().optional(),
});

// PUT replaces the task, so every field must be sent.
// description, assignedTo and dueDate can be null to say "this task has none".
export const replaceTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().max(2000).nullable(),
  status: z.enum(["todo", "in_progress", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  project: objectIdSchema,
  assignedTo: objectIdSchema.nullable(),
  dueDate: z.iso.datetime().nullable(),
});

// PATCH changes only the fields that are sent
export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  project: objectIdSchema.optional(),
  assignedTo: objectIdSchema.nullable().optional(),
  dueDate: z.iso.datetime().nullable().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" }
);
