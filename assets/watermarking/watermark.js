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
    element.classList.remove("placeholder", "winner", "loser", "drawing", "is-active");
  }

  function resetCandidate(element) {
    clearCandidateState(element);
    element.classList.add("placeholder");
    element.textContent = "?";
    element.style.cssText = "";
  }

  function setCandidate(element, token) {
    clearCandidateState(element);
    element.textContent = token.label;
    element.style.cssText = tokenStyle(token);
  }

  function fillCandidate(element, token) {
    setCandidate(element, token);
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
    const rows = TOKENS.map((token) => ({
      bar: $(`#distortion-${token.id}-bar`),
      value: $(`#distortion-${token.id}-value`),
    }));
    const buttons = [...document.querySelectorAll("#distortion-vanilla, #distortion-likes-papaya, #distortion-likes-except-papaya")];
    if (rows.some((row) => !row.bar || !row.value) || buttons.length === 0) {
      return;
    }

    const modes = {
      vanilla: [0, 0, 0, 0],
      papaya: [0, 0, 0, 1],
      "except-papaya": [1, 1, 1, 0],
    };

    function applyMode(mode) {
      const output = tournamentOutput(modes[mode]);

      rows.forEach((row, index) => {
        row.bar.style.setProperty("--width", `${output[index] * 100}%`);
        row.value.textContent = formatPercent(output[index]);
      });

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
  const DETECT_CORPORA = {
    fruit: `
      my favorite fruit is mango no wait banana no wait actually mango since one time we had a mango near my cousins house and it was so good it was like eating a sunset when the sunset was sticky and also my cousin has this dog named Peanut who tried to swipe the mango and Peanut is like the fastest pup in the whole planet and also maybe the goofiest because after the mango he wanted to chomp a bug and then he ran around in circles for kinda an entire hour and my cousin said Peanut thinks he can fly when he just runs fast enough which is so silly but then we headed to the park and I still had mango goo on my shirt and there was a kid with a kite that looked like a shark and I said I wish I had a kite like that and also another mango and then my mom said we could get ice cream later when I did not fall in that creek again which I definitely did not plan to do last time it was the creeks fault because the rocks were all slippery and also there was a froggy and I had to get a better look obviously and the frog was this big and it looked at me and I looked at it and next it hopped on my sneaker and we screamed but in a crazy way not a spooked way and my sister laughed so loud she spilled her popsicle in the dirt and then she cried and I gave her some of mine even though it was the best flavor and then we spotted a cloud that looked exactly like a dinosaur chomping a mango which is a very smart dinosaur and I told everybody but nobody else could see it except Peanut who howled at the sky and then we went back and I built this fort in the living room with all the couch cushions and a blanket from the hall closet that is not meant to be on the ground but I was really gentle and I put a sign on it that said no grownups welcome unless they bring snacks or mangoes and my dad brought pretzels so I let him in for five minutes and he said the fort was structurally impressive which I think means cool
    `,
    shakespeare: `
      All the world’s a stage, And all the men and women merely players; They have their exits and their entrances; And one man in his time plays many parts, His acts being seven ages. At first the infant, Mewling and puking in the nurse’s arms; And then the whining school-boy, with his satchel And shining morning face, creeping like snail Unwillingly to school. And then the lover, Sighing like furnace, with a woeful ballad Made to his mistress’ eyebrow. Then a soldier, Full of strange oaths, and bearded like the pard, Jealous in honour, sudden and quick in quarrel, Seeking the bubble reputation Even in the cannon’s mouth. And then the justice, In fair round belly with good capon lin’d, With eyes severe and beard of formal cut, Full of wise saws and modern instances; And so he plays his part. The sixth age shifts Into the lean and slipper’d pantaloon, With spectacles on nose and pouch on side; His youthful hose, well sav’d, a world too wide For his shrunk shank; and his big manly voice, Turning again toward childish treble, pipes And whistles in his sound. Last scene of all, That ends this strange eventful history, Is second childishness and mere oblivion; Sans teeth, sans eyes, sans taste, sans everything.
    `,
  };

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

  function setupDetectWidgets() {
    document.querySelectorAll(".watermark-widget[data-detect]").forEach((root) => {
      const corpus = DETECT_CORPORA[root.dataset.detect];
      if (!corpus) return;
      setupDetect(root, corpus.trim().split(/\s+/));
    });
  }

  function setupDetect(root, words) {
    const q = (selector) => root.querySelector(selector);
    const stage = q(".detect-stage");
    const viewport = q(".detect-viewport");
    const track = q(".detect-track");
    const wordsEl = q(".detect-words");
    const bracePrev = q(".detect-brace-prev");
    const braceCur = q(".detect-brace-cur");
    const scoreEl = q(".detect-score");
    const hashEl = scoreEl?.querySelector(".score-hash");
    const bitsEl = scoreEl?.querySelector(".score-bits");
    const binaryEl = scoreEl?.querySelector(".score-binary");
    const yesCount = q(".detect-yes");
    const noCount = q(".detect-no");
    const yesN = yesCount?.querySelector("strong");
    const noN = noCount?.querySelector("strong");
    const percentEl = q(".detect-count-pct strong");
    const stepButton = q("[data-detect-action='step']");
    const step10Button = q("[data-detect-action='step-10']");
    const resetButton = q("[data-detect-action='reset']");
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

  function setupBracket() {
    const root = $("#bracket");
    const stepButton = $("#bracket-step");
    const resetButton = $("#bracket-reset");
    const tokenEl = $("#bracket-token");
    const widget = root?.closest(".watermark-widget");
    if (!root || !stepButton || !resetButton || !tokenEl || !widget) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pause = (ms) => wait(reduceMotion ? 0 : ms);
    const slot = (round, index) => root.querySelector(`[data-slot="${round}-${index}"]`);
    const gBox = (round, index) => root.querySelector(`[data-g="${round}-${index}"]`);

    let board = [];
    let scores = [];
    let nextRound = 0;
    let busy = false;

    function matchCount(round) {
      return 8 >> (round + 1);
    }

    function nonce() {
      const buffer = new Uint32Array(1);
      if (window.crypto?.getRandomValues) window.crypto.getRandomValues(buffer);
      else buffer[0] = Math.floor(randomUnit() * 2 ** 32);
      return buffer[0].toString(16);
    }

    async function scoresFor(secret) {
      const entries = await Promise.all(TOKENS.map(async (token) => {
        const { bits, likes } = await scoreCandidate(G_CONTEXT, secret, token.label);
        return [token.id, { likes, rank: Number.parseInt(bits, 2) }];
      }));
      return Object.fromEntries(entries);
    }

    function chooseWinner(tokenA, tokenB, scoreMap) {
      if (tokenA.id === tokenB.id) return 0;
      const a = scoreMap[tokenA.id];
      const b = scoreMap[tokenB.id];
      if (a.likes !== b.likes) return a.likes ? 0 : 1;
      if (a.rank !== b.rank) return a.rank > b.rank ? 0 : 1;
      return tokenA.id < tokenB.id ? 0 : 1;
    }

    function paint() {
      for (let round = 0; round < 4; round++) {
        const count = 8 >> round;
        for (let index = 0; index < count; index++) {
          const token = board[round][index];
          const element = slot(round, index);
          if (token) setCandidate(element, token);
          else resetCandidate(element);
        }
      }
      for (const g of root.querySelectorAll(".g-core")) {
        g.classList.remove("choosing");
      }
    }

    async function fly(fromEl, toEl, token) {
      if (reduceMotion) {
        setCandidate(toEl, token);
        return;
      }

      const from = fromEl.getBoundingClientRect();
      const to = toEl.getBoundingClientRect();
      const clone = fromEl.cloneNode(true);
      clone.classList.add("bracket-flyer");
      clone.style.left = `${from.left}px`;
      clone.style.top = `${from.top}px`;
      clone.style.width = `${from.width}px`;
      clone.style.height = `${from.height}px`;
      clone.style.transform = "translate(0, 0)";
      widget.append(clone);
      toEl.style.visibility = "hidden";
      try {
        void clone.offsetWidth;
        clone.style.transform = `translate(${to.left - from.left}px, ${to.top - from.top}px)`;
        clone.style.width = `${to.width}px`;
        clone.style.height = `${to.height}px`;
        await wait(420);
      } finally {
        clone.remove();
        toEl.style.visibility = "";
      }
      setCandidate(toEl, token);
    }

    async function seed() {
      busy = true;
      stepButton.disabled = true;
      resetButton.disabled = true;
      for (const flyer of widget.querySelectorAll(".bracket-flyer")) flyer.remove();

      const key = nonce();
      board = [
        Array.from({ length: 8 }, () => sampleToken().token),
        [null, null, null, null],
        [null, null],
        [null],
      ];
      nextRound = 0;
      tokenEl.textContent = "…";
      tokenEl.className = "sampled-token is-blank";
      paint();

      try {
        scores = await Promise.all([1, 2, 3].map((layer) => scoresFor(`${layer}:${key}`)));
      } finally {
        busy = false;
        resetButton.disabled = false;
        stepButton.disabled = false;
      }
    }

    async function playRound() {
      const round = nextRound;
      const scoreMap = scores[round];
      const matches = matchCount(round);

      for (let match = 0; match < matches; match++) {
        const i0 = match * 2;
        const i1 = i0 + 1;
        const tokenA = board[round][i0];
        const tokenB = board[round][i1];
        const win = chooseWinner(tokenA, tokenB, scoreMap);
        const token = win === 0 ? tokenA : tokenB;
        const elA = slot(round, i0);
        const elB = slot(round, i1);
        const g = gBox(round, match);

        elA.classList.add("is-active");
        elB.classList.add("is-active");
        g.classList.remove("choosing");
        void g.offsetWidth;
        g.classList.add("choosing");
        await pause(720);

        elA.classList.remove("is-active");
        elB.classList.remove("is-active");
        markWinner(win === 0 ? elA : elB, win === 0 ? elB : elA);
        await pause(280);

        board[round + 1][match] = token;
        await fly(win === 0 ? elA : elB, slot(round + 1, match), token);
      }

      nextRound += 1;
      if (nextRound >= 3) {
        const champ = board[3][0];
        tokenEl.textContent = champ.label;
        tokenEl.className = `sampled-token ${champ.id}`;
        stepButton.disabled = true;
      }
    }

    stepButton.addEventListener("click", async () => {
      if (busy || nextRound >= 3) return;
      busy = true;
      stepButton.disabled = true;
      resetButton.disabled = true;
      try {
        await playRound();
      } finally {
        busy = false;
        resetButton.disabled = false;
        if (nextRound < 3) stepButton.disabled = false;
      }
    });

    resetButton.addEventListener("click", () => {
      if (busy) return;
      void seed();
    });

    void seed();
  }

  function niceCeiling(value) {
    if (value <= 1) return 1;
    const exp = Math.floor(Math.log10(value));
    const pow = 10 ** exp;
    const mant = value / pow;
    const steps = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
    return steps.find((step) => mant <= step) * pow;
  }

  function desiredSlots(maxCount, pixelMax) {
    const count = Math.max(maxCount, 1);
    if (count <= 6) return count;
    return Math.max(8, Math.min(pixelMax, Math.round(4 * Math.log2(count))));
  }

  function histogramScale(maxCount, plotHeight, stackWidth) {
    const count = Math.max(maxCount, 1);
    const height = Math.max(plotHeight || 0, 1);
    const pixelMax = Math.max(8, Math.floor(height / 2));
    let yMax = niceCeiling(count);
    const slotsWanted = desiredSlots(count, pixelMax);
    let unit = Math.max(1, Math.ceil(yMax / slotsWanted));
    let slots = Math.max(1, Math.round(yMax / unit));

    if (stackWidth > 0) {
      let gap = 1;
      let slotsForSquare = Math.max(1, Math.ceil((height + gap) / (stackWidth + gap)));
      if (slotsForSquare > 40) {
        gap = 0;
        slotsForSquare = Math.max(1, Math.ceil(height / stackWidth));
      }
      if (slots < slotsForSquare) {
        unit = 1;
        yMax = niceCeiling(Math.max(count, slotsForSquare));
        slots = Math.max(1, Math.round(yMax / unit));
      }
    }

    return { unit, slots, yMax };
  }

  function axisTicks(yMax) {
    if (yMax <= 1) return [0, 1];
    if (yMax <= 6) return Array.from({ length: yMax + 1 }, (_, i) => i);
    for (const divisions of [3, 4, 5, 2]) {
      if (yMax % divisions === 0) {
        return Array.from({ length: divisions + 1 }, (_, i) => (yMax * i) / divisions);
      }
    }
    return [0, yMax];
  }

  function formatCount(value) {
    if (value >= 1000) {
      return new Intl.NumberFormat("en-US", {
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 1,
      }).format(value);
    }
    return String(value);
  }

  function setupWorlds() {
    const plot = $("#worlds-plot");
    const yScale = $("#worlds-y-scale");
    const label = $("#worlds-round");
    const prev = $("#worlds-prev");
    const next = $("#worlds-next");
    if (!plot || !yScale || !label || !prev || !next) return;

    const maxRounds = 5;
    const bucketWidth = 1;
    const histograms = [
      [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [2, 2, 0, 1, 2, 3, 2, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [56, 39, 13, 14, 17, 25, 24, 9, 11, 12, 8, 6, 7, 3, 2, 3, 4, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1261, 567, 286, 243, 210, 215, 242, 122, 108, 118, 126, 108, 94, 83, 42, 31, 30, 34, 25, 10, 31, 23, 27, 19, 10, 3, 6, 3, 1, 11, 3, 0, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [25107, 8042, 4632, 3849, 2697, 2531, 2616, 1733, 1461, 1304, 1347, 1305, 1327, 1363, 597, 397, 422, 529, 440, 385, 446, 391, 429, 314, 357, 196, 229, 74, 56, 114, 51, 62, 159, 52, 18, 48, 109, 66, 43, 63, 65, 26, 14, 12, 3, 7, 13, 4, 1, 30],
      [469338, 114198, 68414, 55841, 37157, 33600, 31682, 25594, 19453, 16192, 16227, 15961, 16719, 19175, 8803, 6430, 6527, 6724, 6244, 5750, 5779, 5905, 6072, 5553, 6497, 5303, 3923, 1886, 1528, 1663, 1379, 1733, 2518, 1370, 1082, 1206, 1742, 1163, 994, 1569, 1306, 972, 1006, 864, 707, 709, 486, 255, 178, 3199],
    ];
    const worldCounts = histograms.map((hist) => hist.reduce((sum, count) => sum + count, 0));

    const stacksWrap = document.createElement("div");
    stacksWrap.className = "worlds-stacks";
    const stacks = histograms[0].map((_, index) => {
      const stack = document.createElement("div");
      stack.className = "worlds-stack is-empty";
      const lo = index * bucketWidth;
      stack.dataset.range = `${lo}%`;
      stacksWrap.append(stack);
      return stack;
    });

    const mean = document.createElement("div");
    mean.className = "worlds-mean";
    mean.innerHTML = "<span>5%</span>";
    stacksWrap.append(mean);
    plot.append(stacksWrap);

    function positionMean() {
      const stack = stacks[5];
      mean.style.left = `${stack.offsetLeft + stack.offsetWidth / 2}px`;
    }

    let rounds = 0;

    function formatMoods(count) {
      return `${count.toLocaleString("en-US")} ${count === 1 ? "mood" : "moods"}`;
    }

    function renderYAxis(yMax) {
      yScale.replaceChildren(
        ...axisTicks(yMax).map((tick) => {
          const span = document.createElement("span");
          if (tick === yMax) span.className = "is-top";
          if (tick === 0) span.className = "is-bottom";
          span.style.bottom = `${(tick / yMax) * 100}%`;
          span.textContent = formatCount(tick);
          return span;
        }),
      );
    }

    function renderStack(stack, count, unit, slots) {
      const boxes = count === 0 ? 0 : Math.min(slots, Math.max(1, Math.round(count / unit)));
      while (stack.childElementCount < boxes) {
        const box = document.createElement("span");
        box.className = "worlds-box";
        stack.append(box);
      }
      while (stack.childElementCount > boxes) {
        stack.lastElementChild.remove();
      }
      stack.classList.toggle("is-empty", boxes === 0);
      stack.title = count
        ? `${count.toLocaleString("en-US")} ${count === 1 ? "mood" : "moods"} at ~${stack.dataset.range}`
        : "";
    }

    function render() {
      const hist = histograms[rounds];
      const total = worldCounts[rounds];
      const { unit, slots, yMax } = histogramScale(
        Math.max(...hist),
        stacksWrap.clientHeight,
        stacks[0]?.clientWidth || 0,
      );
      const gap = slots > 40 ? 0 : 1;
      stacksWrap.style.setProperty("--box-gap", `${gap}px`);
      stacksWrap.style.setProperty(
        "--box-h",
        `calc((100% - ${slots - 1} * var(--box-gap)) / ${slots})`,
      );
      renderYAxis(yMax);
      stacks.forEach((stack, index) => {
        renderStack(stack, hist[index], unit, slots);
      });
      const roundText = rounds === 1 ? "1 round" : `${rounds} rounds`;
      label.textContent = `${roundText} (${formatMoods(total)})`;
      prev.disabled = rounds === 0;
      next.disabled = rounds === maxRounds;
      plot.setAttribute(
        "aria-label",
        `Count of g-function moods by papaya’s probability after ${roundText}, across ${formatMoods(total)}`,
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

    new ResizeObserver(() => {
      render();
      positionMean();
    }).observe(stacksWrap);

    render();
  }

  function init() {
    setupStageOne();
    setupStageTwo();
    setupStageThree();
    setupDistortion();
    setupGScore();
    setupDetectWidgets();
    setupBracket();
    setupWorlds();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
