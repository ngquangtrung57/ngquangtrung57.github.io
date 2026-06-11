/* The Sampler — a one-sentence language model you can mess with.
   Pick a prompt (research, football, RL, PhD, esports), then turn the
   knobs: temperature (0 = greedy, 2 = chaos), top_k, and top_p all
   reshape how the slotted words get sampled. Clicking a sampled word
   rerolls just that slot. */

interface Candidate {
  text: string;
  logit: number;
}

type Part = string | Candidate[];

interface Prompt {
  id: string;
  label: string;
  parts: Part[];
}

// logits are hand-tuned: the truth on top, nonsense in the tail
export const PROMPTS: Prompt[] = [
  {
    id: 'research',
    label: 'research',
    parts: [
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
        { text: 'fear silence', logit: 0.25 },
        { text: 'gossip about gradients', logit: 0.2 },
      ],
      [
        { text: '.', logit: 3.0 },
        { text: ' — carefully.', logit: 1.6 },
        { text: ' (mostly).', logit: 0.9 },
        { text: ' at 3 a.m.', logit: 0.5 },
        { text: ', allegedly.', logit: 0.3 },
      ],
    ],
  },
  {
    id: 'football',
    label: 'football',
    parts: [
      'Messi is ',
      [
        { text: 'the greatest of all time', logit: 3.0 },
        { text: 'football, condensed', logit: 1.6 },
        { text: 'simply inevitable', logit: 1.4 },
        { text: 'from another planet', logit: 0.9 },
        { text: 'a patch the game never fixed', logit: 0.4 },
        { text: 'my entire personality', logit: 0.3 },
      ],
      ', and Barça ',
      [
        { text: 'is més que un club', logit: 3.0 },
        { text: 'will win it all again', logit: 2.0 },
        { text: 'lives rent-free in my head', logit: 1.0 },
        { text: 'should honestly sign me', logit: 0.3 },
        { text: 'owes me emotional damages', logit: 0.25 },
      ],
      [
        { text: '.', logit: 3.0 },
        { text: ' — visca el Barça.', logit: 1.6 },
        { text: ' (objectively).', logit: 0.9 },
        { text: ', fight me.', logit: 0.4 },
        { text: ' ⚽', logit: 0.3 },
      ],
    ],
  },
  {
    id: 'rl',
    label: 'rl',
    parts: [
      "I'm learning RL, where ",
      [
        { text: 'the agent', logit: 3.0 },
        { text: 'the policy', logit: 2.2 },
        { text: 'my model', logit: 1.8 },
        { text: 'I, personally,', logit: 0.5 },
        { text: 'my sleep schedule', logit: 0.35 },
      ],
      ' ',
      [
        { text: 'maximizes', logit: 3.0 },
        { text: 'explores for', logit: 1.8 },
        { text: 'exploits', logit: 1.5 },
        { text: 'gambles on', logit: 0.6 },
        { text: 'hallucinates', logit: 0.35 },
      ],
      ' ',
      [
        { text: 'expected reward', logit: 3.0 },
        { text: 'long-term return', logit: 2.2 },
        { text: 'sparse signals', logit: 1.3 },
        { text: 'pure vibes', logit: 0.5 },
        { text: 'my GPU quota', logit: 0.35 },
      ],
      [
        { text: '.', logit: 3.0 },
        { text: ' — value functions pending.', logit: 1.2 },
        { text: ' (mostly reward hacking).', logit: 0.7 },
        { text: ', discounted, of course.', logit: 0.5 },
      ],
    ],
  },
  {
    id: 'phd',
    label: 'phd',
    parts: [
      'I want to ',
      [
        { text: 'pursue', logit: 3.0 },
        { text: 'start', logit: 2.2 },
        { text: 'survive', logit: 1.2 },
        { text: 'speedrun', logit: 0.5 },
        { text: 'romanticize', logit: 0.35 },
      ],
      ' a PhD in ',
      [
        { text: 'multimodal learning', logit: 3.0 },
        { text: 'audio-language models', logit: 2.4 },
        { text: 'RL for reasoning', logit: 1.8 },
        { text: 'whatever the GPUs allow', logit: 0.6 },
        { text: 'professional deadline panic', logit: 0.3 },
      ],
      [
        { text: '.', logit: 3.0 },
        { text: ' — applications loading…', logit: 1.4 },
        { text: ' (advisors, hi).', logit: 0.7 },
        { text: ', reviewer 2 willing.', logit: 0.5 },
      ],
    ],
  },
  {
    id: 'lol',
    label: 'lol',
    parts: [
      'Meanwhile, T1 ',
      [
        { text: 'will win Worlds again', logit: 3.0 },
        { text: 'is the greatest dynasty in esports', logit: 2.2 },
        { text: 'keeps me up at 2 a.m.', logit: 1.2 },
        { text: 'is my second research lab', logit: 0.5 },
      ],
      ', because Faker ',
      [
        { text: 'is the unkillable demon king', logit: 3.0 },
        { text: 'simply refuses to lose', logit: 1.8 },
        { text: 'never ages', logit: 1.2 },
        { text: 'has more titles than my repo has stars', logit: 0.5 },
      ],
      [
        { text: '.', logit: 3.0 },
        { text: ' — GG WP.', logit: 1.5 },
        { text: ' (what was that!)', logit: 0.6 },
        { text: ', /ff at 15? never.', logit: 0.4 },
      ],
    ],
  },
];

const GREEDY_CUTOFF = 0.05;

interface Params {
  temp: number;
  topK: number;
  topP: number;
}

interface Pick {
  idx: number;
  p: number; // probability after top-k/top-p renormalization
  rank: number; // 0 = the greedy choice
}

