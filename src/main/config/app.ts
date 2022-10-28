import express from "express";
import http from "http";
import {Server} from "socket.io";

const app = express();

const serverHTTP = http.createServer(app);

const io = new Server(serverHTTP, {
  cors: {origin: "http://localhost:3000"},
  connectTimeout: 1000 * 60 * 30,
  // transports: ["websocket"],
  allowUpgrades: true,
});

export {serverHTTP, io};
