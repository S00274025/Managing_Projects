
import { Request, Response, NextFunction } from "express";

export const notFoundHandler = (
  req: Request,
  res: Response
): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error("API error:", error);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
