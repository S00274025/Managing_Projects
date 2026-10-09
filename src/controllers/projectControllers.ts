import { Request, Response } from "express";
import { Types } from "mongoose";
import { Project } from "../models/Project";
import { AuthRequest } from "../middleware/authMiddleware";

export const createProject = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { name, description, owner, members } = req.body;

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
        const projects = await Project.find()
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
                new: true,
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

        res.status(204).send();
    } catch (error) {
        console.error("Delete project error:", error);

        res.status(500).json({
            message: "Failed to delete project"
        });
    }
};