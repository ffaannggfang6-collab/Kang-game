const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

/* ===== serve client ===== */
app.use(express.static(path.join(__dirname, 'client')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

/* ===== GAME DATA ===== */
const ROOMS = {
  10: { price: 10, fee: 1, players: [] },
  20: { price: 20, fee: 1, players: [] },
  50: { price: 50, fee: 1, players: [] },
  70: { price: 70, fee: 2, players: [] },
  100:{ price:100, fee: 2, players: [] }
};

const users = {};

/* ===== SOCKET ===== */
io.on('connection', (socket) => {

  socket.on('login', (username) => {
    users[socket.id] = { name: username, credit: 1000 };
    socket.emit('login_success', {
      user: users[socket.id],
      rooms: getRoomInfo()
    });
  });

  socket.on('join_room', (roomPrice) => {
    const room = ROOMS[roomPrice];
    if (!room) return;

    if (room.players.length >= 5) {
      socket.emit('room_full');
      return;
    }

    room.players.push(socket.id);
    socket.join('room_' + roomPrice);

    io.emit('room_update', getRoomInfo());
  });

  socket.on('disconnect', () => {
    Object.values(ROOMS).forEach(room => {
      room.players = room.players.filter(id => id !== socket.id);
    });
    delete users[socket.id];
    io.emit('room_update', getRoomInfo());
  });
});

/* ===== helper ===== */
function getRoomInfo() {
  const info = {};
  for (let key in ROOMS) {
    info[key] = ROOMS[key].players.length;
  }
  return info;
}

server.listen(PORT, () => {
  console.log('Kang game server running on port', PORT);
});
