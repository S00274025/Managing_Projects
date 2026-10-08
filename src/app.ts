import express from "express";
import projectRoutes from "./routes/projectRoutes";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Managing Projects API is running!"
    });
});

app.use("/api/projects", projectRoutes);

export default app;