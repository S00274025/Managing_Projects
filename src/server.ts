import app from "./app";
import { PORT } from "./config/env";
import { connectDatabase } from "./config/database";

const startServer = async (): Promise<void> => {
    await connectDatabase();

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
};

startServer();