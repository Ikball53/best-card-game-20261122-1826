// Emberfall Clash — everything the player sees: cards, hands, life totals, screens.
import { elementById } from "./deck.js";

export function cardElement(card, faceUp = true) {
  const el = document.createElement("div");
  el.className = "card" + (faceUp ? "" : " card-back");
  el.dataset.uid = card.uid;
  if (!faceUp) {
    el.innerHTML = '<div class="back-mark">\u2726</div>';
    return el;
  }
  const meta = elementById(card.element);
  el.style.setProperty("--el-hue", meta.hue);
  el.innerHTML =
    '<div class="card-top"><span class="card-rank">' + card.rank + '</span>' +
    '<span class="card-glyph">' + meta.glyph + '</span></div>' +
    '<div class="card-art">' + meta.glyph + '</div>' +
    '<div class="card-name">' + card.name + '</div>' +
    '<div class="card-el">' + meta.label + '</div>';
  el.title = card.name + " of " + meta.label + " (rank " + card.rank + ")";
  return el;
}

export function renderPlayerHand(host, hand, selectedUids, onPick) {
  host.innerHTML = "";
  hand.forEach((card, idx) => {
    const el = cardElement(card, true);
    if (selectedUids.has(card.uid)) el.classList.add("picked");
    el.dataset.index = idx;
    el.addEventListener("click", () => onPick(card.uid));
    host.appendChild(el);
  });
}

export function renderOpponentHand(host, hand) {
  host.innerHTML = "";
  hand.forEach((card) => host.appendChild(cardElement(card, false)));
}

export function renderClashZone(host, cards, faceUp) {
  host.innerHTML = "";
  cards.forEach((card) => host.appendChild(cardElement(card, faceUp)));
}

export function updateLifeTotals(playerLife, foeLife, round) {
  document.getElementById("hud-player-life").textContent = playerLife;
  document.getElementById("hud-foe-life").textContent = foeLife;
  document.getElementById("hud-round").textContent = round;
  const pBar = document.getElementById("bar-player");
  const fBar = document.getElementById("bar-foe");
  if (pBar) pBar.style.width = Math.max(0, playerLife * 5) + "%";
  if (fBar) fBar.style.width = Math.max(0, foeLife * 5) + "%";
}

export function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.toggle("visible", s.id === id));
  document.getElementById("table").classList.toggle("dimmed", id !== null);
}

export function setMessage(text) {
  document.getElementById("hud-message").textContent = text;
}

export function setStanceLine(text) {
  document.getElementById("hud-stance").textContent = text;
}

export function setClashReadout(playerText, foeText) {
  document.getElementById("readout-player").textContent = playerText;
  document.getElementById("readout-foe").textContent = foeText;
}
