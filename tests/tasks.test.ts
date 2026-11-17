import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../src/app";

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
});