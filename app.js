import express from "express";
import http from "http";
import cors from "cors";
import "./db.js";
import socketGame from "./socket.js";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
socketGame(server);

server.listen(3000,()=>{
  console.log("🎮 KANG DEMO RUN http://localhost:3000");
});
