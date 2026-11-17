import { Request, Response } from "express";
import { Types } from "mongoose";
import { Project } from "../models/Project";
import { Task } from "../models/Task";
import { AuthRequest } from "../middleware/authMiddleware";

export const createProject = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { name, description, members } = req.body;
        // Part 2: if no owner is sent, the logged in user (from the JWT) is the owner
        const owner = req.body.owner ?? (req as AuthRequest).userId;

        if (!name || !owner) {
            res.status(400).json({
                message: "Name and owner are required"
            });
            return;
        }

        if (!Types.ObjectId.isValid(owner)) {
            res.status(400).json({
                message: "Invalid owner ID"
            });
            return;
        }

        const project = await Project.create({
            name,
            description,
            owner,
            members: members || []
        });

        res.status(201).json(project);
    } catch (error) {
        console.error("Create project error:", error);

        res.status(500).json({
            message: "Failed to create project"
        });
    }
};

export const getProjects = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        // Part 2: optional ?search=text filter on the project name (case insensitive)
        const filter: Record<string, unknown> = {};

        if (typeof req.query.search === "string" && req.query.search.trim()) {
            // escape regex special characters so the user's text is matched literally
            const escaped = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.name = { $regex: escaped, $options: "i" };
        }

        const projects = await Project.find(filter)
            .populate("owner", "name email")
            .populate("members", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json(projects);
    } catch (error) {
        console.error("Get projects error:", error);

        res.status(500).json({
            message: "Failed to get projects"
        });
    }
};

export const getProjectById = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const projectId = Array.isArray(id) ? id[0] : id;

        if (!projectId || !Types.ObjectId.isValid(projectId)) 
        {
            res.status(400).json({
                message: "Invalid project ID"
            });
            return;
        }

        const project = await Project.findById(projectId)
            .populate("owner", "name email")
            .populate("members", "name email");

        if (!project) {
            res.status(404).json({
                message: "Project not found"
            });
            return;
        }

        res.status(200).json(project);
    } catch (error) {
        console.error("Get project error:", error);

        res.status(500).json({
            message: "Failed to get project"
        });
    }
};

export const updateProject = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const projectId = Array.isArray(id) ? id[0] : id;
        const { name, description, members } = req.body;

        if (!projectId || !Types.ObjectId.isValid(projectId)) {
            res.status(400).json({
                message: "Invalid project ID"
            });
            return;
        }

        const project = await Project.findByIdAndUpdate(
    projectId,
            {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(members !== undefined && { members })
            },
            {
                returnDocument: "after",
                runValidators: true
            }
        )
            .populate("owner", "name email")
            .populate("members", "name email");

        if (!project) {
            res.status(404).json({
                message: "Project not found"
            });
            return;
        }

        res.status(200).json(project);
    } catch (error) {
        console.error("Update project error:", error);

        res.status(500).json({
            message: "Failed to update project"
        });
    }
};

export const deleteProject = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
      const { id } = req.params;
        const projectId = Array.isArray(id) ? id[0] : id;

        if (!projectId || !Types.ObjectId.isValid(projectId)) {
            res.status(400).json({
                message: "Invalid project ID"
            });
            return;
        }

        const project = await Project.findByIdAndDelete(projectId);

        if (!project) {
            res.status(404).json({
                message: "Project not found"
            });
            return;
        }

        // Part 2: also delete the tasks that belonged to this project,
        // otherwise they would be left pointing at a project that no longer exists
        await Task.deleteMany({ project: projectId });

        res.status(204).send();
    } catch (error) {
        console.error("Delete project error:", error);

        res.status(500).json({
            message: "Failed to delete project"
        });
    }
};