
import { Request, Response } from "express";
import mongoose from "mongoose";
import { Task } from "../models/Task";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  checkProjectRole,
  getProjectRole,
  visibleProjectIds,
} from "../utils/projectAccess";

const currentUserId = (req: Request): string => (req as AuthRequest).userId ?? "";

const checkAssignee = async (
  projectId: string,
  assignedTo: string,
  res: Response
): Promise<boolean> => {
  const assignedUser = await User.findById(assignedTo);

  if (!assignedUser) {
    res.status(404).json({
      message: "Assigned user not found",
    });
    return false;
  }

  const role = await getProjectRole(projectId, assignedTo);

  if (role === "none" || role === "not_found") {
    res.status(400).json({
      message: "Assigned user is not a member of this project",
    });
    return false;
  }

  return true;
};

const checkTaskAccess = async (
  taskId: string,
  req: Request,
  res: Response
): Promise<string | null> => {
  const task = await Task.findById(taskId).select("project").lean();

  if (!task) {
    res.status(404).json({
      message: "Task not found",
    });
    return null;
  }

  const projectId = task.project.toString();
  const role = await getProjectRole(projectId, currentUserId(req));

  if (role === "not_found") {
    res.status(404).json({
      message: "Task not found",
    });
    return null;
  }

  if (!checkProjectRole(role, res)) return null;

  return projectId;
};

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

    const role = await getProjectRole(project, currentUserId(req));
    if (!checkProjectRole(role, res)) return;

    if (assignedTo !== undefined && assignedTo !== null) {
      if (!(await checkAssignee(project, assignedTo, res))) return;
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

      const role = await getProjectRole(req.query.project, currentUserId(req));
      if (!checkProjectRole(role, res)) return;

      filter.project = req.query.project;
    } else {
      filter.project = { $in: await visibleProjectIds(currentUserId(req)) };
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

    if (!(await checkTaskAccess(taskId, req, res))) return;

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

    const currentProjectId = await checkTaskAccess(taskId, req, res);
    if (!currentProjectId) return;

    const updates: Record<string, unknown> = { ...req.body };

    if (updates.project !== undefined) {
      const role = await getProjectRole(String(updates.project), currentUserId(req));
      if (!checkProjectRole(role, res)) return;
    }

    if (updates.assignedTo) {
      const projectId = updates.project !== undefined ? String(updates.project) : currentProjectId;
      if (!(await checkAssignee(projectId, String(updates.assignedTo), res))) return;
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

    if (!(await checkTaskAccess(taskId, req, res))) return;

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
