
export const openapiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Managing Projects API",
    version: "1.0.0",
    description:
      "REST API for managing users, projects and tasks. " +
      "Protected endpoints require a JWT Bearer token.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development server",
    },
  ],
  tags: [
    { name: "Authentication", description: "Register and log in" },
    { name: "Users", description: "User management" },
    { name: "Projects", description: "Project management" },
    { name: "Tasks", description: "Task management" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      UserInput: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", maxLength: 100, example: "Alex" },
          email: { type: "string", format: "email", example: "alex@example.com" },
          password: { type: "string", minLength: 6, example: "secret123" },
        },
      },
      ProjectInput: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", maxLength: 100, example: "Website redesign" },
          description: { type: "string", maxLength: 1000 },
          owner: {
            type: "string",
            pattern: "^[a-fA-F0-9]{24}$",
            description: "Ignored - the owner is always the logged in user",
            example: "507f1f77bcf86cd799439011",
          },
          members: {
            type: "array",
            items: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
            description: "User IDs; duplicates are removed",
          },
        },
      },
      ProjectReplaceInput: {
        type: "object",
        required: ["name", "description", "members"],
        properties: {
          name: { type: "string", maxLength: 100, example: "Website redesign" },
          description: { type: "string", maxLength: 1000, example: "" },
          members: {
            type: "array",
            items: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
          },
        },
      },
      ProjectUpdateInput: {
        type: "object",
        minProperties: 1,
        properties: {
          name: { type: "string", maxLength: 100 },
          description: { type: "string", maxLength: 1000 },
          members: {
            type: "array",
            items: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
          },
        },
      },
      TaskReplaceInput: {
        type: "object",
        required: [
          "title",
          "description",
          "status",
          "priority",
          "project",
          "assignedTo",
          "dueDate",
        ],
        properties: {
          title: { type: "string", maxLength: 200, example: "Create homepage" },
          description: { type: "string", maxLength: 2000, nullable: true },
          status: { type: "string", enum: ["todo", "in_progress", "done"] },
          priority: { type: "string", enum: ["low", "medium", "high"] },
          project: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
          assignedTo: {
            type: "string",
            pattern: "^[a-fA-F0-9]{24}$",
            nullable: true,
          },
          dueDate: { type: "string", format: "date-time", nullable: true },
        },
      },
      TaskUpdateInput: {
        type: "object",
        minProperties: 1,
        properties: {
          title: { type: "string", maxLength: 200 },
          description: { type: "string", maxLength: 2000, nullable: true },
          status: { type: "string", enum: ["todo", "in_progress", "done"] },
          priority: { type: "string", enum: ["low", "medium", "high"] },
          project: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
          assignedTo: {
            type: "string",
            pattern: "^[a-fA-F0-9]{24}$",
            nullable: true,
          },
          dueDate: { type: "string", format: "date-time", nullable: true },
        },
      },
      TaskInput: {
        type: "object",
        required: ["title", "project"],
        properties: {
          title: { type: "string", maxLength: 200, example: "Create homepage" },
          description: { type: "string", maxLength: 2000 },
          status: {
            type: "string",
            enum: ["todo", "in_progress", "done"],
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
          },
          project: {
            type: "string",
            pattern: "^[a-fA-F0-9]{24}$",
          },
          assignedTo: {
            type: "string",
            pattern: "^[a-fA-F0-9]{24}$",
          },
          dueDate: {
            type: "string",
            format: "date-time",
          },
        },
      },
      ApiError: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Validation failed" },
        },
      },
    },
  },
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register a new user",
        description: "Creates an account after validating the submitted data.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserInput" },
            },
          },
        },
        responses: {
          "201": { description: "User registered successfully" },
          "400": {
            description: "Invalid input",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
          "409": { description: "Email already exists, if handled by the API" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Log in",
        description: "Checks credentials and returns an authentication token.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Login successful" },
          "400": { description: "Invalid request data" },
          "401": { description: "Invalid credentials" },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Authentication"],
        summary: "Get current user",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Current user returned" },
          "401": { description: "Missing or invalid token" },
        },
      },
    },
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "Get users",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Users returned successfully" },
          "401": { description: "Authentication required" },
        },
      },
      post: {
        tags: ["Users"],
        summary: "Create a user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserInput" },
            },
          },
        },
        responses: {
          "201": { description: "User created" },
          "400": { description: "Validation failed" },
        },
      },
    },
    "/api/users/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "MongoDB user ID",
          schema: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
        },
      ],
      get: {
        tags: ["Users"],
        summary: "Get a user by ID",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "User found" },
          "401": { description: "Authentication required" },
          "400": { description: "Invalid ID" },
          "404": { description: "User not found" },
        },
      },
    },
    "/api/projects": {
      get: {
        tags: ["Projects"],
        summary: "Get projects",
        description: "Only projects where the logged in user is the owner or a member. Optional ?search= filters by name.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Projects returned successfully" },
          "401": { description: "Authentication required" },
        },
      },
      post: {
        tags: ["Projects"],
        summary: "Create a project",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProjectInput" },
            },
          },
        },
        responses: {
          "201": { description: "Project created" },
          "400": { description: "Validation failed" },
          "401": { description: "Authentication required" },
          "404": { description: "Member not found" },
        },
      },
    },
    "/api/projects/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "MongoDB project ID",
          schema: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
        },
      ],
      get: {
        tags: ["Projects"],
        summary: "Get a project by ID",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Project found" },
          "403": { description: "Not the owner or a member of this project" },
          "404": { description: "Project not found" },
          "401": { description: "Authentication required" },
        },
      },
      put: {
        tags: ["Projects"],
        summary: "Replace a project (full update)",
        description: "All fields must be sent. The owner cannot be changed.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProjectReplaceInput" },
            },
          },
        },
        responses: {
          "200": { description: "Project updated" },
          "400": { description: "Validation failed or invalid ID" },
          "403": { description: "Only the project owner can do this" },
          "404": { description: "Project or member not found" },
          "401": { description: "Authentication required" },
        },
      },
      patch: {
        tags: ["Projects"],
        summary: "Update a project (partial update)",
        description: "Only the fields that are sent are changed.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProjectUpdateInput" },
            },
          },
        },
        responses: {
          "200": { description: "Project updated" },
          "400": { description: "Validation failed or invalid ID" },
          "403": { description: "Only the project owner can do this" },
          "404": { description: "Project or member not found" },
          "401": { description: "Authentication required" },
        },
      },
      delete: {
        tags: ["Projects"],
        summary: "Delete a project",
        description: "Also deletes all tasks of the project.",
        security: [{ bearerAuth: [] }],
        responses: {
          "204": { description: "Project deleted" },
          "403": { description: "Only the project owner can do this" },
          "404": { description: "Project not found" },
          "401": { description: "Authentication required" },
        },
      },
    },
    "/api/tasks": {
      get: {
        tags: ["Tasks"],
        summary: "Get tasks",
        description: "Only tasks from projects the user can see. Optional ?project= and ?status= filters.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Tasks returned successfully" },
          "401": { description: "Authentication required" },
        },
      },
      post: {
        tags: ["Tasks"],
        summary: "Create a task",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TaskInput" },
            },
          },
        },
        responses: {
          "201": { description: "Task created" },
          "400": { description: "Validation failed" },
          "401": { description: "Authentication required" },
          "403": { description: "Not a member of the project" },
          "404": { description: "Project or assigned user not found" },
        },
      },
    },
    "/api/tasks/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "MongoDB task ID",
          schema: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
        },
      ],
      get: {
        tags: ["Tasks"],
        summary: "Get a task by ID",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Task found" },
          "403": { description: "Not a member of the project" },
          "404": { description: "Task not found" },
          "401": { description: "Authentication required" },
        },
      },
      put: {
        tags: ["Tasks"],
        summary: "Replace a task (full update)",
        description: "All fields must be sent; use null for no description, assigned user or due date.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TaskReplaceInput" },
            },
          },
        },
        responses: {
          "200": { description: "Task updated" },
          "400": { description: "Validation failed or invalid ID" },
          "403": { description: "Not a member of the project" },
          "404": { description: "Task, project or assigned user not found" },
          "401": { description: "Authentication required" },
        },
      },
      patch: {
        tags: ["Tasks"],
        summary: "Update a task (partial update)",
        description: "Only the fields that are sent are changed; null clears a field.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TaskUpdateInput" },
            },
          },
        },
        responses: {
          "200": { description: "Task updated" },
          "400": { description: "Validation failed or invalid ID" },
          "403": { description: "Not a member of the project" },
          "404": { description: "Task, project or assigned user not found" },
          "401": { description: "Authentication required" },
        },
      },
      delete: {
        tags: ["Tasks"],
        summary: "Delete a task",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Task deleted" },
          "403": { description: "Not a member of the project" },
          "404": { description: "Task not found" },
          "401": { description: "Authentication required" },
        },
      },
    },
  },
};
