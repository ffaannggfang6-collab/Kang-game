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

/* ===== ROOM CONFIG ===== */
const ROOM_CONFIG = {
  10: { price: 10, fee: 1 },
  20: { price: 20, fee: 1 },
  50: { price: 50, fee: 1 },
  70: { price: 70, fee: 2 },
  100:{ price:100, fee: 2 }
};

/* ===== STATE ===== */
const users = {};     // socket.id -> {name, credit, hand, score}
const rooms = {};     // roomPrice -> {players:[], started:false}

/* ===== CARD SYSTEM ===== */
function newDeck(){
  const suits = ['♣','♦','♥','♠'];
  const values = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  let deck = [];
  suits.forEach(s=>{
    values.forEach(v=> deck.push(v+s));
  });
  return deck.sort(()=>Math.random()-0.5);
}

function cardScore(card){
  const v = card.slice(0,-1);
  if(['J','Q','K'].includes(v)) return 10;
  if(v === 'A') return 1;
  return parseInt(v);
}

/* ===== SOCKET ===== */
io.on('connection', (socket) => {

  socket.on('login', (username) => {
    users[socket.id] = {
      name: username,
      credit: 1000,
      hand: [],
      score: 0,
      room: null
    };
    socket.emit('login_success', {
      credit: 1000,
      rooms: getRoomsInfo()
    });
  });

  socket.on('join_room', (price) => {
    if(!rooms[price]) rooms[price] = { players: [], deck: [] };
    const room = rooms[price];

    if(room.players.length >= 5){
      socket.emit('room_full');
      return;
    }

    room.players.push(socket.id);
    users[socket.id].room = price;
    socket.join('room_'+price);

    io.emit('room_update', getRoomsInfo());

    if(room.players.length >= 2){
      startRound(price);
    }
  });

  socket.on('action', (type) => {
    const user = users[socket.id];
    if(!user || !user.room) return;
    const room = rooms[user.room];

    if(type === 'KANG'){
      endRound(user.room, socket.id);
    }

    if(type === 'DRAW'){
      const card = room.deck.pop();
      user.hand.push(card);
      user.score += cardScore(card);

      socket.emit('update_hand', {
        hand: user.hand,
        score: user.score
      });
    }
  });

  socket.on('disconnect', () => {
    const user = users[socket.id];
    if(user?.room){
      const room = rooms[user.room];
      room.players = room.players.filter(id=>id!==socket.id);
      io.emit('room_update', getRoomsInfo());
    }
    delete users[socket.id];
  });
});

/* ===== GAME FLOW ===== */
function startRound(price){
  const room = rooms[price];
  room.deck = newDeck();

  room.players.forEach(id=>{
    const u = users[id];
    u.hand = room.deck.splice(0,5);
    u.score = u.hand.reduce((s,c)=>s+cardScore(c),0);
    io.to(id).emit('start_round',{
      hand: u.hand,
      score: u.score,
      price
    });
  });
}

function endRound(price, winnerId){
  const room = rooms[price];
  const cfg = ROOM_CONFIG[price];
  const players = room.players.length;

  const pool = cfg.price * (players - 1);
  const fee = cfg.fee * (players - 1);
  const win = pool - fee;

  users[winnerId].credit += win;

  io.to('room_'+price).emit('round_result',{
    winner: users[winnerId].name,
    win,
    credit: users[winnerId].credit
  });
}

/* ===== HELPERS ===== */
function getRoomsInfo(){
  const info = {};
  Object.keys(ROOM_CONFIG).forEach(p=>{
    info[p] = rooms[p]?.players.length || 0;
  });
  return info;
}

server.listen(PORT, () => {
  console.log('Kang game running on', PORT);
});
