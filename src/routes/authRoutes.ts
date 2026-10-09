
import { Router, Response } from "express";
import { register, login } from "../controllers/authController";
import {
  authenticateToken,
  AuthRequest,
} from "../middleware/authMiddleware";
import { User } from "../models/User";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.get(
  "/me",
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = await User.findById(req.userId).select("-password");

      if (!user) {
        res.status(404).json({
          message: "User not found",
        });
        return;
      }

      res.status(200).json(user);
    } catch (error) {
      console.error("Get current user error:", error);

      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
);

export default router;
