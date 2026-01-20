// server.js
const express=require('express'); const http=require('http'); const path=require('path');
const mongoose=require('mongoose'); const {Server}=require('socket.io');
require('dotenv').config(); const {startGame}=require('./game/engine');

const app=express(); const server=http.createServer(app);
const io=new Server(server,{cors:{origin:"*"}});
mongoose.connect(process.env.MONGO_URI).then(()=>console.log('Mongo OK')).catch(()=>{});

app.use(express.static('client'));
app.use(express.json());
app.get('/',(_,res)=>res.sendFile(path.join(__dirname,'client/index.html')));
app.get('/admin',(_,res)=>res.sendFile(path.join(__dirname,'client/admin.html')));

const ROOM_CONFIG={10:{fee:1},20:{fee:1},50:{fee:1},70:{fee:2},100:{fee:2}};
const MAX=5, AFK_MS=10000;
const users={}, rooms={}, afkTimers={}, deposits=[];

function startAFK(s){
  clearTimeout(afkTimers[s.id]);
  afkTimers[s.id]=setTimeout(()=>{
    const u=users[s.id]; if(!u||!u.room) return;
    io.to(u.room).emit('ai_action',{player:u.username});
  },AFK_MS);
}
function clearAFK(s){clearTimeout(afkTimers[s.id]); delete afkTimers[s.id];}

io.on('connection',socket=>{
  socket.on('login',username=>{
    if(!username) return;
    users[socket.id]={id:socket.id,username,credit:1000,room:null};
    socket.emit('login_success',users[socket.id]);
  });

  socket.on('join',price=>{
    if(!ROOM_CONFIG[price]) return;
    const roomId='room_'+price;
    rooms[roomId]??=[];
    if(rooms[roomId].length>=MAX) return socket.emit('error','FULL');
    rooms[roomId].push(users[socket.id]); users[socket.id].room=roomId;
    socket.join(roomId); startAFK(socket);
    io.to(roomId).emit('room_update',rooms[roomId].map(u=>u.username));
    if(rooms[roomId].length===MAX){
      const players=rooms[roomId];
      const fee=ROOM_CONFIG[price].fee;
      const pool=price*(players.length-1);
      const totalFee=fee*(players.length-1);
      const r=startGame(players,price);
      const win=pool-totalFee+r.bonus;
      r.winner.credit+=win;
      io.to(roomId).emit('game_end',{winner:r.winner.username,win,bonus:r.bonus});
      rooms[roomId]=[];
    }
  });

  socket.on('player_action',()=>{ clearAFK(socket); startAFK(socket); });
  socket.on('disconnect',()=>{
    clearAFK(socket);
    const u=users[socket.id];
    if(u?.room && rooms[u.room]) rooms[u.room]=rooms[u.room].filter(x=>x.id!==u.id);
    delete users[socket.id];
  });
});

// Admin + Deposit DEMO
app.get('/admin/users',(_,res)=>res.json(Object.values(users)));
app.get('/admin/deposits',(_,res)=>res.json(deposits));
app.post('/deposit/:sid/:amt',(req,res)=>{
  deposits.push({sid:req.params.sid,amt:+req.params.amt,status:'pending'});
  res.json({ok:true});
});
app.post('/admin/approve/:i',(req,res)=>{
  const d=deposits[req.params.i]; if(!d) return res.sendStatus(404);
  users[d.sid].credit+=d.amt; d.status='approved'; res.json(d);
});

server.listen(process.env.PORT||3000);
