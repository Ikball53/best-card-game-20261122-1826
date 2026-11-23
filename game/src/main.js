// Emberfall Duel — game flow, input and the demo states used for screenshots.

import { buildDeck, cardById, drawCards } from './deck.js';
import {
  HAND_SIZE, newDuelState, playHeroCard, resolveFoeMove, startHeroTurn,
} from './rules.js';
import { chooseIntent, intentLine, moveCard } from './ai.js';
import {
  hideOverlay, renderArena, renderHands, renderHud, setLog, showOverlay,
} from './render.js';
import {
  isMuted, soundFoeHit, soundGuard, soundHeal, soundHit, soundLose,
  soundPlay, soundWin, toggleMute,
} from './sound.js';

const rng = Math.random;
let state = null;
let intent = null;
let foeShown = null;

function refresh(banner, combo) {
  renderHud(state, intentLine(intent));
  renderHands(state, playIndex);
  renderArena(state.lastClash ? state.lastClash.card : null, foeShown, banner, combo);
}

function freshDuel() {
  state = newDuelState(buildDeck(rng), buildDeck(rng));
  let drawn = drawCards(state.heroDeck, state.heroHand, HAND_SIZE);
  state.heroDeck = drawn.deck; state.heroHand = drawn.hand;
  drawn = drawCards(state.foeDeck, state.foeHand, HAND_SIZE);
  state.foeDeck = drawn.deck; state.foeHand = drawn.hand;
  intent = chooseIntent(state, rng);
  foeShown = null;
  state.lastClash = null;
}

function playIndex(index) {
  if (!state || state.phase !== 'hero') return;
  const card = state.heroHand[index];
  if (!card || card.cost > state.energy) { setLog('Not enough energy for that card.'); return; }
  const result = playHeroCard(state, index);
  state = result.state;
  const clash = result.clash;
  soundPlay();
  let banner;
  if (card.kind === 'strike') {
    banner = clash.dealt > 0
      ? `${card.name} hits for ${clash.dealt}${clash.blocked ? ` (${clash.blocked} blocked)` : ''}!`
      : `${card.name} — fully blocked!`;
    if (clash.dealt > 0) soundHit();
  } else if (card.kind === 'guard') {
    banner = `${card.name}: +${clash.gained} block`;
    soundGuard();
  } else if (card.kind === 'mend') {
    banner = `${card.name}: healed ${clash.healed}`;
    soundHeal();
  } else {
    banner = `${card.name}: +${clash.gained} energy`;
    soundGuard();
  }
  refresh(banner, clash.label ? `✦ ${clash.label} ✦` : '');
  setLog(`Energy left: ${state.energy}. Play another card or end the turn.`);
  if (state.phase === 'won') endDuel('win');
}

function endTurn() {
  if (!state || state.phase !== 'hero') return;
  const result = resolveFoeMove(state, intent);
  state = result.state;
  foeShown = moveCard(intent);
  const clash = result.clash;
  let banner;
  if (intent.kind === 'strike') {
    banner = clash.dealt > 0
      ? `Morvane strikes for ${clash.dealt}${clash.blocked ? ` (${clash.blocked} blocked)` : ''}!`
      : 'Morvane strikes — fully blocked!';
    if (clash.dealt > 0) { soundFoeHit(); document.getElementById('heroZone').classList.add('shake'); }
  } else if (intent.kind === 'guard') {
    banner = `Morvane guards: +${intent.power} block`;
    soundGuard();
  } else {
    banner = `Morvane mends for ${intent.power}`;
    soundHeal();
  }
  setTimeout(() => document.getElementById('heroZone').classList.remove('shake'), 400);
  if (state.phase === 'lost') { refresh(banner, ''); endDuel('loss'); return; }
  state = startHeroTurn(state);
  const drawn = drawCards(state.heroDeck, state.heroHand, Math.max(0, HAND_SIZE - state.heroHand.length));
  state.heroDeck = drawn.deck; state.heroHand = drawn.hand;
  intent = chooseIntent(state, rng);
  refresh(banner, '');
  setLog(`Round ${state.round}. ${intentLine(intent)} — plan your plays.`);
}

function endDuel(kind) {
  if (kind === 'win') soundWin(); else soundLose();
  setTimeout(() => showOverlay(kind, state), 650);
}

// Fixed mid-duel tableau for the cover screenshot (#play): round 4, both
// hands readable, a clash resolved in the arena, life totals mid-fight.
function demoTableau() {
  freshDuel();
  state.round = 4;
  state.heroHp = 14;
  state.foeHp = 11;
  state.heroBlock = 3;
  state.foeBlock = 5;
  state.energy = 2;
  state.heroHand = ['tide-spear', 'thorn-briar', 'void-flare', 'ember-ward'].map(cardById);
  state.foeHand = ['void-bolt', 'ember-maul', 'tide-wall', 'thorn-salve'].map(cardById);
  state.lastClash = { card: cardById('ember-lancer'), bonus: 3, label: 'Suit Surge +3', dealt: 5, blocked: 5 };
  foeShown = { ...cardById('thorn-aegis'), name: 'Warden Guard', power: 5 };
  intent = { kind: 'strike', power: 7, text: 'will strike for 7' };
  refresh('CLASH: 7 + 3 surge − 5 block = 5 damage!', '✦ Suit Surge +3 — two Ember cards ✦');
  setLog('Round 4 · Morvane will strike for 7 — your block is 3. Play a guard or finish him.');
}

function demoEnd(kind) {
  freshDuel();
  state.round = 6;
  if (kind === 'win') { state.foeHp = 0; state.heroHp = 9; } else { state.heroHp = 0; state.foeHp = 8; }
  state.heroHand = ['ember-dart', 'tide-mend', 'void-bolt'].map(cardById);
  state.foeHand = ['ember-maul', 'thorn-ram'].map(cardById);
  intent = { kind: 'strike', power: 7, text: 'will strike for 7' };
  refresh(kind === 'win' ? 'Ember Maul lands the final blow!' : 'Warden Strike breaks through!', '');
  showOverlay(kind, state);
}

function start() {
  freshDuel();
  hideOverlay();
  refresh('Your move — read the intent, then strike', '');
  setLog('Click a card (or keys 1–5). Chain same suits for Suit Surge. Space ends the turn.');
}

document.getElementById('endTurnBtn').addEventListener('click', endTurn);
document.getElementById('overlayBtn').addEventListener('click', start);
document.getElementById('muteBtn').addEventListener('click', () => {
  const muted = toggleMute();
  document.getElementById('muteBtn').textContent = muted ? 'Sound: off' : 'Sound: on';
});
window.addEventListener('keydown', (e) => {
  if (e.key === ' ') { e.preventDefault(); endTurn(); }
  else if (e.key >= '1' && e.key <= '5') playIndex(Number(e.key) - 1);
  else if (e.key.toLowerCase() === 'm') document.getElementById('muteBtn').click();
  else if (e.key === 'Enter' && !document.getElementById('overlay').classList.contains('hidden')) start();
});

const demo = location.hash.replace('#', '');
if (demo === 'play') demoTableau();
else if (demo === 'win') demoEnd('win');
else if (demo === 'loss') demoEnd('loss');
else { freshDuel(); refresh('Your move — read the intent, then strike', ''); showOverlay('title', state); }
