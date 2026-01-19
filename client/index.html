const express = require('express');
const http = require('http');
const path = require('path');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// ================= SOCKET =================
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// ================= DATABASE =================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

// ================= FRONTEND =================
// บอก express ให้เสิร์ฟไฟล์ในโฟลเดอร์ public
app.use(express.static(path.join(__dirname, 'public')));

// หน้าแรก → โหลด index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// route ไว้เช็คว่า server ยังรันอยู่
app.get('/status', (req, res) => {
  res.send('Kang game server running');
});

// ================= GAME CONFIG =================
const ROOM_CONFIG = {
  10: { fee: 1 },
  20: { fee: 1 },
  50: { fee: 1 },
  70: { fee: 2 },
  100: { fee: 2 }
};

const MAX_PLAYERS = 5;
const users = {};
const rooms = {};

// ================= SOCKET LOGIC =================
io.on('connection', (socket) => {
  console.log('🟢 connected:', socket.id);

  socket.on('login', (username) => {
    users[socket.id] = {
      id: socket.id,
      username,
      credit: 1000,
      room: null
    };
    socket.emit('update_data', users[socket.id]);
  });

  socket.on('join_room', (price) => {
    const roomId = `room_${price}`;
    if (!rooms[roomId]) rooms[roomId] = [];

    if (rooms[roomId].length >= MAX_PLAYERS) {
      socket.emit('error_msg', 'ห้องเต็ม');
      return;
    }

    rooms[roomId].push(socket.id);
    users[socket.id].room = roomId;
    socket.join(roomId);
  });

  socket.on('player_action', ({ type }) => {
    if (type !== 'KANG') return;

    const user = users[socket.id];
    if (!user || !user.room) return;

    const price = Number(user.room.replace('room_', ''));
    const players = rooms[user.room].length;
    const fee = ROOM_CONFIG[price].fee;

    const pool = price * (players - 1);
    const totalFee = fee * (players - 1);
    const netWin = pool - totalFee;

    user.credit += netWin;

    socket.emit('game_result', {
      netWin,
      totalFee
    });

    socket.emit('update_data', user);
  });

  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user?.room) {
      rooms[user.room] = rooms[user.room].filter(id => id !== socket.id);
    }
    delete users[socket.id];
  });
});

// ================= START =================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
