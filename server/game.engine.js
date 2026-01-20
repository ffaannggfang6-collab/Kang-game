const SUITS = ['C','D','H','S'];
const RANKS = [1,2,3,4,5,6,7,8,9,10];

function shuffleDeck() {
  const deck = [];
  SUITS.forEach(s => RANKS.forEach(r => deck.push({ s, r })));
  return deck.sort(() => Math.random() - 0.5);
}

function score(hand) {
  const sum = hand.reduce((t,c)=> t + Math.min(c.r,10), 0);
  return sum % 10;
}

function checkBonus(hand) {
  const ranks = hand.map(c=>c.r).sort((a,b)=>a-b);
  const suits = hand.map(c=>c.s);

  const flush = suits.every(s=>s===suits[0]);
  const straight = ranks.every((v,i)=> i===0 || v===ranks[i-1]+1);
  const tong = ranks.some(r=> ranks.filter(x=>x===r).length>=3);
  const fifty = ranks.filter(r=>r===10).length===5;

  if (fifty) return 'FIFTY';
  if (straight) return 'STRAIGHT';
  if (flush) return 'FLUSH';
  if (tong) return 'TONG';
  return null;
}

module.exports = { shuffleDeck, score, checkBonus };
