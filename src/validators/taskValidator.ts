
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
  dueDate: z.string().datetime().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  project: objectIdSchema.optional(),
  assignedTo: objectIdSchema.nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" }
);
