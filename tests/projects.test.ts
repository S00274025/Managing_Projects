
import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

import app from "../src/app";
import { JWT_SECRET } from "../src/config/env";

const testUserId = new Types.ObjectId().toString();

const token = jwt.sign(
  { userId: testUserId },
  JWT_SECRET,
  { expiresIn: "15m" }
);

describe("Projects API", () => {
  it("should reject GET projects without a token", async () => {
    const response = await request(app).get("/api/projects");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "Authentication token is required"
    );
  });

  it("should reject POST projects without a token", async () => {
    const response = await request(app)
      .post("/api/projects")
      .send({
        name: "Test Project",
        owner: testUserId,
      });

    expect(response.status).toBe(401);
  });

  it("should reject a project with a missing name", async () => {
    const response = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({
        description: "Project without a name",
        owner: testUserId,
      });

    expect(response.status).toBe(400);
  });

  it("should reject an empty project name", async () => {
    const response = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "   ",
        owner: testUserId,
      });

    expect(response.status).toBe(400);
  });

  it("should reject an invalid owner ID", async () => {
    const response = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Test Project",
        owner: "invalid-id",
      });

    expect(response.status).toBe(400);
  });

  it("should reject an empty project update", async () => {
    const response = await request(app)
      .patch(`/api/projects/${new Types.ObjectId()}`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);
  });

  it("should reject an invalid token", async () => {
    const response = await request(app)
      .get("/api/projects")
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);
  });
});
