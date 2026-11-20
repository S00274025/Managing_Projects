
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import mongoose, { Types } from "mongoose";
import jwt from "jsonwebtoken";

import app from "../src/app";
import { Project } from "../src/models/Project";
import { Task } from "../src/models/Task";
import { User } from "../src/models/User";
import { JWT_SECRET } from "../src/config/env";

const testUserId = new Types.ObjectId().toString();

const token = jwt.sign(
  { userId: testUserId },
  JWT_SECRET,
  { expiresIn: "15m" }
);

const testUri = process.env.MONGODB_TEST_URI;

if (!testUri) {
  throw new Error("MONGODB_TEST_URI is not defined in .env");
}

const memberEmail = `member-${Date.now()}@example.com`;
const outsiderEmail = `outsider-${Date.now()}@example.com`;
let memberId = "";
let outsiderId = "";
let memberToken = "";
let outsiderToken = "";

const signToken = (userId: string) =>
  jwt.sign({ userId }, JWT_SECRET, { expiresIn: "15m" });

describe("Projects API integration tests", () => {
  beforeAll(async () => {
    await mongoose.connect(testUri);

    const member = await User.create({
      name: "Member",
      email: memberEmail,
      password: "hashed-password",
    });
    memberId = member._id.toString();
    memberToken = signToken(memberId);

    const outsider = await User.create({
      name: "Outsider",
      email: outsiderEmail,
      password: "hashed-password",
    });
    outsiderId = outsider._id.toString();
    outsiderToken = signToken(outsiderId);
  });

  beforeEach(async () => {
    await Task.deleteMany({});
    await Project.deleteMany({});
  });

  afterAll(async () => {
    await Task.deleteMany({});
    await Project.deleteMany({});
    await User.deleteMany({ email: { $in: [memberEmail, outsiderEmail] } });
    await mongoose.disconnect();
  });

  describe("project access", () => {
    it("should only list projects the user owns or is a member of", async () => {
      await Project.create({ name: "Mine", owner: testUserId });
      await Project.create({ name: "Shared with me", owner: outsiderId, members: [testUserId] });
      await Project.create({ name: "Not mine", owner: outsiderId });

      const response = await request(app)
        .get("/api/projects")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      const names = response.body.map((p: { name: string }) => p.name).sort();
      expect(names).toEqual(["Mine", "Shared with me"]);
    });

    it("should always use the logged in user as the owner", async () => {
      const response = await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Owner test", owner: outsiderId });

      expect(response.status).toBe(201);
      expect(response.body.owner).toBe(testUserId);
    });

    it("should return 403 when a non-member opens a project", async () => {
      const project = await Project.create({ name: "Private", owner: testUserId });

      const response = await request(app)
        .get(`/api/projects/${project._id}`)
        .set("Authorization", `Bearer ${outsiderToken}`);

      expect(response.status).toBe(403);
    });

    it("should let a member open the project", async () => {
      const project = await Project.create({ name: "Team", owner: testUserId, members: [memberId] });

      const response = await request(app)
        .get(`/api/projects/${project._id}`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(response.status).toBe(200);
    });

    it("should not let a member edit or delete the project", async () => {
      const project = await Project.create({ name: "Team", owner: testUserId, members: [memberId] });

      const patch = await request(app)
        .patch(`/api/projects/${project._id}`)
        .set("Authorization", `Bearer ${memberToken}`)
        .send({ name: "Renamed" });
      expect(patch.status).toBe(403);

      const del = await request(app)
        .delete(`/api/projects/${project._id}`)
        .set("Authorization", `Bearer ${memberToken}`);
      expect(del.status).toBe(403);

      expect(await Project.findById(project._id)).not.toBeNull();
    });

    it("should hide tasks of projects the user is not in", async () => {
      const project = await Project.create({ name: "Private", owner: testUserId });
      const task = await Task.create({ title: "Secret task", project: project._id });

      const list = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${outsiderToken}`);
      expect(list.status).toBe(200);
      expect(list.body).toHaveLength(0);

      const byProject = await request(app)
        .get(`/api/tasks?project=${project._id}`)
        .set("Authorization", `Bearer ${outsiderToken}`);
      expect(byProject.status).toBe(403);

      const byId = await request(app)
        .get(`/api/tasks/${task._id}`)
        .set("Authorization", `Bearer ${outsiderToken}`);
      expect(byId.status).toBe(403);
    });

    it("should let a member add a task to the project", async () => {
      const project = await Project.create({ name: "Team", owner: testUserId, members: [memberId] });

      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${memberToken}`)
        .send({ title: "Member task", project: project._id.toString(), assignedTo: memberId });

      expect(response.status).toBe(201);
    });

    it("should not assign a task to someone outside the project", async () => {
      const project = await Project.create({ name: "Team", owner: testUserId, members: [memberId] });

      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Task", project: project._id.toString(), assignedTo: outsiderId });

      expect(response.status).toBe(400);
    });
  });

  it("should create a project with members", async () => {
    const response = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Team Project", members: [memberId, memberId] });

    expect(response.status).toBe(201);
    expect(response.body.members).toEqual([memberId]);
  });

  it("should reject a member that does not exist", async () => {
    const response = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Team Project", members: [new Types.ObjectId().toString()] });

    expect(response.status).toBe(404);
  });

  it("should update project members with PATCH", async () => {
    const project = await Project.create({
      name: "Project",
      owner: testUserId,
    });

    const response = await request(app)
      .patch(`/api/projects/${project._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ members: [memberId] });

    expect(response.status).toBe(200);
    expect(response.body.members[0]._id).toBe(memberId);
  });

  it("should reject an invalid member ID", async () => {
    const response = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Team Project", members: ["not-an-id"] });

    expect(response.status).toBe(400);
  });

  it("should create a project", async () => {
    const response = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Integration Test Project",
        description: "Created during an integration test",
        owner: testUserId,
      });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe("Integration Test Project");
  });

  it("should return all projects", async () => {
    await Project.create({
      name: "Project for Listing",
      owner: testUserId,
    });

    const response = await request(app)
      .get("/api/projects")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe("Project for Listing");
  });

  it("should return a project by ID", async () => {
    const project = await Project.create({
      name: "Project Details",
      owner: testUserId,
    });

    const response = await request(app)
      .get(`/api/projects/${project._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Project Details");
  });

  it("should update a project", async () => {
    const project = await Project.create({
      name: "Old Project Name",
      owner: testUserId,
    });

    const response = await request(app)
      .patch(`/api/projects/${project._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated Project Name" });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Updated Project Name");
  });

  it("should replace a project with PUT", async () => {
    const project = await Project.create({
      name: "Old Project Name",
      description: "Old description",
      owner: testUserId,
    });

    const response = await request(app)
      .put(`/api/projects/${project._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "New Project Name", description: "New description", members: [] });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("New Project Name");
    expect(response.body.description).toBe("New description");
  });

  it("should reject a PUT with missing fields", async () => {
    const project = await Project.create({
      name: "Project Name",
      owner: testUserId,
    });

    const response = await request(app)
      .put(`/api/projects/${project._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Only the name" });

    expect(response.status).toBe(400);
  });

  it("should return 404 for a PUT on a project that does not exist", async () => {
    const response = await request(app)
      .put(`/api/projects/${new Types.ObjectId()}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Missing", description: "", members: [] });

    expect(response.status).toBe(404);
  });

  it("should delete a project", async () => {
    const project = await Project.create({
      name: "Project to Delete",
      owner: testUserId,
    });

    const response = await request(app)
      .delete(`/api/projects/${project._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(204);

    const deletedProject = await Project.findById(project._id);
    expect(deletedProject).toBeNull();
  });

  it("should return 404 for a project that does not exist", async () => {
    const missingId = new Types.ObjectId().toString();

    const response = await request(app)
      .get(`/api/projects/${missingId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

  it("should reject an invalid project ID", async () => {
    const response = await request(app)
      .get("/api/projects/not-a-valid-id")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
  });
});
