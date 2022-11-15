const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://localhost:3001",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}, index2`);

  //監聽"join_room" event, 是相同的room number才能互傳訊息
  socket.on('user_join', (uuid) => {
    socket.join(uuid);
  });

  //on監聽"send_message" event
  socket.on("send_message", (data) => {
    // console.log(data);
    socket.broadcast.emit("receive_message", data, socket.id);
    // socket.to(data.room).emit("receive_message", data);
  });
});

const PORT = 3000 || process.env.REACT_APP_PORT;

//將 express 放進 http 中開啟 Server 的 3000 port ，正確開啟後會在 console 中印出訊息
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
