
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
        required: ["name", "owner"],
        properties: {
          name: { type: "string", maxLength: 100, example: "Website redesign" },
          description: { type: "string", maxLength: 1000 },
          owner: {
            type: "string",
            pattern: "^[a-fA-F0-9]{24}$",
            example: "507f1f77bcf86cd799439011",
          },
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
        responses: {
          "200": { description: "Users returned successfully" },
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
        responses: {
          "200": { description: "User found" },
          "400": { description: "Invalid ID" },
          "404": { description: "User not found" },
        },
      },
    },
    "/api/projects": {
      get: {
        tags: ["Projects"],
        summary: "Get projects",
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
          "404": { description: "Project not found" },
          "401": { description: "Authentication required" },
        },
      },
      patch: {
        tags: ["Projects"],
        summary: "Update a project",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                minProperties: 1,
                properties: {
                  name: { type: "string", maxLength: 100 },
                  description: { type: "string", maxLength: 1000 },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Project updated" },
          "400": { description: "Validation failed" },
          "404": { description: "Project not found" },
          "401": { description: "Authentication required" },
        },
      },
      delete: {
        tags: ["Projects"],
        summary: "Delete a project",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Project deleted" },
          "404": { description: "Project not found" },
          "401": { description: "Authentication required" },
        },
      },
    },
    "/api/tasks": {
      get: {
        tags: ["Tasks"],
        summary: "Get tasks",
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
          "404": { description: "Task not found" },
          "401": { description: "Authentication required" },
        },
      },
      patch: {
        tags: ["Tasks"],
        summary: "Update a task",
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
          "200": { description: "Task updated" },
          "400": { description: "Validation failed" },
          "404": { description: "Task not found" },
          "401": { description: "Authentication required" },
        },
      },
      delete: {
        tags: ["Tasks"],
        summary: "Delete a task",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Task deleted" },
          "404": { description: "Task not found" },
          "401": { description: "Authentication required" },
        },
      },
    },
  },
};
