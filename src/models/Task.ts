import { Schema, model, Types } from "mongoose";

export type TaskStatus = "todo" | "in_progress" | "done";

export type TaskPriority = "low" | "medium" | "high";

export interface ITask {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    project: Types.ObjectId;
    assignedTo?: Types.ObjectId;
    dueDate?: Date;
}

const taskSchema = new Schema<ITask>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        status: {
            type: String,
            enum: ["todo", "in_progress", "done"],
            default: "todo",
        },

        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
        },

        project: {
            type: Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },

        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },

        dueDate: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

export const Task = model<ITask>("Task", taskSchema);