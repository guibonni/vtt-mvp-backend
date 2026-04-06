import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { initializeSocket } from "./socket/socket";

import { authMiddleware } from "./middleware/auth.middleware";

import authRoutes from "./routes/auth.routes";
import sessionRoutes from "./routes/session.routes";
import characterRoutes from "./routes/character.routes";
import messageRoutes from "./routes/message.routes";
import templateRoutes from "./routes/template.routes";

const app = express();

const openApiPath = path.resolve(process.cwd(), "openapi.yaml");
const openApiDocument = YAML.load(openApiPath);

app.use(cors());
app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.get("/docs/openapi.yaml", (_req, res) => {
  res.sendFile(openApiPath);
});

// Rotas públicas
app.use("/auth", authRoutes);

app.use(authMiddleware);

// Rotas protegidas
app.use("/sessions", sessionRoutes);
app.use("/sessions", characterRoutes);
app.use("/sessions", messageRoutes);
app.use("/templates", templateRoutes);

app.get("/", (_req, res) => {
  res.send("VTT Backend Running");
});

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

initializeSocket();

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
