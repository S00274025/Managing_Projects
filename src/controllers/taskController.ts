
import { Request, Response } from "express";
import mongoose from "mongoose";
import { Task } from "../models/Task";
import { Project } from "../models/Project";
import { User } from "../models/User";

export const createTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      description,
      status,
      priority,
      project,
      assignedTo,
      dueDate,
    } = req.body;

    const projectExists = await Project.findById(project);

    if (!projectExists) {
      res.status(404).json({
        message: "Project not found",
      });
      return;
    }

    if (assignedTo !== undefined) {
      const assignedUser = await User.findById(assignedTo);

      if (!assignedUser) {
        res.status(404).json({
          message: "Assigned user not found",
        });
        return;
      }
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      project,
      assignedTo,
      dueDate: dueDate !== undefined ? new Date(dueDate) : undefined,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getTasks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const filter: Record<string, unknown> = {};

    if (typeof req.query.project === "string") {
      if (!mongoose.isValidObjectId(req.query.project)) {
        res.status(400).json({
          message: "Invalid project ID",
        });
        return;
      }

      filter.project = req.query.project;
    }

    if (typeof req.query.status === "string") {
      if (
        !["todo", "in_progress", "done"].includes(req.query.status)
      ) {
        res.status(400).json({
          message: "Invalid task status",
        });
        return;
      }

      filter.status = req.query.status;
    }

    const tasks = await Task.find(filter)
      .populate("project", "name")
      .populate("assignedTo", "name email");

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getTaskById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const taskId = Array.isArray(id) ? id[0] : id;

    if (!taskId || !mongoose.isValidObjectId(taskId)) {
      res.status(400).json({
        message: "Invalid task ID",
      });
      return;
    }

    const task = await Task.findById(taskId)
      .populate("project", "name")
      .populate("assignedTo", "name email");

    if (!task) {
      res.status(404).json({
        message: "Task not found",
      });
      return;
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const taskId = Array.isArray(id) ? id[0] : id;

    if (!taskId || !mongoose.isValidObjectId(taskId)) {
      res.status(400).json({
        message: "Invalid task ID",
      });
      return;
    }

    const updates: Record<string, unknown> = { ...req.body };

    if (updates.project !== undefined) {
      const projectExists = await Project.findById(updates.project);

      if (!projectExists) {
        res.status(404).json({
          message: "Project not found",
        });
        return;
      }
    }

    if (updates.assignedTo) {
      const assignedUser = await User.findById(updates.assignedTo);

      if (!assignedUser) {
        res.status(404).json({
          message: "Assigned user not found",
        });
        return;
      }
    }

    if (typeof updates.dueDate === "string") {
      updates.dueDate = new Date(updates.dueDate);
    }

    const task = await Task.findByIdAndUpdate(taskId, updates, {
      returnDocument: "after",
      runValidators: true,
    })
      .populate("project", "name")
      .populate("assignedTo", "name email");

    if (!task) {
      res.status(404).json({
        message: "Task not found",
      });
      return;
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const taskId = Array.isArray(id) ? id[0] : id;

    if (!taskId || !mongoose.isValidObjectId(taskId)) {
      res.status(400).json({
        message: "Invalid task ID",
      });
      return;
    }

    const task = await Task.findByIdAndDelete(taskId);

    if (!task) {
      res.status(404).json({
        message: "Task not found",
      });
      return;
    }

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
