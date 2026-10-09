
import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";

import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/taskController";

const router = Router();

router.post("/",authenticateToken, createTask);
router.get("/", authenticateToken, getTasks);
router.get("/:id", authenticateToken, getTaskById);
router.patch("/:id", authenticateToken, updateTask);
router.delete("/:id", authenticateToken, deleteTask);

export default router;
