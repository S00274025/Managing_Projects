import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";

import {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject
} from "../controllers/projectControllers";

const router = Router();

router.post("/",authenticateToken, createProject);

router.get("/",authenticateToken, getProjects);

router.get("/:id", authenticateToken, getProjectById);

router.patch("/:id", authenticateToken, updateProject);

router.delete("/:id", authenticateToken, deleteProject);

export default router;