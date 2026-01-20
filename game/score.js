// game/score.js
exports.calcScore=cards=>cards.reduce((a,c)=>a+c.v,0);
