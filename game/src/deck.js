// Emberfall Clash — deck construction and drawing.
// Four elements, each told apart by colour AND shape so a card reads at thumbnail size.
export const ELEMENTS = [
  { id: "ember", label: "Ember", glyph: "\u25B2", hue: "#e8542f", beats: "leaf" },
  { id: "tide", label: "Tide", glyph: "\u25CF", hue: "#2f7fe8", beats: "ember" },
  { id: "leaf", label: "Leaf", glyph: "\u25C6", hue: "#2fa84f", beats: "tide" },
  { id: "stone", label: "Stone", glyph: "\u25A0", hue: "#d99a26", beats: null },
];

export const RANK_NAMES = ["Spark", "Kindle", "Flare", "Blaze", "Pyre", "Storm", "Surge", "Tempest", "Crown", "Warden"];
export const HAND_SIZE = 6;
export const STARTING_LIFE = 20;

export function elementById(id) {
  return ELEMENTS.find((e) => e.id === id);
}

// A fresh 40-card deck: every element at every rank 1..10 (10 is the Warden).
export function buildDeck() {
  const cards = [];
  let serial = 0;
  for (const el of ELEMENTS) {
    for (let rank = 1; rank <= 10; rank++) {
      cards.push({ uid: "c" + serial++, element: el.id, rank, name: RANK_NAMES[rank - 1] });
    }
  }
  return cards;
}

// Fisher-Yates shuffle driven by an injectable random source (seedable for tests).
export function shuffleDeck(deck, rand = Math.random) {
  const out = deck.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = out[i]; out[i] = out[j]; out[j] = tmp;
  }
  return out;
}

// Draw up to n cards from the top of the deck (mutates deck, returns drawn cards).
export function drawCards(deck, n) {
  const drawn = [];
  while (drawn.length < n && deck.length > 0) drawn.push(deck.pop());
  return drawn;
}

// Top a hand back up to HAND_SIZE, reshuffling the discard pile when the deck runs dry.
export function refillHand(hand, deck, discard, rand = Math.random) {
  while (hand.length < HAND_SIZE) {
    if (deck.length === 0) {
      if (discard.length === 0) break;
      deck.push(...shuffleDeck(discard.splice(0), rand));
    }
    hand.push(...drawCards(deck, 1));
  }
  return hand;
}
