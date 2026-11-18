
import { Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // req.body has already been validated by createUserSchema (zod) in the route:
    // name is trimmed, email is trimmed + lowercased, password is at least 6 characters.
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(409).json({
        message: "A user with this email already exists",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error: unknown) {
    if (
      error instanceof mongoose.Error &&
      error.name === "ValidationError"
    ) {
      res.status(400).json({
        message: "Invalid user data",
      });
      return;
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      res.status(409).json({
        message: "A user with this email already exists",
      });
      return;
    }

    console.error("Create user error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getUsers = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = Array.isArray(id) ? id[0] : id;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      res.status(400).json({
        message: "Invalid user ID",
      });
      return;
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