function softmax(logits: number[]): number[] {
  const max = Math.max(...logits);
  const exps = logits.map((l) => Math.exp(l - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

function sample(candidates: Candidate[], { temp, topK, topP }: Params): Pick {
  const order = candidates
    .map((_, i) => i)
    .sort((a, b) => candidates[b]!.logit - candidates[a]!.logit);
  if (temp < GREEDY_CUTOFF || topK <= 1) {
    return { idx: order[0]!, p: 1, rank: 0 };
  }

  const probs = softmax(candidates.map((c) => c.logit / temp));

  // top-k, then nucleus: keep tokens until cumulative prob crosses top_p
  const kept: number[] = [];
  let cum = 0;
  for (let r = 0; r < Math.min(topK, order.length); r++) {
    kept.push(order[r]!);
    cum += probs[order[r]!]!;
    if (cum >= topP) break;
  }

  const total = kept.reduce((s, i) => s + probs[i]!, 0);
  let roll = Math.random() * total;
  for (let rank = 0; rank < kept.length; rank++) {
    roll -= probs[kept[rank]!]!;
    if (roll <= 0) {
      return { idx: kept[rank]!, p: probs[kept[rank]!]! / total, rank };
    }
  }
  const last = kept.length - 1;
  return { idx: kept[last]!, p: probs[kept[last]!]! / total, rank: last };
}

function quipFor(ranks: number[]): string {
  const deepest = Math.max(...ranks);
  if (deepest === 0) return '// greedy decoding. safe. a little boring.';
  if (deepest <= 1) return '// coherent. would ship.';
  if (deepest <= 3) return '// plausible. citation needed.';
  return '// the alignment team has been notified.';
}

export function mountSampler(root: HTMLElement): void {
  const sentenceEl = root.querySelector<HTMLElement>('[data-sentence]');
  const quipEl = root.querySelector<HTMLElement>('[data-quip]');
  const promptOut = root.querySelector<HTMLElement>('[data-prompt-out]');
  const probOut = root.querySelector<HTMLElement>('[data-prob-out]');
  const reroll = root.querySelector<HTMLButtonElement>('[data-reroll]');
  const tempIn = root.querySelector<HTMLInputElement>('[data-temp]');
  const topkIn = root.querySelector<HTMLInputElement>('[data-topk]');
  const toppIn = root.querySelector<HTMLInputElement>('[data-topp]');
  const tempOut = root.querySelector<HTMLElement>('[data-temp-out]');
  const topkOut = root.querySelector<HTMLElement>('[data-topk-out]');
  const toppOut = root.querySelector<HTMLElement>('[data-topp-out]');
  const promptBtns = [...root.querySelectorAll<HTMLButtonElement>('[data-prompt]')];
  if (
    !sentenceEl || !quipEl || !promptOut || !probOut || !reroll ||
    !tempIn || !topkIn || !toppIn || !tempOut || !topkOut || !toppOut
  ) {
    return;
  }

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let prompt = PROMPTS[0]!;
  let slotButtons: HTMLButtonElement[] = [];
  let slotParts: Candidate[][] = [];
  let slotProbs: number[] = [];
  let slotRanks: number[] = [];

  function params(): Params {
    return {
      temp: Number(tempIn!.value),
      topK: Number(topkIn!.value),
      topP: Number(toppIn!.value),
    };
  }

  // rebuild the sentence DOM: fixed text as nodes, slots as buttons
  function build(): void {
    sentenceEl!.textContent = '';
    slotButtons = [];
    slotParts = [];
    slotProbs = [];
    slotRanks = [];
    for (const part of prompt.parts) {
      if (typeof part === 'string') {
        sentenceEl!.append(document.createTextNode(part));
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
        slotRanks.push(0);
        slotButtons.push(btn);
        sentenceEl!.append(btn);
      }
    }
  }

  function resampleSlot(i: number, flash: boolean): void {
    const candidates = slotParts[i]!;
    const btn = slotButtons[i]!;
    const pick = sample(candidates, params());
    btn.textContent = candidates[pick.idx]!.text;
    btn.title = `p ≈ ${pick.p.toFixed(2)} — click to resample`;
    slotProbs[i] = pick.p;
    slotRanks[i] = pick.rank;
    if (flash && !reduceMotion) {
      btn.classList.remove('flash');
      void btn.offsetWidth; // restart the animation
      btn.classList.add('flash');
    }
  }

  function updateReadouts(): void {
    const { temp, topK, topP } = params();
    tempOut!.textContent = temp.toFixed(2);
    tempOut!.dataset.zone = temp < 0.45 ? 'cold' : temp < 1.2 ? 'warm' : 'hot';
    topkOut!.textContent = String(topK);
    toppOut!.textContent = topP.toFixed(2);
    const joint = slotProbs.reduce((a, b) => a * b, 1);
    probOut!.textContent =
      joint >= 0.01 ? joint.toFixed(2) : joint.toExponential(1);
    quipEl!.textContent = quipFor(slotRanks);
  }

  function resampleAll(flash: boolean): void {
    for (let i = 0; i < slotParts.length; i++) resampleSlot(i, flash);
    updateReadouts();
  }

  for (const input of [tempIn, topkIn, toppIn]) {
    input.addEventListener('input', () => resampleAll(!reduceMotion));
  }
  reroll.addEventListener('click', () => resampleAll(true));

  for (const btn of promptBtns) {
    btn.addEventListener('click', () => {
      const next = PROMPTS.find((p) => p.id === btn.dataset.prompt);
      if (!next || next === prompt) return;
      prompt = next;
      promptOut!.textContent = next.label;
      for (const b of promptBtns) {
        b.setAttribute('aria-pressed', String(b === btn));
      }
      build();
      resampleAll(!reduceMotion);
    });
  }

  build();
  resampleAll(false);
}
