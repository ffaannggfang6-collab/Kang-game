// ================== IMPORT ==================
const express = require('express');
const http = require('http');
const path = require('path');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
require('dotenv').config();

// ================== APP ==================
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// ================== MONGODB ==================
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ================== STATIC FRONTEND ==================
app.use(express.static(path.join(__dirname, 'public')));

// หน้าแรก (แก้ปัญหาหน้าขาว)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ================== GAME CONFIG ==================
const ROOM_CONFIG = {
  10: { fee: 1 },
  20: { fee: 1 },
  50: { fee: 1 },
  70: { fee: 2 },
  100:{ fee: 2 }
};

const MAX_PLAYERS = 5;

// ห้องเกม
let rooms = {}; 
let users = {};

// ================== SOCKET ==================
io.on('connection', (socket) => {
  console.log('🟢 Player connected:', socket.id);

  // login
  socket.on('login', (username) => {
    users[socket.id] = {
      id: socket.id,
      username,
      credit: 1000,
      room: null
    };
    socket.emit('update_data', users[socket.id]);
  });

  // join room
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

    console.log(`${users[socket.id].username} joined ${roomId}`);
  });

  // kang
  socket.on('player_action', ({ type }) => {
    if (type !== 'KANG') return;

    const user = users[socket.id];
    if (!user || !user.room) return;

    const price = parseInt(user.room.replace('room_', ''));
    const players = rooms[user.room].length;
    const fee = ROOM_CONFIG[price].fee;

    const pool = price * (players - 1);
    const totalFee = fee * (players - 1);
    const netWin = pool - totalFee;

    user.credit += netWin;

    io.to(socket.id).emit('game_result', {
      winner: socket.id,
      netWin,
      totalFee
    });

    socket.emit('update_data', user);
  });

  // disconnect
  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user && user.room && rooms[user.room]) {
      rooms[user.room] = rooms[user.room].filter(id => id !== socket.id);
    }
    delete users[socket.id];
    console.log('🔴 Player disconnected:', socket.id);
  });
});

// ================== START SERVER ==================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Kang Game running on port ${PORT}`);
});
