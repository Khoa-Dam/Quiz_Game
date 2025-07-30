import express from "express";
import { createRoom, joinRoom, getRoomStatus } from "../../controllers/room/roomController.js";
import userAuth from "../../middleware/userAuth.js";

const roomRouter = express.Router();

// POST /api/room/create - Tạo room mới
roomRouter.post("/create", userAuth, createRoom);

// POST /api/room/join - Join room bằng PIN
roomRouter.post("/join", userAuth, joinRoom);

// GET /api/room/:id/status - Lấy trạng thái room
roomRouter.get("/:id/status", getRoomStatus);

export default roomRouter;