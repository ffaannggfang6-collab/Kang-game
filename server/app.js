const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// เสิร์ฟหน้าเว็บ
app.use(express.static(path.join(__dirname, '../client')));

const rooms = {
  20: { price: 20, fee: 1, players: [] },
  50: { price: 50, fee: 1, players: [] },
  100: { price: 100, fee: 2, players: [] }
};

io.on('connection', socket => {
  console.log('ผู้เล่นเชื่อมต่อ', socket.id);

  socket.on('login', username => {
    socket.data.username = username;
    socket.data.credit = 1000;
    socket.emit('login_success', {
      username,
      credit: socket.data.credit,
      rooms
    });
  });

  socket.on('join_room', roomId => {
    const room = rooms[roomId];
    if (!room) return;

    if (room.players.length >= 5) {
      socket.emit('error_msg', 'ห้องเต็ม');
      return;
    }

    room.players.push(socket);
    socket.join('room_' + roomId);
    socket.data.roomId = roomId;

    io.to('room_' + roomId).emit(
      'room_update',
      room.players.map(p => p.data.username)
    );
  });

  socket.on('KANG', () => {
    const roomId = socket.data.roomId;
    const room = rooms[roomId];
    if (!room) return;

    const playerCount = room.players.length;
    if (playerCount < 2) return;

    const pool = room.price * (playerCount - 1);
    const fee = room.fee * (playerCount - 1);
    const win = pool - fee;

    socket.data.credit += win;

    io.to('room_' + roomId).emit('game_result', {
      winner: socket.data.username,
      win,
      credit: socket.data.credit
    });
  });

  socket.on('disconnect', () => {
    const roomId = socket.data.roomId;
    if (roomId && rooms[roomId]) {
      rooms[roomId].players =
        rooms[roomId].players.filter(p => p.id !== socket.id);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('KANG GAME RUNNING ON', PORT);
});
