export function createDeck(){
  const suits = ['C','D','H','S'];
  const values = [1,2,3,4,5,6,7,8,9,10];
  return suits.flatMap(s => values.map(v=>({v,s})))
              .sort(()=>Math.random()-0.5);
}

export function score(cards){
  return cards.reduce((s,c)=>s+c.v,0)%10;
}

export function aiPlay(cards){
  const s = score(cards);
  if(s<=2) return 'KANG';
  if(Math.random()<0.6) return 'DRAW';
  return 'PASS';
}
