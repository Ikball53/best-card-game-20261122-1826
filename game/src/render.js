// DOM rendering: both hands face-up, the clash arena, HP bars and screens.

import { SUITS } from './deck.js';
import { MAX_HP } from './rules.js';

const $ = (id) => document.getElementById(id);

export function cardEl(card, opts = {}) {
  const el = document.createElement('div');
  el.className = `card suit-${card.suit}${opts.disabled ? ' disabled' : ''}`;
  const suit = SUITS[card.suit];
  el.innerHTML = `
    <div class="topRow"><div class="costPip">${card.cost}</div><div class="suitMark">${suit.glyph}</div></div>
    <div class="cardName">${card.name}</div>
    <div class="art">${card.art}</div>
    <div class="powerRow"><span class="powerBadge">⚔ ${card.power}</span><span class="kindTag">${card.kind}</span></div>`;
  if (opts.onClick) el.addEventListener('click', opts.onClick);
  return el;
}

export function renderHands(state, onPlay) {
  const foe = $('foeHand');
  foe.innerHTML = '';
  state.foeHand.forEach((card) => foe.appendChild(cardEl(card)));
  const hero = $('heroHand');
  hero.innerHTML = '';
  state.heroHand.forEach((card, i) => {
    hero.appendChild(cardEl(card, {
      disabled: card.cost > state.energy || state.phase !== 'hero',
      onClick: () => onPlay(i),
    }));
  });
}

export function renderHud(state, intentText) {
  $('roundTag').textContent = `Round ${state.round}`;
  $('foeHpFill').style.width = `${(state.foeHp / MAX_HP) * 100}%`;
  $('heroHpFill').style.width = `${(state.heroHp / MAX_HP) * 100}%`;
  $('foeHpText').textContent = `${state.foeHp} / ${MAX_HP}`;
  $('heroHpText').textContent = `${state.heroHp} / ${MAX_HP}`;
  $('energyText').textContent = state.energy;
  $('blockText').textContent = state.heroBlock;
  $('intentText').textContent = intentText;
}

export function renderArena(heroCard, foeCard, banner, combo) {
  const left = $('arenaLeft');
  const right = $('arenaRight');
  left.innerHTML = '';
  right.innerHTML = '';
  if (heroCard) left.appendChild(cardEl(heroCard));
  if (foeCard) right.appendChild(cardEl(foeCard));
  $('clashBanner').textContent = banner;
  $('comboTag').textContent = combo || '';
}

export function setLog(text) {
  $('logLine').textContent = text;
}

export function showOverlay(kind, state) {
  const overlay = $('overlay');
  const card = $('overlayCard');
  const suits = $('overlaySuits');
  suits.innerHTML = '';
  Object.values(SUITS).forEach((s) => {
    const m = document.createElement('div');
    m.className = 'miniCard';
    m.innerHTML = `<div class="glyph" style="color:${s.colour}">${s.glyph}</div><div class="label">${s.name}</div>`;
    suits.appendChild(m);
  });
  card.classList.remove('flourish');
  void card.offsetWidth;
  card.classList.add('flourish');
  if (kind === 'title') {
    $('overlayTitle').textContent = 'EMBERFALL DUEL';
    $('overlayText').textContent =
      'Out-duel Morvane the Warden. Read his intent, spend 4 energy a round, ' +
      'and chain same-suit cards for Suit Surge bonuses. First to 0 life falls.';
    $('overlayBtn').textContent = 'Start duel';
  } else if (kind === 'win') {
    $('overlayTitle').textContent = 'VICTORY!';
    $('overlayText').textContent =
      `Morvane falls in round ${state.round}. You stand at ${state.heroHp} life — the table is yours.`;
    $('overlayBtn').textContent = 'Duel again';
  } else {
    $('overlayTitle').textContent = 'DEFEAT';
    $('overlayText').textContent =
      `Morvane's ward holds. You fell in round ${state.round} with the Warden at ${state.foeHp} life.`;
    $('overlayBtn').textContent = 'Try again';
  }
  overlay.classList.remove('hidden');
}

export function hideOverlay() {
  $('overlay').classList.add('hidden');
}
