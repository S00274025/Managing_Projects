
import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required").max(100),
  description: z.string().max(1000).optional(),
  owner: z.string().regex(/^[a-f\d]{24}$/i, "Invalid owner ID"),
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" }
);
