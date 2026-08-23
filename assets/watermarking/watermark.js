(() => {
  const TOKENS = [
    { id: "mango", label: "mango", probability: 0.65 },
    { id: "banana", label: "banana", probability: 0.2 },
    { id: "coconut", label: "coconut", probability: 0.1 },
    { id: "papaya", label: "papaya", probability: 0.05 },
  ];

  const $ = (selector) => document.querySelector(selector);
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function randomUnit() {
    if (window.crypto?.getRandomValues) {
      const buffer = new Uint32Array(1);
      window.crypto.getRandomValues(buffer);
      return buffer[0] / 2 ** 32;
    }
    return Math.random();
  }

  function sampleToken() {
    const draw = randomUnit();
    let cumulative = 0;
    for (const token of TOKENS) {
      cumulative += token.probability;
      if (draw < cumulative) return { token, draw };
    }
    return { token: TOKENS.at(-1), draw };
  }

  function placeDraw(marker, markerLabel, draw) {
    marker.hidden = false;
    marker.style.transition = "none";
    marker.style.left = "0%";
    markerLabel.textContent = draw.toFixed(3);
    void marker.offsetWidth;
    marker.style.transition = "";
    marker.style.left = `${Math.min(draw * 100, 99.7)}%`;
  }

  function setupStageOne() {
    const button = $("#sample-one");
    const marker = $("#stage1-marker");
    const markerLabel = $("#stage1-marker-label");
    const result = $("#stage1-result");
    if (!button || !marker || !markerLabel || !result) return;

    button.addEventListener("click", async () => {
      const { token, draw } = sampleToken();
      placeDraw(marker, markerLabel, draw);
      result.innerHTML = `<span>${draw.toFixed(3)} lands in the ${token.label} interval</span><strong>“${token.label}”</strong>`;
      button.disabled = true;
      await wait(540);
      button.disabled = false;
    });
  }

  function init() {
    setupStageOne();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
