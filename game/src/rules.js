// Turn rules: energy, block, suit combos and damage resolution.

export const MAX_HP = 20;
export const HAND_SIZE = 5;
export const TURN_ENERGY = 4;

export function newDuelState(deck, foeDeck) {
  return {
    round: 1,
    heroHp: MAX_HP,
    foeHp: MAX_HP,
    heroBlock: 0,
    foeBlock: 0,
    energy: TURN_ENERGY,
    heroDeck: deck,
    foeDeck,
    heroHand: [],
    foeHand: [],
    playedThisRound: [],
    phase: 'hero', // hero | foe | won | lost
    lastClash: null,
  };
}

// Same-suit plays in one round stack: 2nd card of a suit +3, 3rd +6.
export function comboBonus(playedThisRound, card) {
  const same = playedThisRound.filter((c) => c.suit === card.suit).length;
  if (same === 1) return 3;
  if (same >= 2) return 6;
  return 0;
}

export function comboLabel(playedThisRound, card) {
  const same = playedThisRound.filter((c) => c.suit === card.suit).length;
  if (same === 1) return 'Suit Surge +3';
  if (same >= 2) return 'Suit Surge +6';
  return '';
}

export function canPlay(state, card) {
  return state.phase === 'hero' && card.cost <= state.energy;
}

// Applies one hero card. Returns { state, clash } with a fresh state object.
export function playHeroCard(state, index) {
  const card = state.heroHand[index];
  if (!card || !canPlay(state, card)) return { state, clash: null };
  const next = {
    ...state,
    heroHand: state.heroHand.filter((_, i) => i !== index),
    energy: state.energy - card.cost,
    playedThisRound: [...state.playedThisRound, card],
  };
  const bonus = comboBonus(state.playedThisRound, card);
  const label = comboLabel(state.playedThisRound, card);
  let clash = { card, bonus, label, dealt: 0, blocked: 0, healed: 0, gained: 0 };
  if (card.kind === 'strike') {
    const raw = card.power + bonus;
    clash.blocked = Math.min(next.foeBlock, raw);
    clash.dealt = raw - clash.blocked;
    next.foeBlock -= clash.blocked;
    next.foeHp = Math.max(0, next.foeHp - clash.dealt);
  } else if (card.kind === 'guard') {
    next.heroBlock += card.power + bonus;
    clash.gained = card.power + bonus;
  } else if (card.kind === 'mend') {
    clash.healed = Math.min(MAX_HP - next.heroHp, card.power + bonus);
    next.heroHp += clash.healed;
  } else if (card.kind === 'surge') {
    next.energy += card.power;
    clash.gained = card.power;
  }
  if (next.foeHp <= 0) next.phase = 'won';
  next.lastClash = clash;
  return { state: next, clash };
}

// The foe's declared move lands at end of turn, soaked by hero block.
export function resolveFoeMove(state, move) {
  const next = { ...state };
  let clash = { move, dealt: 0, blocked: 0 };
  if (move.kind === 'strike') {
    clash.blocked = Math.min(next.heroBlock, move.power);
    clash.dealt = move.power - clash.blocked;
    next.heroBlock -= clash.blocked;
    next.heroHp = Math.max(0, next.heroHp - clash.dealt);
  } else if (move.kind === 'guard') {
    next.foeBlock += move.power;
  } else if (move.kind === 'mend') {
    next.foeHp = Math.min(MAX_HP, next.foeHp + move.power);
  }
  if (next.heroHp <= 0) next.phase = 'lost';
  return { state: next, clash };
}

export function startHeroTurn(state) {
  return {
    ...state,
    round: state.round + 1,
    energy: TURN_ENERGY,
    playedThisRound: [],
    phase: 'hero',
  };
}
