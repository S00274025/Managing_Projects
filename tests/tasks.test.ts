import request from "supertest";
import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import app from "../src/app";
import { JWT_SECRET } from "../src/config/env";

const token = jwt.sign(
  { userId: new Types.ObjectId().toString() },
  JWT_SECRET,
  { expiresIn: "15m" }
);

describe("Tasks API", () => {
  it("should reject GET tasks without authentication", async () => {
    const response = await request(app).get("/api/tasks");

    expect(response.status).toBe(401);
  });

  it("should reject POST tasks without authentication", async () => {
    const response = await request(app)
      .post("/api/tasks")
      .send({
        title: "Test Task",
        description: "A task for testing",
        status: "todo",
        priority: "medium",
        project: "507f1f77bcf86cd799439011",
      });

    expect(response.status).toBe(401);
  });

  it("should reject PUT tasks without authentication", async () => {
    const response = await request(app)
      .put(`/api/tasks/${new Types.ObjectId()}`)
      .send({ title: "Test Task" });

    expect(response.status).toBe(401);
  });

  it("should reject a PUT task update with missing fields", async () => {
    // PUT is a full update, so sending only the title is not enough
    const response = await request(app)
      .put(`/api/tasks/${new Types.ObjectId()}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Only the title" });

    expect(response.status).toBe(400);
  });
});
