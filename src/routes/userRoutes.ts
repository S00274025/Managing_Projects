
import { Router } from "express";
import { createUser,getUsers,getUserById, } from "../controllers/userController";
import { validateBody } from "../middleware/validate";
import { createUserSchema } from "../validators/userValidator";
const router = Router();

router.post("/", validateBody(createUserSchema), createUser);
router.get("/", getUsers);
router.get("/:id", getUserById);

export default router;
