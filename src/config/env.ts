
import dotenv from "dotenv";

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

const mongodbUri = process.env.MONGODB_URI;

if (!mongodbUri) {
  throw new Error("MONGODB_URI is not defined in .env");
}

const MONGODB_URI: string = mongodbUri;

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET is not defined in .env");
}

const JWT_SECRET: string = jwtSecret;

export { PORT, MONGODB_URI, JWT_SECRET };
