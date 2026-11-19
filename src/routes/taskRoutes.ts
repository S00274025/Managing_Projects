
import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { validateBody } from "../middleware/validate";
import {
  createTaskSchema,
  replaceTaskSchema,
  updateTaskSchema,
} from "../validators/taskValidator";

import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/taskController";

const router = Router();

router.post("/", authenticateToken, validateBody(createTaskSchema), createTask);
router.get("/", authenticateToken, getTasks);
router.get("/:id", authenticateToken, getTaskById);
// PUT and PATCH use the same controller - the difference is the schema:
// PUT requires all fields (full update), PATCH accepts only some of them (partial update)
router.put("/:id", authenticateToken, validateBody(replaceTaskSchema), updateTask);
router.patch("/:id", authenticateToken, validateBody(updateTaskSchema), updateTask);
router.delete("/:id", authenticateToken, deleteTask);

export default router;
