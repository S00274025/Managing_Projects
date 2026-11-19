
import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required").max(100),
  description: z.string().max(1000).optional(),
  // Part 2: owner is optional - if it is not sent the logged in user becomes the owner
  owner: z.string().regex(/^[a-f\d]{24}$/i, "Invalid owner ID").optional(),
});

// PUT replaces the project, so every editable field must be sent
// (send "" for description if the project has none).
// owner is not here on purpose - the owner of a project cannot be changed.
export const replaceProjectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required").max(100),
  description: z.string().max(1000),
});

// PATCH changes only the fields that are sent
export const updateProjectSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" }
);
