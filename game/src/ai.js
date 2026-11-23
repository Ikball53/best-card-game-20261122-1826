// Morvane the Warden: a readable opponent. His next move is always
// declared as an "intent" the player can plan around and counter.

import { cardById } from './deck.js';

const MOVES = [
  { kind: 'strike', power: 7, text: 'will strike for 7' },
  { kind: 'strike', power: 5, text: 'will strike for 5' },
  { kind: 'guard', power: 6, text: 'will guard (block 6)' },
  { kind: 'strike', power: 9, text: 'will strike for 9' },
  { kind: 'mend', power: 4, text: 'will mend for 4' },
  { kind: 'guard', power: 8, text: 'will guard (block 8)' },
];

// Morvane picks harder when hurt, guards when the hero is flush with energy.
export function chooseIntent(state, rng) {
  let pool = MOVES;
  if (state.foeHp <= 8) pool = MOVES.filter((m) => m.kind !== 'mend' || rng() < 0.5);
  if (state.energy >= 4 && rng() < 0.45) pool = MOVES.filter((m) => m.kind === 'guard');
  const move = pool[Math.floor(rng() * pool.length)];
  return { ...move };
}

export function intentLine(move) {
  return `Morvane ${move.text}`;
}

// The card Morvane "shows" in the arena when his move lands.
export function moveCard(move) {
  if (move.kind === 'guard') return { ...cardById('thorn-aegis'), name: 'Warden Guard', power: move.power };
  if (move.kind === 'mend') return { ...cardById('tide-mend'), name: 'Warden Mend', power: move.power };
  return { ...cardById('void-bolt'), name: 'Warden Strike', power: move.power };
}
