const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://localhost:5500",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  //監聽"join_room" event, 是相同的room number才能互傳訊息
  socket.on("join_room", (data) => {
    socket.join(data);
  });

  //on監聽"send_message" event
  socket.on("send_message", (data) => {
    // console.log(data);
    socket.broadcast.emit("receive_message", data, socket.id);
    // socket.to(data.room).emit("receive_message", data);
  });
});

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});
