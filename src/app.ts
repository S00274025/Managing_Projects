import express from "express";
import projectRoutes from "./routes/projectRoutes";
import userRoutes from "./routes/userRoutes";
import taskRoutes from "./routes/taskRoutes";
import { notFoundHandler,  errorHandler,} from "./middleware/errorHandler";
import authRoutes from "./routes/authRoutes";
import swaggerUi from "swagger-ui-express";
import { openapiDocument } from "./docs/openapi";

const app = express();

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiDocument));

app.get("/", (req, res) => {
    res.json({
        message: "Managing Projects API is running!"
    });
});

app.use("/api/projects", projectRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/auth", authRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;