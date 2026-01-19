const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// serve client
app.use(express.static(path.join(__dirname, '../client')));

io.on('connection', socket => {
  console.log('เชื่อมต่อ:', socket.id);

  socket.on('login', username => {
    if (!username) {
      socket.emit('error_msg', 'ชื่อไม่ถูกต้อง');
      return;
    }

    socket.data.username = username;
    socket.data.credit = 1000;

    console.log('login:', username);

    socket.emit('login_success', {
      username,
      credit: socket.data.credit
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('SERVER RUNNING ON', PORT);
});
