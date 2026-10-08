import dotenv from "dotenv";

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

const mongodbUri = process.env.MONGODB_URI;

if (!mongodbUri) {
    throw new Error("MONGODB_URI is not defined in .env");
}

const MONGODB_URI: string = mongodbUri;

export {
    PORT,
    MONGODB_URI
};