import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { validateBody } from "../middleware/validate";
import {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject
} from "../controllers/projectControllers";
import { createProjectSchema,updateProjectSchema } from "../validators/projectValidator";

const router = Router();
router.post(
  "/",
  authenticateToken,
  validateBody(createProjectSchema),
  createProject
);

router.patch(
  "/:id",
  authenticateToken,
  validateBody(updateProjectSchema),
  updateProject
);
router.get("/",authenticateToken, getProjects);

router.get("/:id", authenticateToken, getProjectById);


router.delete("/:id", authenticateToken, deleteProject);

export default router;