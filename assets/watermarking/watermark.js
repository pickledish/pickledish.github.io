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
  const DETECT_SECRET = "key";
  const DETECT_WORDS = `
    my favorite fruit is mango no wait banana no wait actually mango because one time I had a mango at my cousins house and it was so good it was like eating a sunset if a sunset was sticky and also my cousin has this dog named peanut who tried to steal the mango and peanut is like the fastest dog in the whole world and also maybe the dumbest because after the mango he tried to eat a bee and then he ran around in circles for like a whole hour and my cousin said peanut thinks he can fly if he just runs fast enough which is so silly but then we went to the park and I still had mango juice on my shirt and there was a kid with a kite that looked like a shark and I said I wish I had a kite like that and also another mango and then my mom said we could get ice cream after if I did not fall in the creek again which I definitely did not mean to do last time it was the creeks fault because the rocks were all slippery and also there was a frog and I had to get a closer look obviously and the frog was this big and it looked at me and I looked at it and then it jumped on my shoe and I screamed but in a cool way not a scared way and my sister laughed so hard she dropped her popsicle in the dirt and then she cried and I gave her half of mine even though it was the good flavor and then we saw a cloud that looked exactly like a dinosaur eating a mango which is a very smart dinosaur and I told everybody but nobody else could see it except peanut who barked at the sky and then we went home and I built a fort in the living room with all the couch cushions and a blanket from the hall closet that is not supposed to be on the floor but I was really careful and I put a sign on it that said no grownups allowed unless they bring snacks or mangoes and my dad brought pretzels so I let him in for five minutes and he said the fort was structurally impressive which I think means cool
  `.trim().split(/\s+/);

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

  function gContext(tokens) {
    return tokens.join("");
  }

  function formatHashCall(context, secret, candidate) {
    return `sha256(${JSON.stringify(context)} + ${JSON.stringify(secret)} + ${JSON.stringify(candidate)})`;
  }

  async function scoreCandidate(context, secret, candidate) {
    const bytes = await sha256Bytes(`${context}${secret}${candidate}`);
    const bits = lastBits(bytes, HASH_BITS);
    return { bits, likes: bits.endsWith("0") };
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
          const { bits, likes } = await scoreCandidate(G_CONTEXT, secret, item.token.label);
          return { item, bits, likes };
        }));

        for (const { item, bits, likes } of results) {
          item.hash.textContent = formatHashCall(G_CONTEXT, secret, item.token.label);
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

  function setupDetect() {
    const stage = $("#detect-stage");
    const viewport = $("#detect-viewport");
    const track = $("#detect-track");
    const wordsEl = $("#detect-words");
    const bracePrev = $("#detect-brace-prev");
    const braceCur = $("#detect-brace-cur");
    const scoreEl = $("#detect-score");
    const hashEl = $("#detect-hash");
    const bitsEl = $("#detect-bits");
    const binaryEl = $("#detect-binary");
    const yesCount = $("#detect-yes");
    const noCount = $("#detect-no");
    const yesN = $("#detect-yes-n");
    const noN = $("#detect-no-n");
    const percentEl = $("#detect-percent");
    const stepButton = $("#detect-step");
    const step10Button = $("#detect-step-10");
    const resetButton = $("#detect-reset");
    if (
      !stage ||
      !viewport ||
      !track ||
      !wordsEl ||
      !bracePrev ||
      !braceCur ||
      !scoreEl ||
      !hashEl ||
      !bitsEl ||
      !binaryEl ||
      !yesCount ||
      !noCount ||
      !yesN ||
      !noN ||
      !percentEl ||
      !stepButton ||
      !step10Button ||
      !resetButton
    ) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pause = (ms) => wait(reduceMotion ? 0 : ms);
    const fadeWidth = 56;
    const words = DETECT_WORDS;
    let tokenEls = [];
    let cursor = 0;
    let liked = 0;
    let scored = 0;
    let scrollX = 0;
    let busy = false;
    let ready = false;

    function remaining() {
      return Math.max(0, words.length - 4 - scored);
    }

    function setControls(enabled) {
      stepButton.disabled = !enabled;
      step10Button.disabled = !enabled;
    }

    function reveal(element) {
      element.classList.remove("is-visible");
      void element.offsetWidth;
      element.classList.add("is-visible");
    }

    function clearScore() {
      hashEl.classList.remove("is-visible");
      bitsEl.classList.remove("is-visible");
      hashEl.textContent = "";
      binaryEl.replaceChildren();
      scoreEl.classList.remove("is-no");
      braceCur.classList.remove("is-no");
    }

    function setCounts() {
      yesN.textContent = String(liked);
      noN.textContent = String(scored - liked);
      percentEl.textContent = scored === 0 ? "0%" : `${Math.round((100 * liked) / scored)}%`;
    }

    function pulse(element) {
      element.classList.remove("is-pulse");
      void element.offsetWidth;
      element.classList.add("is-pulse");
    }

    function light(likes) {
      yesCount.classList.toggle("is-lit", likes);
      noCount.classList.toggle("is-lit", !likes);
    }

    function unlight() {
      yesCount.classList.remove("is-lit", "is-pulse");
      noCount.classList.remove("is-lit", "is-pulse");
    }

    function paintTokens() {
      for (const [index, tokenEl] of tokenEls.entries()) {
        tokenEl.className = "detect-token";
        if (index >= cursor && index < cursor + 4) tokenEl.classList.add("is-prev");
        if (index === cursor + 4) tokenEl.classList.add("is-current");
      }
    }

    function setBraces(animate) {
      const prevFirst = tokenEls[cursor];
      const prevLast = tokenEls[cursor + 3];
      const current = tokenEls[cursor + 4];
      if (!prevFirst || !prevLast || !current) return;

      const apply = (element, left, width) => {
        element.style.transition = animate && !reduceMotion ? "" : "none";
        element.style.left = `${left}px`;
        element.style.width = `${Math.max(width, 12)}px`;
      };

      apply(
        bracePrev,
        prevFirst.offsetLeft,
        prevLast.offsetLeft + prevLast.offsetWidth - prevFirst.offsetLeft,
      );
      apply(braceCur, current.offsetLeft, current.offsetWidth);

      if (!animate || reduceMotion) {
        void bracePrev.offsetWidth;
        bracePrev.style.transition = "";
        braceCur.style.transition = "";
      }
    }

    function ensureWindowVisible(animate) {
      const current = tokenEls[cursor + 4];
      if (!current) return;
      const limit = scrollX + viewport.clientWidth - fadeWidth - 8;
      const right = current.offsetLeft + current.offsetWidth;
      if (right > limit) scrollX = Math.max(0, right - (viewport.clientWidth - fadeWidth - 8));
      track.style.transition = animate && !reduceMotion ? "" : "none";
      track.style.transform = `translateX(${-scrollX}px)`;
      if (!animate || reduceMotion) {
        void track.offsetWidth;
        track.style.transition = "";
      }
    }

    function layout(animate) {
      paintTokens();
      setBraces(animate);
      ensureWindowVisible(animate);
    }

    function showBits(bits, likes) {
      const prefix = document.createTextNode(`…${bits.slice(0, -1)}`);
      const lsb = document.createElement("span");
      lsb.className = "lsb";
      lsb.textContent = bits.at(-1);
      binaryEl.replaceChildren(prefix, lsb);
      scoreEl.classList.toggle("is-no", !likes);
      tokenEls[cursor + 4]?.classList.toggle("is-no", !likes);
      tokenEls[cursor + 4]?.classList.toggle("is-yes", likes);
      braceCur.classList.toggle("is-no", !likes);
    }

    function renderWords() {
      wordsEl.replaceChildren();
      tokenEls = words.map((word) => {
        const tokenEl = document.createElement("span");
        tokenEl.className = "detect-token";
        tokenEl.textContent = word;
        wordsEl.append(tokenEl);
        return tokenEl;
      });
    }

    function resetState() {
      cursor = 0;
      liked = 0;
      scored = 0;
      scrollX = 0;
      clearScore();
      unlight();
      setCounts();
      layout(false);
      setControls(true);
    }

    async function stepOnce(animated) {
      if (remaining() <= 0) return;
      clearScore();
      unlight();

      const prev = words.slice(cursor, cursor + 4);
      const current = words[cursor + 4];
      const context = gContext(prev);
      const { bits, likes } = await scoreCandidate(context, DETECT_SECRET, current);

      hashEl.textContent = formatHashCall(context, DETECT_SECRET, current);
      showBits(bits, likes);
      reveal(hashEl);
      reveal(bitsEl);

      if (animated) {
        await pause(420);
        scored += 1;
        if (likes) liked += 1;
        setCounts();
        pulse(likes ? yesCount : noCount);
        await pause(420);
      } else {
        scored += 1;
        if (likes) liked += 1;
        setCounts();
        light(likes);
        await pause(150);
      }

      if (remaining() > 0) {
        braceCur.classList.remove("is-no");
        cursor += 1;
        layout(animated);
        if (animated) await pause(460);
        clearScore();
        unlight();
      }
    }

    async function runSteps(count, animated) {
      if (busy || !ready || remaining() <= 0) return;
      busy = true;
      resetButton.disabled = true;
      setControls(false);
      stage.classList.toggle("is-instant", !animated);
      try {
        for (let i = 0; i < count; i++) {
          if (remaining() <= 0) break;
          await stepOnce(animated);
        }
      } finally {
        stage.classList.remove("is-instant");
        busy = false;
        resetButton.disabled = false;
        setControls(remaining() > 0);
      }
    }

    resetButton.addEventListener("click", () => {
      if (busy) return;
      resetState();
    });
    stepButton.addEventListener("click", () => {
      void runSteps(1, true);
    });
    step10Button.addEventListener("click", () => {
      void runSteps(10, false);
    });

    const resize = new ResizeObserver(() => {
      if (!ready || busy) return;
      layout(false);
    });
    resize.observe(viewport);

    setControls(false);
    renderWords();
    void (async () => {
      if (document.fonts?.ready) await document.fonts.ready;
      resetState();
      ready = true;
    })();
  }

  function setupWorlds() {
    const plot = $("#worlds-plot");
    const label = $("#worlds-round");
    const prev = $("#worlds-prev");
    const next = $("#worlds-next");
    if (!plot || !label || !prev || !next) return;

    const maxRounds = 5;
    const bucketWidth = 2;
    const histograms = [
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [4, 1, 5, 2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [95, 27, 42, 33, 23, 14, 10, 5, 6, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1828, 529, 425, 364, 226, 234, 177, 73, 64, 35, 54, 46, 13, 9, 12, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [33149, 8481, 5228, 4349, 2765, 2652, 2690, 994, 951, 825, 837, 743, 553, 303, 170, 113, 211, 66, 175, 106, 91, 26, 10, 17, 13, 13, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [583536, 124255, 70757, 57276, 35645, 32188, 35894, 15233, 13251, 11994, 11684, 11625, 11800, 5809, 3191, 3112, 3888, 2288, 2905, 2563, 2278, 1870, 1416, 741, 453, 407, 543, 457, 186, 462, 289, 278, 157, 40, 16, 40, 9, 30, 4, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];
    const worldCounts = histograms.map((hist) => hist.reduce((sum, count) => sum + count, 0));

    const barsWrap = document.createElement("div");
    barsWrap.className = "worlds-bars";
    const bars = histograms[0].map((_, index) => {
      const bar = document.createElement("span");
      bar.className = "worlds-bar is-empty";
      bar.style.setProperty("--height", "0%");
      const lo = index * bucketWidth;
      const hi = lo + bucketWidth;
      bar.dataset.range = `${lo}–${hi}%`;
      barsWrap.append(bar);
      return bar;
    });

    const mean = document.createElement("div");
    mean.className = "worlds-mean";
    mean.innerHTML = "<span>5%</span>";
    barsWrap.append(mean);
    plot.append(barsWrap);

    function positionMean() {
      const bar = bars[2];
      mean.style.left = `${bar.offsetLeft + bar.offsetWidth / 2}px`;
    }

    new ResizeObserver(positionMean).observe(barsWrap);

    let rounds = 0;

    function formatPossibilities(count) {
      return `${count.toLocaleString("en-US")} ${count === 1 ? "possibility" : "possibilities"}`;
    }

    function render() {
      const hist = histograms[rounds];
      const total = worldCounts[rounds];
      bars.forEach((bar, index) => {
        const count = hist[index];
        bar.style.setProperty("--height", `${Math.sqrt(count / total) * 100}%`);
        bar.classList.toggle("is-empty", count === 0);
        bar.title = count
          ? `${bar.dataset.range}: ${count.toLocaleString("en-US")} of ${formatPossibilities(total)}`
          : "";
      });
      const roundText = rounds === 1 ? "1 round" : `${rounds} rounds`;
      label.textContent = `${roundText} (${formatPossibilities(total)})`;
      prev.disabled = rounds === 0;
      next.disabled = rounds === maxRounds;
      plot.setAttribute(
        "aria-label",
        `Histogram of papaya’s probability after ${roundText}, across ${formatPossibilities(total)}`,
      );
    }

    prev.addEventListener("click", () => {
      if (rounds === 0) return;
      rounds -= 1;
      render();
    });
    next.addEventListener("click", () => {
      if (rounds === maxRounds) return;
      rounds += 1;
      render();
    });

    render();
  }

  function init() {
    setupStageOne();
    setupStageTwo();
    setupStageThree();
    setupDistortion();
    setupGScore();
    setupDetect();
    setupWorlds();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
