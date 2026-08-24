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

  function tournamentOutput(scores) {
    const gMass = TOKENS.reduce(
      (sum, token, index) => sum + token.probability * scores[index],
      0,
    );
    return TOKENS.map((token, index) => (
      scores[index]
        ? token.probability * (2 - gMass)
        : token.probability * (1 - gMass)
    ));
  }

  function formatPercent(probability) {
    const pct = probability * 100;
    if (Math.abs(pct - Math.round(pct)) < 1e-9) return `${Math.round(pct)}%`;
    return `${pct.toFixed(2)}%`;
  }

  function setupDistortion() {
    const pill = $("#distortion-pill");
    const rows = TOKENS.map((token) => ({
      bar: $(`#distortion-${token.id}-bar`),
      value: $(`#distortion-${token.id}-value`),
    }));
    const buttons = [...document.querySelectorAll("#distortion-vanilla, #distortion-likes-papaya, #distortion-likes-except-papaya")];
    if (!pill || rows.some((row) => !row.bar || !row.value) || buttons.length === 0) {
      return;
    }

    const modes = {
      vanilla: {
        scores: [0, 0, 0, 0],
        pill: "coin flip",
      },
      papaya: {
        scores: [0, 0, 0, 1],
        pill: "g likes papaya",
      },
      "except-papaya": {
        scores: [1, 1, 1, 0],
        pill: "g likes all but papaya",
      },
    };

    function applyMode(mode) {
      const config = modes[mode];
      const output = tournamentOutput(config.scores);

      rows.forEach((row, index) => {
        row.bar.style.setProperty("--width", `${output[index] * 100}%`);
        row.value.textContent = formatPercent(output[index]);
      });
      pill.textContent = config.pill;

      for (const button of buttons) {
        const selected = button.dataset.mode === mode;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-pressed", selected ? "true" : "false");
      }
    }

    for (const button of buttons) {
      button.addEventListener("click", () => applyMode(button.dataset.mode));
    }
  }

  const G_CONTEXT = "myfavoritefruitis";
  const HASH_BITS = 10;

  async function sha256Bytes(text) {
    const encoded = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest("SHA-256", encoded);
    return new Uint8Array(digest);
  }

  function lastBits(bytes, count) {
    const neededBytes = Math.ceil(count / 8);
    let value = 0;
    for (let i = bytes.length - neededBytes; i < bytes.length; i++) {
      value = (value << 8) | bytes[i];
    }
    return value.toString(2).padStart(neededBytes * 8, "0").slice(-count);
  }

  function setupGScore() {
    const form = $("#g-score-form");
    const input = $("#g-score-secret");
    const button = form?.querySelector("button[type='submit']");
    const rows = TOKENS.map((token) => ({
      token,
      row: $(`#g-score-${token.id}`),
      hash: $(`#g-score-${token.id}-hash`),
      bits: $(`#g-score-${token.id}-bits`),
      binary: $(`#g-score-${token.id}-binary`),
      mark: $(`#g-score-${token.id}-mark`),
    }));
    if (!form || !input || !button || rows.some((row) => !row.row || !row.hash || !row.bits || !row.binary || !row.mark)) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const step = (ms) => wait(reduceMotion ? 0 : ms);

    function reveal(element) {
      element.classList.remove("is-visible");
      void element.offsetWidth;
      element.classList.add("is-visible");
    }

    function resetRows() {
      for (const item of rows) {
        item.row.classList.remove("is-no");
        item.hash.classList.remove("is-visible");
        item.bits.classList.remove("is-visible");
        item.hash.textContent = "";
        item.binary.replaceChildren();
        item.mark.textContent = "";
        item.mark.className = "score-mark";
      }
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      button.disabled = true;
      resetRows();

      try {
        const secret = input.value;
        const results = await Promise.all(rows.map(async (item) => {
          const bytes = await sha256Bytes(`${G_CONTEXT}${secret}${item.token.label}`);
          const bits = lastBits(bytes, HASH_BITS);
          const likes = bits.endsWith("0");
          return { item, bits, likes };
        }));

        for (const { item, bits, likes } of results) {
          item.hash.textContent = `sha256(${JSON.stringify(G_CONTEXT)} + ${JSON.stringify(secret)} + ${JSON.stringify(item.token.label)})`;
          reveal(item.hash);
          await step(420);

          const prefix = document.createTextNode(`…${bits.slice(0, -1)}`);
          const lsb = document.createElement("span");
          lsb.className = "lsb";
          lsb.textContent = bits.at(-1);
          item.binary.replaceChildren(prefix, lsb);
          item.mark.textContent = likes ? "💚" : "👎";
          item.row.classList.toggle("is-no", !likes);
          reveal(item.bits);
          await step(280);
        }
      } finally {
        button.disabled = false;
      }
    });
  }

  function init() {
    setupStageOne();
    setupStageTwo();
    setupStageThree();
    setupDistortion();
    setupGScore();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
