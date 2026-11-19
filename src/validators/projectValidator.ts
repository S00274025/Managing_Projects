
import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required").max(100),
  description: z.string().max(1000).optional(),
  // Part 2: owner is optional - if it is not sent the logged in user becomes the owner
  owner: z.string().regex(/^[a-f\d]{24}$/i, "Invalid owner ID").optional(),
});

// full update
export const replaceProjectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required").max(100),
  description: z.string().max(1000),
});

// partial update
export const updateProjectSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" }
);
