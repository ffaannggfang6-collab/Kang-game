// game/engine.js
const {createDeck}=require('./deck');
const {calcScore}=require('./score');
const {getBonus}=require('./bonus');
exports.startGame=(players,price)=>{
  const deck=createDeck();
  players.forEach(p=>{p.cards=deck.splice(0,5); p.score=calcScore(p.cards);});
  const winner=[...players].sort((a,b)=>a.score-b.score)[0];
  const bonus=getBonus(winner.cards,price);
  return {winner,bonus};
};
