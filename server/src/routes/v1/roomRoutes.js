import express from "express";
import { createRoom, joinRoom, getRoomStatus } from "../../modules/room/roomController.js";
import userAuth from "../../middleware/userAuth.js";

const roomRouter = express.Router();

roomRouter.post("/create", userAuth, createRoom);

roomRouter.post("/join", userAuth, joinRoom);

roomRouter.get("/:roomId/status", userAuth, getRoomStatus);

export default roomRouter;