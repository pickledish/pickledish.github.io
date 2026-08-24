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

  function hideDraw(marker) {
    marker.hidden = true;
  }

  function tokenStyle(token) {
    return `--token-color: var(--${token.id})`;
  }

  function clearCandidateState(element) {
    element.classList.remove("placeholder", "winner", "loser", "drawing");
  }

  function resetCandidate(element) {
    clearCandidateState(element);
    element.classList.add("placeholder");
    element.textContent = "?";
    element.style.cssText = "";
  }

  function fillCandidate(element, token) {
    clearCandidateState(element);
    element.textContent = token.label;
    element.style.cssText = tokenStyle(token);
    void element.offsetWidth;
    element.classList.add("drawing");
  }

  function markWinner(winnerElement, loserElement) {
    winnerElement.classList.remove("drawing");
    loserElement.classList.remove("drawing");
    winnerElement.classList.add("winner");
    loserElement.classList.add("loser");
  }

  function setupStageOne() {
    const button = $("#sample-one");
    const marker = $("#stage1-marker");
    const markerLabel = $("#stage1-marker-label");
    const tokenEl = $("#stage1-token");
    if (!button || !marker || !markerLabel || !tokenEl) return;

    button.addEventListener("click", async () => {
      button.disabled = true;
      tokenEl.textContent = "…";
      tokenEl.className = "sampled-token is-blank";
      hideDraw(marker);

      const { token, draw } = sampleToken();
      placeDraw(marker, markerLabel, draw);
      await wait(560);
      tokenEl.textContent = token.label;
      tokenEl.className = `sampled-token ${token.id}`;
      button.disabled = false;
    });
  }

  function setupStageTwo() {
    const button = $("#sample-two");
    const candidateA = $("#stage2-candidate-a");
    const candidateB = $("#stage2-candidate-b");
    const coin = $("#stage2-coin");
    const tokenEl = $("#stage2-token");
    const panelA = $("#stage2-panel-a");
    const panelB = $("#stage2-panel-b");
    const markerA = $("#stage2-marker-a");
    const markerB = $("#stage2-marker-b");
    const markerALabel = $("#stage2-marker-a-label");
    const markerBLabel = $("#stage2-marker-b-label");
    if (
      !button ||
      !candidateA ||
      !candidateB ||
      !coin ||
      !tokenEl ||
      !panelA ||
      !panelB ||
      !markerA ||
      !markerB ||
      !markerALabel ||
      !markerBLabel
    ) {
      return;
    }

    button.addEventListener("click", async () => {
      button.disabled = true;
      tokenEl.textContent = "…";
      tokenEl.className = "sampled-token is-blank";
      resetCandidate(candidateA);
      resetCandidate(candidateB);
      hideDraw(markerA);
      hideDraw(markerB);
      panelA.classList.remove("active");
      panelB.classList.remove("active");
      coin.classList.remove("flipping-a", "flipping-b");
      void coin.offsetWidth;

      panelA.classList.add("active");
      const sampleA = sampleToken();
      placeDraw(markerA, markerALabel, sampleA.draw);
      await wait(560);
      fillCandidate(candidateA, sampleA.token);
      await wait(650);

      panelA.classList.remove("active");
      panelB.classList.add("active");
      const sampleB = sampleToken();
      placeDraw(markerB, markerBLabel, sampleB.draw);
      await wait(560);
      fillCandidate(candidateB, sampleB.token);
      await wait(700);

      panelB.classList.remove("active");
      const chooseA = randomUnit() < 0.5;
      coin.classList.add(chooseA ? "flipping-a" : "flipping-b");
      await wait(720);

      const winner = chooseA ? sampleA.token : sampleB.token;
      markWinner(chooseA ? candidateA : candidateB, chooseA ? candidateB : candidateA);
      tokenEl.textContent = winner.label;
      tokenEl.className = `sampled-token ${winner.id}`;
      button.disabled = false;
    });
  }

  function setupStageThree() {
    const button = $("#sample-g");
    const candidateA = $("#stage3-candidate-a");
    const candidateB = $("#stage3-candidate-b");
    const gCore = $("#stage3-g");
    const tokenEl = $("#stage3-token");
    const panelA = $("#stage3-panel-a");
    const panelB = $("#stage3-panel-b");
    const markerA = $("#stage3-marker-a");
    const markerB = $("#stage3-marker-b");
    const markerALabel = $("#stage3-marker-a-label");
    const markerBLabel = $("#stage3-marker-b-label");
    if (
      !button ||
      !candidateA ||
      !candidateB ||
      !gCore ||
      !tokenEl ||
      !panelA ||
      !panelB ||
      !markerA ||
      !markerB ||
      !markerALabel ||
      !markerBLabel
    ) {
      return;
    }

    button.addEventListener("click", async () => {
      button.disabled = true;
      tokenEl.textContent = "…";
      tokenEl.className = "sampled-token is-blank";
      resetCandidate(candidateA);
      resetCandidate(candidateB);
      hideDraw(markerA);
      hideDraw(markerB);
      panelA.classList.remove("active");
      panelB.classList.remove("active");
      gCore.classList.remove("choosing");
      void gCore.offsetWidth;

      panelA.classList.add("active");
      const sampleA = sampleToken();
      placeDraw(markerA, markerALabel, sampleA.draw);
      await wait(560);
      fillCandidate(candidateA, sampleA.token);
      await wait(650);

      panelA.classList.remove("active");
      panelB.classList.add("active");
      const sampleB = sampleToken();
      placeDraw(markerB, markerBLabel, sampleB.draw);
      await wait(560);
      fillCandidate(candidateB, sampleB.token);
      await wait(700);

      panelB.classList.remove("active");
      const chooseA = randomUnit() < 0.5;
      gCore.classList.add("choosing");
      await wait(720);

      const winner = chooseA ? sampleA.token : sampleB.token;
      markWinner(chooseA ? candidateA : candidateB, chooseA ? candidateB : candidateA);
      tokenEl.textContent = winner.label;
      tokenEl.className = `sampled-token ${winner.id}`;
      button.disabled = false;
    });
  }

  function init() {
    setupStageOne();
    setupStageTwo();
    setupStageThree();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
