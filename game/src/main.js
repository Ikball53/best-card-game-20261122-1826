// Emberfall Clash — game state machine and input (mouse clicks + keyboard).
import { buildDeck, shuffleDeck, drawCards, refillHand, STARTING_LIFE, elementById } from "./deck.js";
import { resolveRound, checkWinner, majorityElement } from "./rules.js";
import { chooseOpponentPlay, opponentStance } from "./opponent.js";
import {
  renderPlayerHand, renderOpponentHand, renderClashZone, updateLifeTotals,
  showScreen, setMessage, setStanceLine, setClashReadout,
} from "./render-table.js";
import { dealAnimation, flipCards, snapIntoClash, damageShake, winFlourish } from "./animations.js";
import {
  playDrawSound, playPickSound, playClashSound, playHurtSound,
  playWinSound, playLoseSound, playDealSound, toggleMute,
} from "./sound.js";

const MAX_PLAY = 3;

const state = {
  deck: [], discard: [],
  playerHand: [], foeHand: [],
  picked: new Set(),
  playerLife: STARTING_LIFE, foeLife: STARTING_LIFE,
  round: 1, busy: false, lastPlayerLean: null, over: false,
};

function el(id) { return document.getElementById(id); }

function refreshHands(animate) {
  renderPlayerHand(el("player-hand"), state.playerHand, state.picked, togglePick);
  renderOpponentHand(el("foe-hand"), state.foeHand);
  updateLifeTotals(state.playerLife, state.foeLife, state.round);
  if (animate) {
    dealAnimation([...el("player-hand").children]);
    dealAnimation([...el("foe-hand").children]);
  }
}

function togglePick(uid) {
  if (state.busy || state.over) return;
  if (state.picked.has(uid)) state.picked.delete(uid);
  else {
    if (state.picked.size >= MAX_PLAY) { setMessage("A clash holds at most 3 cards."); return; }
    state.picked.add(uid);
  }
  playPickSound();
  refreshHands(false);
  el("btn-clash").disabled = state.picked.size === 0;
}

function startMatch() {
  state.deck = shuffleDeck(buildDeck());
  state.discard = [];
  state.playerHand = drawCards(state.deck, 6);
  state.foeHand = drawCards(state.deck, 6);
  state.picked = new Set();
  state.playerLife = STARTING_LIFE; state.foeLife = STARTING_LIFE;
  state.round = 1; state.busy = false; state.over = false; state.lastPlayerLean = null;
  renderClashZone(el("clash-player"), [], true);
  renderClashZone(el("clash-foe"), [], true);
  setClashReadout("", "");
  showScreen(null);
  announceStance();
  setMessage("Pick 1-3 cards, then press Clash (Enter).");
  playDealSound();
  refreshHands(true);
}

function announceStance() {
  const stance = opponentStance(state.round);
  setStanceLine("Ashen Warden: " + stance.label + " — " + stance.hint + ".");
}

function runClash() {
  if (state.busy || state.over || state.picked.size === 0) return;
  state.busy = true;
  const playerCards = state.playerHand.filter((c) => state.picked.has(c.uid));
  const stance = opponentStance(state.round);
  const foeCards = chooseOpponentPlay(state.foeHand, stance, state.lastPlayerLean);
  state.lastPlayerLean = majorityElement(playerCards);
  // Cards leave the hands and land face-down in the clash zone.
  state.playerHand = state.playerHand.filter((c) => !state.picked.has(c.uid));
  const foeUids = new Set(foeCards.map((c) => c.uid));
  state.foeHand = state.foeHand.filter((c) => !foeUids.has(c.uid));
  state.picked = new Set();
  renderClashZone(el("clash-player"), playerCards, false);
  renderClashZone(el("clash-foe"), foeCards, false);
  [...el("clash-player").children, ...el("clash-foe").children].forEach(snapIntoClash);
  refreshHands(false);
  playDrawSound();
  setMessage("The clash is set…");
  setTimeout(() => revealClash(playerCards, foeCards), 650);
}

