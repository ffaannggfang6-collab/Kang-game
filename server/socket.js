const { shuffleDeck, score, checkBonus } = require('./game.engine');

const ROOMS = {
  10:{fee:1}, 20:{fee:1}, 50:{fee:1}, 70:{fee:2}, 100:{fee:2}
};

let users = {};
let games = {};

function setupSocket(server){
  const io = require('socket.io')(server,{ cors:{origin:"*"} });

  setInterval(()=>{
    Object.values(games).forEach(game=>{
      const p = game.players[game.turn];
      if(Date.now()-p.lastAction > 10000){
        p.hand.shift(); // AI ทิ้ง
        game.turn = (game.turn+1)%game.players.length;
        io.to(game.room).emit('turn', game.players[game.turn].id);
        p.lastAction = Date.now();
      }
    });
  },1000);

  io.on('connection', socket => {
    console.log('🟢',socket.id);

    socket.on('login', username => {
      users[socket.id] = { id: socket.id, username, credit: 1000 };
      socket.emit('login_success', users[socket.id]);
    });

    socket.on('join_room', price => {
      const room = 'room_'+price;
      if(!games[room]){
        games[room]={
          room,
          deck: shuffleDeck(),
          players:[],
          turn:0
        };
      }

      const game = games[room];
      game.players.push({
        id: socket.id,
        hand: game.deck.splice(0,5),
        lastAction: Date.now()
      });

      socket.join(room);

      if(game.players.length===5){
        io.to(room).emit('game_start',{
          players: game.players.map(p=>({id:p.id,count:p.hand.length})),
          turn: game.players[0].id
        });
      } else {
        socket.emit('wait_player', game.players.length);
      }
    });

    socket.on('draw', room=>{
      const game = games['room_'+room];
      const p = game.players[game.turn];
      if(p.id!==socket.id) return;

      p.hand.push(game.deck.pop());
      p.lastAction=Date.now();
      socket.emit('hand_update', p.hand);
    });

    socket.on('discard',(room,index)=>{
      const game = games['room_'+room];
      const p = game.players[game.turn];
      p.hand.splice(index,1);
      game.turn=(game.turn+1)%game.players.length;
      io.to(game.room).emit('turn',game.players[game.turn].id);
    });

    socket.on('kang', room=>{
      const game = games['room_'+room];
      const me = game.players.find(p=>p.id===socket.id);
      const myScore = score(me.hand);

      let win=true;
      game.players.forEach(p=>{
        if(score(p.hand)<myScore) win=false;
      });

      if(!win){
        socket.emit('game_over',{lose:true});
        return;
      }

      const bonusType = checkBonus(me.hand);
      const bonus = bonusType ? room*2 : 0;
      const pool = room*(game.players.length-1);
      const fee = ROOMS[room].fee*(game.players.length-1);
      const net = pool - fee + bonus;

      users[socket.id].credit += net;

      socket.emit('game_over',{
        win:true,
        bonus:bonusType,
        net,
        credit:users[socket.id].credit
      });
    });

    socket.on('disconnect',()=>{
      delete users[socket.id];
    });
  });
}

module.exports = { setupSocket };
