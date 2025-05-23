import http from "http";
import { WebSocketServer } from "ws";
import express from "express";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.use((req, res, next) => res.redirect("/"));

const handleListen = () => console.log("Server is running on http://localhost:3000");
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const sockets = [];

wss.on("connection", (socket) => {
  sockets.push(socket);
  socket["nickname"] = "Anonymous";
  console.log("Connected to Browser");
  socket.on("close", () => {
    console.log("Disconnected from Browser");
  });
  socket.on("message", (msg) => {
    const message = JSON.parse(msg);
    switch(message.type){
      case "new_message":
        sockets.forEach(aSocket => aSocket.send(`${socket["nickname"]}: ${message.payload}`));
        break;
      case "nickname":
        socket["nickname"] = message.payload;
        break;
    }
  });
});

server.listen(3000, handleListen);