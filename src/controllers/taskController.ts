
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

    if (typeof title !== "string" || !title.trim()) {
      res.status(400).json({
        message: "Task title is required",
      });
      return;
    }

    if (
      typeof project !== "string" ||
      !mongoose.isValidObjectId(project)
    ) {
      res.status(400).json({
        message: "A valid project ID is required",
      });
      return;
    }

    if (
      status !== undefined &&
      !["todo", "in_progress", "done"].includes(status)
    ) {
      res.status(400).json({
        message: "Invalid task status",
      });
      return;
    }

    if (
      priority !== undefined &&
      !["low", "medium", "high"].includes(priority)
    ) {
      res.status(400).json({
        message: "Invalid task priority",
      });
      return;
    }

    const projectExists = await Project.findById(project);

    if (!projectExists) {
      res.status(404).json({
        message: "Project not found",
      });
      return;
    }

    let assignedUserId: string | undefined;

    if (assignedTo !== undefined && assignedTo !== null && assignedTo !== "") {
      if (
        typeof assignedTo !== "string" ||
        !mongoose.isValidObjectId(assignedTo)
      ) {
        res.status(400).json({
          message: "Invalid assigned user ID",
        });
        return;
      }

      const assignedUser = await User.findById(assignedTo);

      if (!assignedUser) {
        res.status(404).json({
          message: "Assigned user not found",
        });
        return;
      }

      assignedUserId = assignedTo;
    }

    let parsedDueDate: Date | undefined;

    if (dueDate !== undefined && dueDate !== null && dueDate !== "") {
      parsedDueDate = new Date(dueDate);

      if (Number.isNaN(parsedDueDate.getTime())) {
        res.status(400).json({
          message: "Invalid due date",
        });
        return;
      }
    }

    const task = await Task.create({
      title: title.trim(),
      description,
      status,
      priority,
      project,
      assignedTo: assignedUserId,
      dueDate: parsedDueDate,
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

    const allowedFields = [
      "title",
      "description",
      "status",
      "priority",
      "project",
      "assignedTo",
      "dueDate",
    ];

    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    if (
      updates.title !== undefined &&
      (typeof updates.title !== "string" || !updates.title.trim())
    ) {
      res.status(400).json({
        message: "Task title cannot be empty",
      });
      return;
    }

    if (
      updates.status !== undefined &&
      !["todo", "in_progress", "done"].includes(
        updates.status as string
      )
    ) {
      res.status(400).json({
        message: "Invalid task status",
      });
      return;
    }

    if (
      updates.priority !== undefined &&
      !["low", "medium", "high"].includes(
        updates.priority as string
      )
    ) {
      res.status(400).json({
        message: "Invalid task priority",
      });
      return;
    }

    if (updates.project !== undefined) {
      if (
        typeof updates.project !== "string" ||
        !mongoose.isValidObjectId(updates.project)
      ) {
        res.status(400).json({
          message: "Invalid project ID",
        });
        return;
      }

      const projectExists = await Project.findById(updates.project);

      if (!projectExists) {
        res.status(404).json({
          message: "Project not found",
        });
        return;
      }
    }

    if (updates.assignedTo !== undefined) {
      if (updates.assignedTo === null || updates.assignedTo === "") {
        updates.assignedTo = undefined;
      } else {
        if (
          typeof updates.assignedTo !== "string" ||
          !mongoose.isValidObjectId(updates.assignedTo)
        ) {
          res.status(400).json({
            message: "Invalid assigned user ID",
          });
          return;
        }

        const assignedUser = await User.findById(updates.assignedTo);

        if (!assignedUser) {
          res.status(404).json({
            message: "Assigned user not found",
          });
          return;
        }
      }
    }

    if (updates.dueDate !== undefined) {
      if (updates.dueDate === null || updates.dueDate === "") {
        updates.dueDate = undefined;
      } else {
        const parsedDate = new Date(updates.dueDate as string);

        if (Number.isNaN(parsedDate.getTime())) {
          res.status(400).json({
            message: "Invalid due date",
          });
          return;
        }

        updates.dueDate = parsedDate;
      }
    }

    if (typeof updates.title === "string") {
      updates.title = updates.title.trim();
    }

    const task = await Task.findByIdAndUpdate(taskId, updates, {
      new: true,
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
