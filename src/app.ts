import express from "express";
import projectRoutes from "./routes/projectRoutes";
import userRoutes from "./routes/userRoutes";
import taskRoutes from "./routes/taskRoutes";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Managing Projects API is running!"
    });
});

app.use("/api/projects", projectRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);

export default app;