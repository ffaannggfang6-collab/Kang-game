// game/deck.js
const suits=['C','D','H','S']; const ranks=[1,2,3,4,5,6,7,8,9,10,10,10,10];
exports.createDeck=()=>shuffle(suits.flatMap(s=>ranks.map(v=>({s,v}))));
const shuffle=d=>d.sort(()=>Math.random()-0.5);
