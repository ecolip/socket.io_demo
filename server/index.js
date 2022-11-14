const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

app.use(cors());
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3001',
      // 'https://localhost:5500',
      // 'https://cowork2.site',
      '*'
    ],
    methods: ['GET', 'POST'],
  },
});

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

//監聽 Server 連線後的所有事件，並捕捉事件 socket 執行
io.on('connection', (socket) => {
  console.log(`New Connection: ${socket.id} ...`);

  socket.on('user_join', (uuid) => {
    socket.join(uuid);
  });

  // Listen for chatMessage
  socket.on('send_message', (playload) => {
    console.log('監聽send_message一次', playload);
    io.to(playload.uuid).emit('receive_message', playload);
  });
});

const PORT = 3000 || process.env.REACT_APP_PORT;

//將 express 放進 http 中開啟 Server 的 3000 port ，正確開啟後會在 console 中印出訊息
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
