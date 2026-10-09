
import { Router } from "express";
import { createUser,getUsers,getUserById, } from "../controllers/userController";
import { validateBody } from "../middleware/validate";
import { createUserSchema } from "../validators/userValidator";
import { authenticateToken } from "../middleware/authMiddleware";
const router = Router();

router.post("/", validateBody(createUserSchema), createUser);
router.get("/",authenticateToken, getUsers);
router.get("/:id", authenticateToken, getUserById);

export default router;
