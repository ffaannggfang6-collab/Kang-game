const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

/* ===== เสิร์ฟ client ===== */
app.use(express.static(path.join(__dirname, 'client')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

/* ===== SOCKET ===== */
io.on('connection', (socket) => {
  console.log('เชื่อมต่อ:', socket.id);

  socket.on('login', (username) => {
    console.log('login:', username);
    socket.emit('update_data', {
      credit: 1000
    });
  });

  socket.on('join_room', (price) => {
    socket.join('room_' + price);
    console.log('เข้าห้องราคา', price);
  });

  socket.on('player_action', (data) => {
    console.log('action:', data);
  });

  socket.on('disconnect', () => {
    console.log('ออก:', socket.id);
  });
});

/* ===== START ===== */
server.listen(PORT, () => {
  console.log('Kang game server running on port', PORT);
});
