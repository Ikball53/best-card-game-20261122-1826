// Card pool and deck building for Emberfall Duel.
// Four suits, each told apart by colour AND shape: Ember (red triangle),
// Tide (blue circle), Thorn (green diamond), Void (purple star).

export const SUITS = {
  ember: { name: 'Ember', glyph: '▲', colour: '#e5482e' },
  tide: { name: 'Tide', glyph: '●', colour: '#2e7fe5' },
  thorn: { name: 'Thorn', glyph: '◆', colour: '#3fae4a' },
  void: { name: 'Void', glyph: '★', colour: '#9b4de5' },
};

// kind: strike (damage), guard (block), mend (heal), surge (extra energy)
const POOL = [
  { id: 'ember-lancer', name: 'Ember Lancer', suit: 'ember', kind: 'strike', cost: 2, power: 7, art: '♞' },
  { id: 'ember-dart', name: 'Ember Dart', suit: 'ember', kind: 'strike', cost: 1, power: 4, art: '➶' },
  { id: 'ember-maul', name: 'Ember Maul', suit: 'ember', kind: 'strike', cost: 3, power: 10, art: '⚒' },
  { id: 'ember-ward', name: 'Ember Ward', suit: 'ember', kind: 'guard', cost: 1, power: 5, art: '🛡' },
  { id: 'tide-spear', name: 'Tide Spear', suit: 'tide', kind: 'strike', cost: 2, power: 6, art: '♜' },
  { id: 'tide-surge', name: 'Tide Surge', suit: 'tide', kind: 'surge', cost: 0, power: 2, art: '≈' },
  { id: 'tide-mend', name: 'Tide Mend', suit: 'tide', kind: 'mend', cost: 2, power: 6, art: '✚' },
  { id: 'tide-wall', name: 'Tide Wall', suit: 'tide', kind: 'guard', cost: 2, power: 8, art: '▦' },
  { id: 'thorn-briar', name: 'Thorn Briar', suit: 'thorn', kind: 'strike', cost: 1, power: 5, art: '♣' },
  { id: 'thorn-aegis', name: 'Thorn Aegis', suit: 'thorn', kind: 'guard', cost: 1, power: 6, art: '⬟' },
  { id: 'thorn-salve', name: 'Thorn Salve', suit: 'thorn', kind: 'mend', cost: 1, power: 4, art: '❀' },
  { id: 'thorn-ram', name: 'Thorn Ram', suit: 'thorn', kind: 'strike', cost: 3, power: 9, art: '♟' },
  { id: 'void-bolt', name: 'Void Bolt', suit: 'void', kind: 'strike', cost: 2, power: 8, art: '⚡' },
  { id: 'void-shroud', name: 'Void Shroud', suit: 'void', kind: 'guard', cost: 2, power: 7, art: '☾' },
  { id: 'void-drain', name: 'Void Drain', suit: 'void', kind: 'mend', cost: 3, power: 9, art: '☠' },
  { id: 'void-flare', name: 'Void Flare', suit: 'void', kind: 'surge', cost: 1, power: 3, art: '✦' },
];

export function cardById(id) {
  const found = POOL.find((c) => c.id === id);
  if (!found) throw new Error(`unknown card ${id}`);
  return { ...found };
}

export function buildDeck(rng) {
  const deck = [];
  for (const card of POOL) deck.push({ ...card }, { ...card });
  return shuffle(deck, rng);
}

export function shuffle(cards, rng) {
  const out = [...cards];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function drawCards(deck, hand, count) {
  const nextDeck = [...deck];
  const nextHand = [...hand];
  for (let n = 0; n < count && nextDeck.length > 0; n++) nextHand.push(nextDeck.pop());
  return { deck: nextDeck, hand: nextHand };
}
