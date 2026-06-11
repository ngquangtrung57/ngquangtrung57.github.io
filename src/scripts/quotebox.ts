/* The QuoteBox — a "model" full of famous AI quotes.
   Three knobs index a topic × era × heat grid; every combination maps to
   its own verified quote. Turning a knob makes the little network flicker
   and the tokens scatter, then settle into the new quote. */

import { CORPUS, TOPIC_LABELS, ERA_LABELS, HEAT_LABELS } from '../data/quotes';

const SCATTER_MS = 200;

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function mountQuoteBox(root: HTMLElement): void {
  const quoteEl = root.querySelector<HTMLElement>('[data-quote]');
  const attrEl = root.querySelector<HTMLElement>('[data-attr]');
  const cellEl = root.querySelector<HTMLElement>('[data-cell]');
  const shakeBtn = root.querySelector<HTMLButtonElement>('[data-shake]');
  const topicIn = root.querySelector<HTMLInputElement>('[data-topic]');
  const eraIn = root.querySelector<HTMLInputElement>('[data-era]');
  const heatIn = root.querySelector<HTMLInputElement>('[data-heat]');
  const topicOut = root.querySelector<HTMLElement>('[data-topic-out]');
  const eraOut = root.querySelector<HTMLElement>('[data-era-out]');
  const heatOut = root.querySelector<HTMLElement>('[data-heat-out]');
  const netEls = [...root.querySelectorAll<SVGElement>('[data-net] line, [data-net] circle')];
  if (!quoteEl || !attrEl || !cellEl || !shakeBtn || !topicIn || !eraIn || !heatIn) return;

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // give every node/edge a resting opacity so the net looks organic
  const baseOpacity = netEls.map((el) =>
    el.tagName === 'circle' ? rand(0.45, 0.95) : rand(0.12, 0.5)
  );
  netEls.forEach((el, i) => {
    el.style.opacity = String(baseOpacity[i]);
  });

  let settleTimer: ReturnType<typeof setTimeout> | undefined;

  function flickerNet(): void {
    if (reduceMotion) return;
    for (const el of netEls) {
      el.style.opacity = String(rand(0.05, 1));
    }
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      netEls.forEach((el, i) => {
        el.style.opacity = String(baseOpacity[i]);
      });
    }, 550);
  }

  function scatterVars(el: HTMLElement): void {
    el.style.setProperty('--dx', `${rand(-16, 16).toFixed(1)}px`);
    el.style.setProperty('--dy', `${rand(-12, 12).toFixed(1)}px`);
    el.style.setProperty('--rot', `${rand(-14, 14).toFixed(1)}deg`);
  }

  function current(): { text: string; attribution: string; label: string } {
    const t = Number(topicIn!.value);
    const e = Number(eraIn!.value);
    const h = Number(heatIn!.value);
    if (topicOut) topicOut.textContent = TOPIC_LABELS[t]!;
    if (eraOut) eraOut.textContent = ERA_LABELS[e]!;
    if (heatOut) heatOut.textContent = HEAT_LABELS[h]!;
    const q = CORPUS[t]![e]![h]!;
    return {
      text: q.text,
      attribution: q.attribution,
      label: `// ${TOPIC_LABELS[t]} × ${ERA_LABELS[e]} × ${HEAT_LABELS[h]}`,
    };
  }

  // build token spans, starting scattered, then settle into place
  function setQuote(q: { text: string; attribution: string; label: string }, settleIn: boolean): void {
    quoteEl!.textContent = '';
    for (const word of q.text.split(' ')) {
      const tk = document.createElement('span');
      tk.className = 'tk';
      tk.textContent = word;
      if (settleIn && !reduceMotion) {
        scatterVars(tk);
        tk.classList.add('scatter');
      }
      quoteEl!.append(tk);
      quoteEl!.append(document.createTextNode(' '));
    }
    attrEl!.textContent = q.attribution;
    cellEl!.textContent = q.label;
    if (settleIn && !reduceMotion) {
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          for (const tk of quoteEl!.querySelectorAll('.tk')) tk.classList.remove('scatter');
        })
      );
    }
  }

  function render(animate: boolean): void {
    const q = current();
    if (!animate || reduceMotion) {
      setQuote(q, false);
      return;
    }
    flickerNet();
    // phase 1: scatter the tokens currently in the box
    for (const tk of quoteEl!.querySelectorAll<HTMLElement>('.tk')) {
      scatterVars(tk);
      tk.classList.add('scatter');
    }
    // phase 2: swap in the new quote, scattered, and let it settle
    setTimeout(() => setQuote(q, true), SCATTER_MS);
  }

  for (const input of [topicIn, eraIn, heatIn]) {
    input.addEventListener('input', () => render(true));
  }

  shakeBtn.addEventListener('click', () => {
    topicIn!.value = String(Math.floor(Math.random() * TOPIC_LABELS.length));
    eraIn!.value = String(Math.floor(Math.random() * ERA_LABELS.length));
    heatIn!.value = String(Math.floor(Math.random() * HEAT_LABELS.length));
    render(true);
  });

  render(false);
}
