// Emberfall Clash — the Ashen Warden's brain: readable stances, counterable plays.
import { scoreClash, majorityElement, beatsElement } from "./rules.js";

export const STANCES = [
  { id: "press", label: "Pressing", hint: "plays its strongest combo" },
  { id: "guard", label: "Guarding", hint: "leans on Stone and pairs" },
  { id: "probe", label: "Probing", hint: "tests a single high card" },
];

// The stance cycles each round so the player can read and counter it.
export function opponentStance(round) {
  return STANCES[round % STANCES.length];
}

function allSubsetsUpTo3(hand) {
  const out = [];
  for (let i = 0; i < hand.length; i++) out.push([hand[i]]);
  for (let i = 0; i < hand.length; i++)
    for (let j = i + 1; j < hand.length; j++) out.push([hand[i], hand[j]]);
  for (let i = 0; i < hand.length; i++)
    for (let j = i + 1; j < hand.length; j++)
      for (let k = j + 1; k < hand.length; k++) out.push([hand[i], hand[j], hand[k]]);
  return out;
}

// Choose the Warden's play for this round. `playerHint` is the element the player
// leaned on last round (or null): a countering Warden prefers plays that beat it.
export function chooseOpponentPlay(hand, stance, playerHint, rand = Math.random) {
  if (hand.length === 0) return [];
  const options = allSubsetsUpTo3(hand);
  let best = options[0], bestScore = -Infinity;
  for (const opt of options) {
    let s = scoreClash(opt).power;
    if (stance.id === "press") s += opt.length * 1.5;                       // spends cards freely
    if (stance.id === "guard") s += opt.filter((c) => c.element === "stone").length * 3;
    if (stance.id === "probe") s -= opt.length * 2.5;                        // holds cards back
    if (playerHint && beatsElement(majorityElement(opt), playerHint)) s += 3; // counters your lean
    s += rand() * 1.2;                                                       // a little unpredictability
    if (s > bestScore) { bestScore = s; best = opt; }
  }
  return best.slice();
}
