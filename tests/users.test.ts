import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../src/app";

describe("Users API", () => {
  it("should reject GET users without authentication", async () => {
    const response = await request(app).get("/api/users");

    expect(response.status).toBe(401);
  });

  it("should reject GET user by ID without authentication", async () => {
    const response = await request(app).get(
      "/api/users/507f1f77bcf86cd799439011"
    );

    expect(response.status).toBe(401);
  });
});