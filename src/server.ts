import "dotenv/config";
import cors from "cors";
import express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { authMiddleware } from "./middleware/auth.middleware";
import authRoutes from "./routes/auth.routes";
import characterRoutes from "./routes/character.routes";
import messageRoutes from "./routes/message.routes";
import sessionRoutes from "./routes/session.routes";
import templateRoutes from "./routes/template.routes";
import userRoutes from "./routes/user.routes";
import { initializeSocket } from "./socket/socket";

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

app.get("/", (_req, res) => {
  res.send("VTT Backend Running");
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Rotas publicas
app.use("/auth", authRoutes);

app.use(authMiddleware);

// Rotas protegidas
app.use("/sessions", sessionRoutes);
app.use("/sessions", characterRoutes);
app.use("/sessions", messageRoutes);
app.use("/templates", templateRoutes);
app.use("/user", userRoutes);

const server = http.createServer(app);

server.on("connection", (socket) => {
  console.log(
    `[server:connection] remote=${socket.remoteAddress ?? "unknown"}:${socket.remotePort ?? "unknown"}`,
  );

  socket.on("close", (hadError) => {
    console.log(
      `[server:connection:close] remote=${socket.remoteAddress ?? "unknown"}:${socket.remotePort ?? "unknown"} hadError=${hadError}`,
    );
  });
});

server.on("request", (req, res) => {
  const startedAt = Date.now();

  console.log(
    `[server:request] ${req.method ?? "UNKNOWN"} ${req.url ?? "unknown"}`,
  );

  res.on("finish", () => {
    console.log(
      `[server:response] ${req.method ?? "UNKNOWN"} ${req.url ?? "unknown"} status=${res.statusCode} durationMs=${Date.now() - startedAt}`,
    );
  });
});

server.on("clientError", (error, socket) => {
  console.error("[server:clientError]", error.message);

  if (socket.writable) {
    socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
  }
});

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
