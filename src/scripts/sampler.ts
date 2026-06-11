/* The Sampler — a one-sentence language model you can mess with.
   A temperature slider re-samples the slotted words of a sentence:
   0 = greedy (always the most likely words), 2 = chaos. Clicking a
   sampled word rerolls just that slot. */

interface Candidate {
  text: string;
  logit: number;
}

type Part = string | Candidate[];

// logits are hand-tuned: sensible words on top, nonsense in the tail
const PARTS: Part[] = [
  'I ',
  [
    { text: 'train', logit: 3.0 },
    { text: 'post-train', logit: 2.4 },
    { text: 'align', logit: 1.9 },
    { text: 'debug', logit: 1.2 },
    { text: 'bribe', logit: 0.5 },
    { text: 'whisper to', logit: 0.35 },
    { text: 'summon', logit: 0.2 },
  ],
  ' ',
  [
    { text: 'multimodal', logit: 3.0 },
    { text: 'audio', logit: 2.6 },
    { text: 'omnimodal', logit: 2.0 },
    { text: 'reasoning', logit: 1.4 },
    { text: 'enormous', logit: 0.6 },
    { text: 'clairvoyant', logit: 0.35 },
    { text: 'sentient', logit: 0.2 },
  ],
  ' models that ',
  [
    { text: 'listen', logit: 3.0 },
    { text: 'reason', logit: 2.4 },
    { text: 'transcribe Singlish', logit: 1.3 },
    { text: 'hear sarcasm', logit: 0.8 },
    { text: 'dream in spectrograms', logit: 0.5 },
    { text: 'bend it like Messi', logit: 0.18 },
    { text: 'play mid lane for T1', logit: 0.15 },
  ],
  [
    { text: '.', logit: 3.0 },
    { text: ' — carefully.', logit: 1.6 },
    { text: ' (mostly).', logit: 0.9 },
    { text: ' at 3 a.m.', logit: 0.5 },
    { text: ', allegedly.', logit: 0.3 },
  ],
];

const GREEDY_CUTOFF = 0.05;

function softmax(logits: number[], temp: number): number[] {
  const scaled = logits.map((l) => l / temp);
  const max = Math.max(...scaled);
  const exps = scaled.map((s) => Math.exp(s - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

/** Returns [chosen index, probability of that choice]. */
function sample(candidates: Candidate[], temp: number): [number, number] {
  const logits = candidates.map((c) => c.logit);
  if (temp < GREEDY_CUTOFF) {
    const best = logits.indexOf(Math.max(...logits));
    return [best, 1];
  }
  const probs = softmax(logits, temp);
  let r = Math.random();
  for (let i = 0; i < probs.length; i++) {
    r -= probs[i]!;
    if (r <= 0) return [i, probs[i]!];
  }
  return [probs.length - 1, probs[probs.length - 1]!];
}

export function mountSampler(root: HTMLElement): void {
  const sentenceEl = root.querySelector<HTMLElement>('[data-sentence]');
  const slider = root.querySelector<HTMLInputElement>('[data-temp]');
  const tempOut = root.querySelector<HTMLElement>('[data-temp-out]');
  const probOut = root.querySelector<HTMLElement>('[data-prob-out]');
  const reroll = root.querySelector<HTMLButtonElement>('[data-reroll]');
  if (!sentenceEl || !slider || !tempOut || !probOut || !reroll) return;

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const slotButtons: HTMLButtonElement[] = [];
  const slotProbs: number[] = [];
  const slotParts: Candidate[][] = [];

  // build the sentence DOM once: fixed text as spans, slots as buttons
  sentenceEl.textContent = '';
  for (const part of PARTS) {
    if (typeof part === 'string') {
      sentenceEl.append(document.createTextNode(part));
    } else {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tok';
      const slotIndex = slotParts.length;
      btn.addEventListener('click', () => {
        resampleSlot(slotIndex, true);
        updateReadouts();
      });
      slotParts.push(part);
      slotProbs.push(1);
      slotButtons.push(btn);
      sentenceEl.append(btn);
    }
  }

  function temperature(): number {
    return Number(slider!.value);
  }

  function resampleSlot(i: number, flash: boolean): void {
    const candidates = slotParts[i]!;
    const btn = slotButtons[i]!;
    const [choice, p] = sample(candidates, temperature());
    btn.textContent = candidates[choice]!.text;
    btn.title = `p ≈ ${p.toFixed(2)} — click to resample`;
    slotProbs[i] = p;
    if (flash && !reduceMotion) {
      btn.classList.remove('flash');
      void btn.offsetWidth; // restart the animation
      btn.classList.add('flash');
    }
  }

  function updateReadouts(): void {
    const t = temperature();
    tempOut!.textContent = t.toFixed(2);
    tempOut!.dataset.zone = t < 0.45 ? 'cold' : t < 1.2 ? 'warm' : 'hot';
    const joint = slotProbs.reduce((a, b) => a * b, 1);
    probOut!.textContent =
      joint >= 0.01 ? joint.toFixed(2) : joint.toExponential(1);
  }

  function resampleAll(flash: boolean): void {
    for (let i = 0; i < slotParts.length; i++) resampleSlot(i, flash);
    updateReadouts();
  }

  slider.addEventListener('input', () => resampleAll(!reduceMotion));
  reroll.addEventListener('click', () => resampleAll(true));

  resampleAll(false);
}
