import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import v1Routes from "./routes/v1/index.js";
import { GameSocketService } from "./services/socket/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { specs, swaggerUi } from "./config/swagger.js";
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Configure for production
    methods: ["GET", "POST"],
  },
});

const port = process.env.PORT || 3000;
connectDB();

app.use(cors({ 
    origin: "http://localhost:3000", // Cho phép cụ thể frontend
    credentials: true 
}));
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static("uploads"));

// Routes
app.get("/", (req, res) => {
  res.send("🎮 Quiz Game API working");
});

// Swagger Documentation
app.use("/api-ui", swaggerUi.serve, swaggerUi.setup(specs));

// API Routes
app.use("/api/v1", v1Routes);

app.use(errorHandler);

// Initialize Socket.IO
const gameSocketService = new GameSocketService(io);
gameSocketService.initializeEvents();

server.listen(port, () => {
  console.log(`🚀 Server is running on port http://localhost:${port}`);
  console.log(`🎮 Socket.IO ready for realtime quiz game`);
});
