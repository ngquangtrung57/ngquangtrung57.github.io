/* "The Forward Pass" — explorable LLM pipeline in the hero.
   Stages: input → tokenize → attend → logits → decode.
   Hidden inside the logits stage: a "be the sampler" mini-game. */

const STAGES = ['input', 'tokenize', 'attend', 'logits', 'decode'] as const;
type Stage = (typeof STAGES)[number];

const DECODE_TEXT = '♪ acoustic guitar, ~96 bpm — sounds like a café playlist.';

interface Round {
  ctx: string;
  options: Array<[token: string, prob: number]>; // first = argmax
}

const ROUNDS: Round[] = [
  { ctx: 'Attention is all you ___', options: [['need', 0.96], ['want', 0.03], ['get', 0.01]] },
  { ctx: 'Scaling laws: more data, more ___', options: [['compute', 0.58], ['params', 0.31], ['coffee', 0.11]] },
  { ctx: 'I post-train audio ___', options: [['LLMs', 0.74], ['waves', 0.14], ['books', 0.12]] },
  { ctx: 'The GOAT wears number ___', options: [['10', 0.91], ['7', 0.07], ['30', 0.02]] },
  { ctx: 'The unkillable demon king plays for ___', options: [['T1', 0.89], ['GenG', 0.07], ['DRX', 0.04]] },
];

const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function mountForwardPass(root: HTMLElement): void {
  const stageButtons = Array.from(
    root.querySelectorAll<HTMLButtonElement>('[data-stage]'),
  );
  const panels = Array.from(
    root.querySelectorAll<HTMLElement>('[data-panel]'),
  );
  const decodeLine = root.querySelector<HTMLElement>('[data-decode-line]');
  const gameMount = root.querySelector<HTMLElement>('[data-game]');
  const playBtn = root.querySelector<HTMLButtonElement>('[data-play]');
  const pipe = root.querySelector<HTMLElement>('[data-pipe]');
  if (!stageButtons.length || !panels.length) return;

  let active: Stage = 'input';
  let autoTimer = 0;
  let decodeTimer = 0;
  let userTookOver = false;

  function setStage(stage: Stage, byUser: boolean): void {
    active = stage;
    if (byUser) {
      userTookOver = true;
      window.clearInterval(autoTimer);
    }
    const idx = STAGES.indexOf(stage);
    if (pipe) pipe.style.setProperty('--stage-idx', String(idx));

    for (const btn of stageButtons) {
      const isActive = btn.dataset.stage === stage;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
      // mark stages the signal has already passed through
      const btnIdx = STAGES.indexOf((btn.dataset.stage ?? 'input') as Stage);
      btn.classList.toggle('passed', btnIdx < idx);
    }
    for (const panel of panels) {
      const isActive = panel.dataset.panel === stage;
      if (isActive && !panel.classList.contains('active')) {
        // re-trigger entry animations
        panel.classList.remove('active');
        void panel.offsetWidth;
        panel.classList.add('active');
      } else if (!isActive) {
        panel.classList.remove('active');
      }
      panel.hidden = !isActive;
    }
    if (stage === 'decode') runDecode();
  }

  function runDecode(): void {
    if (!decodeLine) return;
    window.clearInterval(decodeTimer);
    if (reducedMotion()) {
      decodeLine.textContent = DECODE_TEXT;
      return;
    }
    decodeLine.textContent = '';
    let i = 0;
    decodeTimer = window.setInterval(() => {
      i += 1;
      decodeLine.textContent = DECODE_TEXT.slice(0, i);
      if (i >= DECODE_TEXT.length) window.clearInterval(decodeTimer);
    }, 22);
  }

  for (const btn of stageButtons) {
    btn.addEventListener('click', () => {
      setStage((btn.dataset.stage ?? 'input') as Stage, true);
    });
  }

  // ambient auto-cycle until the visitor takes over
  if (!reducedMotion()) {
    autoTimer = window.setInterval(() => {
      const next = STAGES[(STAGES.indexOf(active) + 1) % STAGES.length] ?? 'input';
      setStage(next, false);
    }, 3800);
  }

  // pause the auto-cycle while the tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (userTookOver || reducedMotion()) return;
    window.clearInterval(autoTimer);
    if (!document.hidden) {
      autoTimer = window.setInterval(() => {
        const next = STAGES[(STAGES.indexOf(active) + 1) % STAGES.length] ?? 'input';
        setStage(next, false);
      }, 3800);
    }
  });

  setStage('input', false);

  // --- the game: be the sampler ---
  if (playBtn && gameMount) {
    playBtn.addEventListener('click', () => {
      userTookOver = true;
      window.clearInterval(autoTimer);
      startGame(root, gameMount);
    });
  }
}

