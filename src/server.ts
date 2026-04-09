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
import userRoutes from "./routes/user.routes";

const app = express();

const openApiPath = path.resolve(process.cwd(), "openapi.yaml");
const openApiDocument = YAML.load(openApiPath);

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  const startedAt = Date.now();

  console.log(
    `[request:start] ${req.method} ${req.originalUrl} ip=${req.ip ?? "unknown"}`,
  );

  res.on("finish", () => {
    console.log(
      `[request:finish] ${req.method} ${req.originalUrl} status=${res.statusCode} durationMs=${Date.now() - startedAt}`,
    );
  });

  res.on("close", () => {
    if (!res.writableEnded) {
      console.warn(
        `[request:close] ${req.method} ${req.originalUrl} connection closed before response finished after ${Date.now() - startedAt}ms`,
      );
    }
  });

  next();
});

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
app.use("/user", userRoutes);

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

process.on("unhandledRejection", (reason) => {
  console.error("[process:unhandledRejection]", reason);
});

process.on("uncaughtException", (error) => {
  console.error("[process:uncaughtException]", error);
});

process.on("SIGTERM", () => {
  console.warn("[process:signal] Received SIGTERM");
});

process.on("SIGINT", () => {
  console.warn("[process:signal] Received SIGINT");
});

server.on("error", (error) => {
  console.error("[server:error]", error);
});

server.on("close", () => {
  console.warn("[server:close] HTTP server closed");
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
