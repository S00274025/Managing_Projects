import { Schema, model, Types } from "mongoose";

export interface IProject {
    name: string;
    description?: string;
    owner: Types.ObjectId;
    members: Types.ObjectId[];
}

const projectSchema = new Schema<IProject>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        members: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    {
        timestamps: true,
    }
);

export const Project = model<IProject>("Project", projectSchema);