function startGame(root: HTMLElement, mount: HTMLElement): void {
  const stageArea = root.querySelector<HTMLElement>('[data-stages-area]');
  if (stageArea) stageArea.hidden = true;
  mount.hidden = false;

  let round = 0;
  let score = 0;

  const el = (tag: string, cls: string, text?: string): HTMLElement => {
    const node = document.createElement(tag);
    node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  function renderRound(): void {
    const data = ROUNDS[round];
    if (!data) return renderEnd();

    mount.replaceChildren();
    mount.append(
      el('p', 'g-meta', `round ${round + 1}/${ROUNDS.length} · score ${score} · pick the model's next token`),
      el('p', 'g-ctx', data.ctx),
    );

    const row = el('div', 'g-options');
    // shuffle for display, keep prob info
    const shuffled = data.options
      .map((opt, i) => ({ opt, isArgmax: i === 0, key: Math.random() }))
      .sort((a, b) => a.key - b.key);

    for (const { opt, isArgmax } of shuffled) {
      const btn = el('button', 'g-token', opt[0]) as HTMLButtonElement;
      btn.type = 'button';
      btn.addEventListener('click', () => reveal(isArgmax), { once: true });
      row.appendChild(btn);
    }
    mount.appendChild(row);

    function reveal(pickedArgmax: boolean): void {
      if (pickedArgmax) score += 1;
      row.querySelectorAll<HTMLButtonElement>('button').forEach((b) => (b.disabled = true));

      const bars = el('div', 'g-bars');
      for (const [token, prob] of data!.options) {
        const barRow = el('div', 'g-bar-row');
        barRow.append(el('span', 'g-bar-label', token));
        const track = el('div', 'g-bar-track');
        const fill = el('div', 'g-bar-fill');
        fill.style.width = `${Math.round(prob * 100)}%`;
        track.appendChild(fill);
        barRow.append(track, el('span', 'g-bar-prob', prob.toFixed(2)));
        bars.appendChild(barRow);
      }
      mount.append(
        bars,
        el('p', pickedArgmax ? 'g-result ok' : 'g-result miss',
          pickedArgmax ? '✓ argmax — the model agrees.' : '✗ sampled the tail.'),
      );

      const next = el('button', 'g-next',
        round + 1 < ROUNDS.length ? 'next →' : 'results →') as HTMLButtonElement;
      next.type = 'button';
      next.addEventListener('click', () => {
        round += 1;
        renderRound();
      }, { once: true });
      mount.appendChild(next);
      next.focus({ preventScroll: true });
    }
  }

  function renderEnd(): void {
    const verdict =
      score === ROUNDS.length
        ? 'perfect greedy decoding — you ARE the argmax.'
        : score >= 3
          ? 'solid sampler. a little temperature, good taste.'
          : 'temperature too high — rerolling reality…';

    mount.replaceChildren(
      el('p', 'g-meta', 'run complete'),
      el('p', 'g-score', `${score} / ${ROUNDS.length}`),
      el('p', 'g-verdict', verdict),
    );

    const again = el('button', 'g-next', '↻ play again') as HTMLButtonElement;
    again.type = 'button';
    again.addEventListener('click', () => {
      round = 0;
      score = 0;
      renderRound();
    });

    const back = el('button', 'g-back', '← back to the pipeline') as HTMLButtonElement;
    back.type = 'button';
    back.addEventListener('click', () => {
      mount.hidden = true;
      mount.replaceChildren();
      if (stageArea) stageArea.hidden = false;
    });

    const actions = el('div', 'g-options');
    actions.append(again, back);
    mount.appendChild(actions);
  }

  renderRound();
}
