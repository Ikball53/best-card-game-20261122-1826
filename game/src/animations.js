// Emberfall Clash — card motion: dealing, flipping, snapping, shaking, celebrating.
export function dealAnimation(cardEls) {
  cardEls.forEach((el, i) => {
    el.classList.remove("dealt");
    el.style.animationDelay = (i * 70) + "ms";
    void el.offsetWidth; // restart the CSS animation
    el.classList.add("dealt");
  });
}

export function flipCards(cardEls) {
  cardEls.forEach((el, i) => {
    el.style.animationDelay = (i * 90) + "ms";
    el.classList.add("flipped");
  });
}

export function snapIntoClash(el) {
  el.classList.remove("snapped");
  void el.offsetWidth;
  el.classList.add("snapped");
}

export function damageShake(el) {
  el.classList.remove("shaken");
  void el.offsetWidth;
  el.classList.add("shaken");
}

// A burst of ember sparks over the table when the player wins.
export function winFlourish(host) {
  for (let i = 0; i < 42; i++) {
    const spark = document.createElement("span");
    spark.className = "spark";
    spark.style.left = (8 + Math.random() * 84) + "%";
    spark.style.top = (55 + Math.random() * 30) + "%";
    spark.style.animationDelay = (Math.random() * 0.9) + "s";
    spark.style.setProperty("--drift", (Math.random() * 120 - 60) + "px");
    host.appendChild(spark);
    setTimeout(() => spark.remove(), 2600);
  }
}

export function pulseElement(el) {
  el.classList.remove("pulsed");
  void el.offsetWidth;
  el.classList.add("pulsed");
}
