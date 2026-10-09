
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import { JWT_SECRET } from "../config/env";

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authReq = req as AuthRequest;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      message: "Authentication token is required",
    });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (
      typeof decoded === "string" ||
      !("userId" in decoded) ||
      typeof (decoded as JwtPayload).userId !== "string" ||
      !mongoose.isValidObjectId((decoded as JwtPayload).userId)
    ) {
      res.status(401).json({
        message: "Invalid authentication token",
      });
      return;
    }

    authReq.userId = (decoded as JwtPayload).userId;
    next();
  } catch {
    res.status(401).json({
      message: "Invalid or expired authentication token",
    });
  }
};
