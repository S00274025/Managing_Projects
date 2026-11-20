import { Response } from "express";
import { Types } from "mongoose";
import { Project } from "../models/Project";



export type ProjectRole = "owner" | "member" | "none" | "not_found";

export const visibleProjectsFilter = (userId: string) => ({
    $or: [{ owner: userId }, { members: userId }],
});

export const visibleProjectIds = async (userId: string): Promise<Types.ObjectId[]> => {
    const projects = await Project.find(visibleProjectsFilter(userId)).select("_id").lean();
    return projects.map((project) => project._id);
};

export const getProjectRole = async (
    projectId: string | Types.ObjectId,
    userId: string
): Promise<ProjectRole> => {
    const project = await Project.findById(projectId).select("owner members").lean();

    if (!project) return "not_found";
    if (project.owner.toString() === userId) return "owner";
    if (project.members.some((member) => member.toString() === userId)) return "member";
    return "none";
};

export const checkProjectRole = (
    role: ProjectRole,
    res: Response,
    needOwner = false
): boolean => {
    if (role === "not_found") {
        res.status(404).json({ message: "Project not found" });
        return false;
    }

    if (role === "none") {
        res.status(403).json({ message: "You are not a member of this project" });
        return false;
    }

    if (needOwner && role !== "owner") {
        res.status(403).json({ message: "Only the project owner can do this" });
        return false;
    }

    return true;
};
