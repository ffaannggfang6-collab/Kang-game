import { Server } from "socket.io";
import redis from "./redis.js";
import { createDeck, aiPlay, score } from "./game.js";

export default function(ioServer){
  const io = new Server(ioServer,{cors:{origin:"*"}});

  io.on("connection", socket => {

    socket.on("join", async ({room,name})=>{
      socket.join(room);

      await redis.hSet(room, socket.id,
        JSON.stringify({name, cards:[], acted:false})
      );

      if(await redis.hLen(room) === 5){
        const deck = createDeck();
        const players = await redis.hKeys(room);

        for(const id of players){
          const cards = deck.splice(0,5);
          await redis.hSet(room,id,
            JSON.stringify({cards,acted:false})
          );
          io.to(id).emit("cards",cards);
        }
      }
    });

    socket.on("action", async ({room,type})=>{
      if(type==="KANG"){
        io.to(room).emit("end",{winner:socket.id});
      }
    });

  });
}
