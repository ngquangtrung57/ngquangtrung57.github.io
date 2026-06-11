/* The QuoteBox — a "model" full of famous AI quotes.
   Three knobs index an expert × layer × heat grid; every combination maps to
   its own verified quote. Turning a knob shakes the box snow-globe style:
   the old words tumble out, the new quote drops in and settles. */

import { CORPUS, TOPIC_LABELS, ERA_LABELS, HEAT_LABELS } from '../data/quotes';

const LIFT_MS = 260;

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function mountQuoteBox(root: HTMLElement): void {
  const quoteEl = root.querySelector<HTMLElement>('[data-quote]');
  const attrEl = root.querySelector<HTMLElement>('[data-attr]');
  const cellEl = root.querySelector<HTMLElement>('[data-cell]');
  const shakeBtn = root.querySelector<HTMLButtonElement>('[data-shake]');
  const expertIn = root.querySelector<HTMLInputElement>('[data-expert]');
  const layerIn = root.querySelector<HTMLInputElement>('[data-layer]');
  const heatIn = root.querySelector<HTMLInputElement>('[data-heat]');
  const expertOut = root.querySelector<HTMLElement>('[data-expert-out]');
  const layerOut = root.querySelector<HTMLElement>('[data-layer-out]');
  const heatOut = root.querySelector<HTMLElement>('[data-heat-out]');
  if (!quoteEl || !attrEl || !cellEl || !shakeBtn || !expertIn || !layerIn || !heatIn) return;

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // phase 1: the old words tumble up and away
  function liftVars(el: HTMLElement): void {
    el.style.setProperty('--lx', `${rand(-55, 55).toFixed(1)}px`);
    el.style.setProperty('--ly', `${rand(-60, 20).toFixed(1)}px`);
    el.style.setProperty('--lr', `${rand(-35, 35).toFixed(1)}deg`);
  }

  // phase 2: the new words drop in from random offsets above
  function dropVars(el: HTMLElement): void {
    el.style.setProperty('--sx', `${rand(-60, 60).toFixed(1)}px`);
    el.style.setProperty('--sy', `${rand(-70, -20).toFixed(1)}px`);
    el.style.setProperty('--sr', `${rand(-30, 30).toFixed(1)}deg`);
    el.style.animationDelay = `${rand(0, 140).toFixed(0)}ms`;
  }

  function current(): { text: string; attribution: string; label: string } {
    const t = Number(expertIn!.value);
    const e = Number(layerIn!.value);
    const h = Number(heatIn!.value);
    if (expertOut) expertOut.textContent = `E${t}`;
    if (layerOut) layerOut.textContent = `L${e}`;
    if (heatOut) heatOut.textContent = HEAT_LABELS[h]!;
    const q = CORPUS[t]![e]![h]!;
    return {
      text: q.text,
      attribution: q.attribution,
      label: `// ${TOPIC_LABELS[t]} × ${ERA_LABELS[e]} × ${HEAT_LABELS[h]}`,
    };
  }

  // build word spans; when dropIn, they tumble down into place
  function setQuote(q: { text: string; attribution: string; label: string }, dropIn: boolean): void {
    quoteEl!.textContent = '';
    for (const word of q.text.split(' ')) {
      const tk = document.createElement('span');
      tk.className = 'tk';
      tk.textContent = word;
      if (dropIn && !reduceMotion) {
        dropVars(tk);
        tk.classList.add('drop');
      }
      quoteEl!.append(tk);
      quoteEl!.append(document.createTextNode(' '));
    }
    attrEl!.textContent = q.attribution;
    cellEl!.textContent = q.label;
  }

  function render(animate: boolean): void {
    const q = current();
    if (!animate || reduceMotion) {
      setQuote(q, false);
      return;
    }
    // phase 1: lift the words currently in the box
    for (const tk of quoteEl!.querySelectorAll<HTMLElement>('.tk')) {
      liftVars(tk);
      tk.classList.add('lift');
    }
    // phase 2: swap in the new quote and let it settle
    setTimeout(() => setQuote(q, true), LIFT_MS);
  }

  for (const input of [expertIn, layerIn, heatIn]) {
    input.addEventListener('input', () => render(true));
  }

  shakeBtn.addEventListener('click', () => {
    expertIn!.value = String(Math.floor(Math.random() * TOPIC_LABELS.length));
    layerIn!.value = String(Math.floor(Math.random() * ERA_LABELS.length));
    heatIn!.value = String(Math.floor(Math.random() * HEAT_LABELS.length));
    render(true);
  });

  render(false);
}
