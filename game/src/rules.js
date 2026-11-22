// Emberfall Clash — clash scoring, combos, element advantage and round resolution.
import { elementById } from "./deck.js";

export const COMBO_PAIR = 4;       // two cards of the same rank
export const COMBO_SURGE = 5;      // three cards of one element
export const COMBO_CHAIN = 6;      // three consecutive ranks
export const COMBO_RESONANCE = 4;  // a Warden beside a card of its own element
export const ADVANTAGE_BONUS = 3;  // majority element beats the other majority
export const STONE_BULWARK = 2;    // per Stone card in the clash

// The element a play leans on: its most common element (first seen wins ties).
export function majorityElement(cards) {
  const tally = new Map();
  for (const c of cards) tally.set(c.element, (tally.get(c.element) || 0) + 1);
  let best = null, bestN = 0;
  for (const c of cards) {
    const n = tally.get(c.element);
    if (n > bestN) { best = c.element; bestN = n; }
  }
  return best;
}

// True when element `a` beats element `b` in the Ember/Tide/Leaf cycle.
export function beatsElement(a, b) {
  if (!a || !b) return false;
  return elementById(a)?.beats === b;
}

// Score one side's clash play: raw ranks plus every combo that applies (combos stack).
export function scoreClash(cards) {
  const notes = [];
  let power = cards.reduce((sum, c) => sum + c.rank, 0);
  // Pair: any rank appearing at least twice.
  const rankCount = new Map();
  for (const c of cards) rankCount.set(c.rank, (rankCount.get(c.rank) || 0) + 1);
  if ([...rankCount.values()].some((n) => n >= 2)) { power += COMBO_PAIR; notes.push("Pair +" + COMBO_PAIR); }
  // Surge: three of one element.
  const elCount = new Map();
  for (const c of cards) elCount.set(c.element, (elCount.get(c.element) || 0) + 1);
  if ([...elCount.values()].some((n) => n >= 3)) { power += COMBO_SURGE; notes.push("Surge +" + COMBO_SURGE); }
  // Chain: three consecutive ranks.
  const ranks = [...new Set(cards.map((c) => c.rank))].sort((x, y) => x - y);
  let chained = false;
  for (let i = 0; i + 2 < ranks.length; i++) {
    if (ranks[i + 1] === ranks[i] + 1 && ranks[i + 2] === ranks[i] + 2) chained = true;
  }
  if (chained) { power += COMBO_CHAIN; notes.push("Chain +" + COMBO_CHAIN); }
  // Resonance: a Warden (rank 10) with another card of its element.
  const warden = cards.find((c) => c.rank === 10);
  if (warden && cards.some((c) => c !== warden && c.element === warden.element)) {
    power += COMBO_RESONANCE; notes.push("Resonance +" + COMBO_RESONANCE);
  }
  // Stone bulwark: every Stone card hardens the play.
  const stones = cards.filter((c) => c.element === "stone").length;
  if (stones > 0) { power += stones * STONE_BULWARK; notes.push("Bulwark +" + stones * STONE_BULWARK); }
  return { power, notes };
}

// Resolve a full clash: both plays scored, majority-element advantage applied,
// the loser takes damage equal to the power gap (a drawn clash hurts nobody).
export function resolveRound(playerCards, foeCards) {
  const p = scoreClash(playerCards);
  const f = scoreClash(foeCards);
  const pMaj = majorityElement(playerCards);
  const fMaj = majorityElement(foeCards);
  let pPower = p.power, fPower = f.power;
  const pNotes = p.notes.slice(), fNotes = f.notes.slice();
  if (beatsElement(pMaj, fMaj)) { pPower += ADVANTAGE_BONUS; pNotes.push("Advantage +" + ADVANTAGE_BONUS); }
  if (beatsElement(fMaj, pMaj)) { fPower += ADVANTAGE_BONUS; fNotes.push("Advantage +" + ADVANTAGE_BONUS); }
  let playerDamage = 0, foeDamage = 0, outcome = "draw";
  if (pPower > fPower) { foeDamage = pPower - fPower; outcome = "player"; }
  else if (fPower > pPower) { playerDamage = fPower - pPower; outcome = "foe"; }
  return { pPower, fPower, pNotes, fNotes, playerDamage, foeDamage, outcome };
}

// Winner check after damage: "player", "foe", or null while both still stand.
export function checkWinner(playerLife, foeLife) {
  if (foeLife <= 0 && playerLife > 0) return "player";
  if (playerLife <= 0 && foeLife > 0) return "foe";
  if (playerLife <= 0 && foeLife <= 0) return playerLife >= foeLife ? "player" : "foe";
  return null;
}
