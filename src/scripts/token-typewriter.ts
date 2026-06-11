/**
 * Fake "next-token sampling" typewriter for the hero tagline.
 * For each word of a phrase it shows three top-k candidate chips
 * (the real token plus two distractors with fake probabilities),
 * highlights the winner, then commits the token to the line.
 */
const DISTRACTOR_POOL = [
  'speech',
  'audio',
  'vision',
  'reasoning',
  'tokens',
  'models',
  'RL',
  'data',
  'agents',
  'eval',
];

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function waitUntilVisible(): Promise<void> {
  while (document.hidden) {
    await new Promise<void>((resolve) =>
      document.addEventListener('visibilitychange', () => resolve(), {
        once: true,
      }),
    );
  }
}

function pickDistractors(token: string): [string, string] {
  const pool = DISTRACTOR_POOL.filter(
    (w) => w.toLowerCase() !== token.toLowerCase(),
  );
  const take = (): string =>
    pool.splice(Math.floor(Math.random() * pool.length), 1)[0] ?? 'tokens';
  return [take(), take()];
}

export function mountTokenTypewriter(
  root: HTMLElement,
  phrases: string[],
): void {
  const line = root.querySelector<HTMLElement>('[data-tagline]');
  const chipsWrap = root.querySelector<HTMLElement>('[data-chips]');
  if (!line || !chipsWrap || phrases.length === 0) return;
  const chips = Array.from(chipsWrap.querySelectorAll<HTMLElement>('span'));

  let generation = 0;

  async function run(gen: number): Promise<void> {
    const live = (): boolean => gen === generation;
    let i = 0; // phrase 0 is already rendered as static content
    while (live()) {
      await waitUntilVisible();
      await sleep(3500); // hold the completed phrase
      if (!live()) return;

      line!.style.opacity = '0';
      await sleep(300); // fade out
      if (!live()) return;

      i = (i + 1) % phrases.length;
      line!.textContent = '';
      line!.style.opacity = '1';

      for (const token of (phrases[i] ?? '').split(/\s+/)) {
        await waitUntilVisible();
        if (!live()) return;

        const [d1, d2] = pickDistractors(token);
        const top = 0.38 + Math.random() * 0.24;
        const candidates = [
          { word: token, p: top, winner: true },
          { word: d1, p: top * (0.5 + Math.random() * 0.2), winner: false },
          { word: d2, p: top * (0.2 + Math.random() * 0.2), winner: false },
        ].sort(() => Math.random() - 0.5);

        let winnerChip: HTMLElement | undefined;
        chips.forEach((chip, idx) => {
          const c = candidates[idx];
          if (!c) return;
          chip.textContent = `${c.word} ${c.p.toFixed(2)}`;
          chip.classList.remove('winner');
          if (c.winner) winnerChip = chip;
        });

        await sleep(160); // "sampling"
        if (!live()) return;
        winnerChip?.classList.add('winner');

        await sleep(120); // winner flash, then commit
        if (!live()) return;
        line!.textContent += (line!.textContent ? ' ' : '') + token;

        await sleep(80); // gap before the next token cycle
        winnerChip?.classList.remove('winner');
      }
    }
  }

  const stop = (): void => {
    generation += 1;
    line.style.opacity = '1';
    line.textContent = phrases[0] ?? '';
    chips.forEach((chip) => chip.classList.remove('winner'));
  };

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!reduced.matches) void run(generation);
  reduced.addEventListener('change', () => {
    if (reduced.matches) stop();
    else void run(++generation);
  });
}