function revealClash(playerCards, foeCards) {
  renderClashZone(el("clash-player"), playerCards, true);
  renderClashZone(el("clash-foe"), foeCards, true);
  flipCards([...el("clash-player").children, ...el("clash-foe").children]);
  const result = resolveRound(playerCards, foeCards);
  playClashSound();
  setClashReadout(
    "You " + result.pPower + (result.pNotes.length ? " (" + result.pNotes.join(", ") + ")" : ""),
    "Warden " + result.fPower + (result.fNotes.length ? " (" + result.fNotes.join(", ") + ")" : "")
  );
  state.playerLife -= result.playerDamage;
  state.foeLife -= result.foeDamage;
  if (result.playerDamage > 0) { playHurtSound(); damageShake(el("table")); setMessage("The Warden's clash lands for " + result.playerDamage + "."); }
  else if (result.foeDamage > 0) setMessage("Your clash lands for " + result.foeDamage + "!");
  else setMessage("A drawn clash — nobody bleeds.");
  updateLifeTotals(state.playerLife, state.foeLife, state.round);
  state.discard.push(...playerCards, ...foeCards);
  setTimeout(() => finishRound(), 1100);
}

function finishRound() {
  const winner = checkWinner(state.playerLife, state.foeLife);
  if (winner) { endMatch(winner); return; }
  refillHand(state.playerHand, state.deck, state.discard);
  refillHand(state.foeHand, state.deck, state.discard);
  state.round++;
  state.busy = false;
  el("btn-clash").disabled = true;
  announceStance();
  setMessage("Round " + state.round + " — pick 1-3 cards.");
  playDealSound();
  refreshHands(true);
}

function endMatch(winner) {
  state.over = true; state.busy = false;
  if (winner === "player") {
    el("win-detail").textContent = "The Ashen Warden falls in round " + state.round + ". Your life: " + state.playerLife + ".";
    showScreen("screen-win");
    playWinSound();
    winFlourish(el("table"));
  } else {
    el("loss-detail").textContent = "The Ashen Warden stands in round " + state.round + ". Its life: " + state.foeLife + ".";
    showScreen("screen-loss");
    playLoseSound();
  }
}

function onKey(ev) {
  const key = ev.key.toLowerCase();
  if (key === "m") { el("btn-mute").textContent = toggleMute() ? "Sound: off" : "Sound: on"; return; }
  if (key === "enter") {
    if (!el("screen-title").classList.contains("visible") && !state.over) runClash();
    else startMatch();
    return;
  }
  if (/^[1-6]$/.test(key)) {
    const card = state.playerHand[Number(key) - 1];
    if (card) togglePick(card.uid);
  }
}

// Deterministic demo states for screenshots: ?shot=title|table|win|loss
function applyShotMode() {
  const shot = new URLSearchParams(location.search).get("shot");
  if (!shot || shot === "title") { showScreen("screen-title"); return; }
  startMatch();
  if (shot === "table") {
    state.picked = new Set(state.playerHand.slice(0, 2).map((c) => c.uid));
    refreshHands(false);
    el("btn-clash").disabled = false;
    setMessage("Pick 1-3 cards, then press Clash (Enter).");
  } else if (shot === "win") {
    state.playerLife = 14; state.foeLife = 0; state.round = 7;
    updateLifeTotals(state.playerLife, state.foeLife, state.round);
    endMatch("player");
  } else if (shot === "loss") {
    state.playerLife = 0; state.foeLife = 11; state.round = 8;
    updateLifeTotals(state.playerLife, state.foeLife, state.round);
    endMatch("foe");
  }
}

el("btn-start").addEventListener("click", startMatch);
el("btn-clash").addEventListener("click", runClash);
el("btn-again-win").addEventListener("click", startMatch);
el("btn-again-loss").addEventListener("click", startMatch);
el("btn-mute").addEventListener("click", () => { el("btn-mute").textContent = toggleMute() ? "Sound: off" : "Sound: on"; });
document.addEventListener("keydown", onKey);
applyShotMode();
