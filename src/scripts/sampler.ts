/* The Sampler — a tiny language model over a corpus of famous AI quotes.
   Sampling happens at two levels: first WHICH quote (weighted by fame),
   then the slotted words inside it (greedy choice = the verbatim original,
   tail choices = corruptions). temperature / top_k / top_p shape both.
   At temperature 0 you always get the most famous quote, quoted exactly.
   Clicking a sampled word rerolls just that slot.

   Every quote was verified against a primary or near-primary source
   (arXiv, journal of record, author homepages, Quote Investigator). */

interface Candidate {
  text: string;
  logit: number;
}

type Part = string | Candidate[];

interface Quote {
  logit: number; // fame — greedy decoding picks the highest
  attribution: string;
  parts: Part[];
}

const QUOTES: Quote[] = [
  {
    logit: 3.0,
    attribution: '— Vaswani et al., 2017',
    parts: [
      [
        { text: 'Attention', logit: 3.0 },
        { text: 'Affection', logit: 0.5 },
        { text: 'Caffeine', logit: 0.45 },
        { text: 'A bigger GPU', logit: 0.4 },
      ],
      ' is all you ',
      [
        { text: 'need', logit: 3.0 },
        { text: 'want', logit: 1.4 },
        { text: 'can afford', logit: 0.6 },
        { text: 'deserve', logit: 0.4 },
        { text: 'were promised', logit: 0.3 },
      ],
      '.',
    ],
  },
  {
    logit: 2.8,
    attribution: '— Alan Turing, 1950',
    parts: [
      "I propose to consider the question, ‘Can machines ",
      [
        { text: 'think', logit: 3.0 },
        { text: 'feel', logit: 1.0 },
        { text: 'dream', logit: 0.7 },
        { text: 'do my taxes', logit: 0.35 },
        { text: 'apologize', logit: 0.3 },
      ],
      '?’',
    ],
  },
  {
    logit: 2.6,
    attribution: '— Rich Sutton, “The Bitter Lesson”, 2019',
    parts: [
      '…general methods that leverage ',
      [
        { text: 'computation', logit: 3.0 },
        { text: 'scale', logit: 1.6 },
        { text: 'GPUs', logit: 0.9 },
        { text: 'vibes', logit: 0.45 },
        { text: 'grad students', logit: 0.35 },
      ],
      ' are ultimately the most ',
      [
        { text: 'effective', logit: 3.0 },
        { text: 'expensive', logit: 1.0 },
        { text: 'popular', logit: 0.6 },
        { text: 'confusing', logit: 0.35 },
      ],
      ', and by a large margin.',
    ],
  },
  {
    logit: 2.5,
    attribution: '— George E. P. Box, 1987',
    parts: [
      'Essentially, all models are ',
      [
        { text: 'wrong', logit: 3.0 },
        { text: 'large', logit: 0.8 },
        { text: 'hallucinating', logit: 0.7 },
        { text: 'hungry', logit: 0.5 },
      ],
      ', but some are ',
      [
        { text: 'useful', logit: 3.0 },
        { text: 'expensive', logit: 0.9 },
        { text: 'on Hugging Face', logit: 0.5 },
        { text: 'cute', logit: 0.35 },
      ],
      '.',
    ],
  },
  {
    logit: 2.4,
    attribution: '— Brown et al., 2020',
    parts: [
      'Language models are ',
      [
        { text: 'few-shot', logit: 3.0 },
        { text: 'zero-shot', logit: 1.6 },
        { text: 'overconfident', logit: 0.6 },
        { text: 'surprisingly polite', logit: 0.4 },
      ],
      ' ',
      [
        { text: 'learners', logit: 3.0 },
        { text: 'guessers', logit: 0.8 },
        { text: 'interns', logit: 0.5 },
        { text: 'gamblers', logit: 0.4 },
      ],
      '.',
    ],
  },
  {
    logit: 2.3,
    attribution: '— Andrej Karpathy, tweet, 2023',
    parts: [
      'The ',
      [
        { text: 'hottest', logit: 3.0 },
        { text: 'oldest', logit: 0.7 },
        { text: 'most cursed', logit: 0.5 },
      ],
      ' new programming language is ',
      [
        { text: 'English', logit: 3.0 },
        { text: 'Python', logit: 1.4 },
        { text: 'Vietnamese', logit: 0.5 },
        { text: 'YAML', logit: 0.35 },
      ],
    ],
  },
  {
    logit: 2.2,
    attribution: '— Andrew Ng, 2017',
    parts: [
      [
        { text: 'AI', logit: 3.0 },
        { text: 'Compute', logit: 1.0 },
        { text: 'Attention', logit: 0.7 },
        { text: 'Hype', logit: 0.6 },
      ],
      ' is the new ',
      [
        { text: 'electricity', logit: 3.0 },
        { text: 'internet', logit: 1.0 },
        { text: 'fire', logit: 0.8 },
        { text: 'caffeine', logit: 0.5 },
        { text: 'homework', logit: 0.3 },
      ],
      '.',
    ],
  },
  {
    logit: 2.2,
    attribution: '— Ilya Sutskever, tweet, 2022',
    parts: [
      'it may be that today’s large neural networks are ',
      [
        { text: 'slightly', logit: 3.0 },
        { text: 'occasionally', logit: 0.7 },
        { text: 'extremely', logit: 0.6 },
        { text: 'legally', logit: 0.4 },
      ],
      ' ',
      [
        { text: 'conscious', logit: 3.0 },
        { text: 'confused', logit: 1.0 },
        { text: 'caffeinated', logit: 0.5 },
        { text: 'dramatic', logit: 0.4 },
      ],
    ],
  },
  {
    logit: 2.1,
    attribution: '— Dosovitskiy et al., 2020',
    parts: [
      'An image is worth ',
      [
        { text: '16x16', logit: 3.0 },
        { text: 'a thousand', logit: 1.2 },
        { text: '32x32', logit: 0.7 },
        { text: 'about seven', logit: 0.4 },
      ],
      ' ',
      [
        { text: 'words', logit: 3.0 },
        { text: 'patches', logit: 1.0 },
        { text: 'tokens', logit: 0.9 },
        { text: 'emojis', logit: 0.4 },
      ],
      '.',
    ],
  },
  {
    logit: 2.0,
    attribution: '— Arthur C. Clarke, 1973',
    parts: [
      'Any sufficiently ',
      [
        { text: 'advanced', logit: 3.0 },
        { text: 'hyped', logit: 0.7 },
        { text: 'fine-tuned', logit: 0.6 },
      ],
      ' technology is indistinguishable from ',
      [
        { text: 'magic', logit: 3.0 },
        { text: 'matrix multiplication', logit: 1.0 },
        { text: 'marketing', logit: 0.7 },
        { text: 'luck', logit: 0.5 },
      ],
      '.',
    ],
  },
  {
    logit: 2.0,
    attribution: '— Alan Kay, 1971',
    parts: [
      'The best way to ',
      [
        { text: 'predict', logit: 3.0 },
        { text: 'pretrain', logit: 0.7 },
        { text: 'benchmark', logit: 0.5 },
      ],
      ' the future is to ',
      [
        { text: 'invent', logit: 3.0 },
        { text: 'open-source', logit: 0.9 },
        { text: 'fine-tune', logit: 0.7 },
        { text: 'regularize', logit: 0.4 },
      ],
      ' it.',
    ],
  },
  {
    logit: 1.9,
    attribution: '— Geoffrey Hinton, 2017',
    parts: [
      'The future depends on some ',
      [
        { text: 'graduate student', logit: 3.0 },
        { text: 'undergrad', logit: 0.9 },
        { text: 'postdoc', logit: 0.6 },
        { text: 'chatbot', logit: 0.4 },
      ],
      ' who is deeply ',
      [
        { text: 'suspicious', logit: 3.0 },
        { text: 'tired', logit: 0.7 },
        { text: 'caffeinated', logit: 0.5 },
        { text: 'jealous', logit: 0.4 },
      ],
      ' of everything I have said.',
    ],
  },
  {
    logit: 1.9,
    attribution: '— Demis Hassabis, 2016',
    parts: [
      'Step one, solve ',
      [
        { text: 'intelligence', logit: 3.0 },
        { text: 'protein folding', logit: 0.9 },
        { text: 'Go', logit: 0.8 },
        { text: 'parking', logit: 0.35 },
      ],
      '. Step two, use it to solve ',
      [
        { text: 'everything else', logit: 3.0 },
        { text: 'climate change', logit: 0.8 },
        { text: 'the dishes', logit: 0.5 },
        { text: 'my inbox', logit: 0.4 },
      ],
      '.',
    ],
  },
  {
    logit: 1.9,
    attribution: '— Edsger W. Dijkstra, 1984',
    parts: [
      'The question of whether Machines Can ',
      [
        { text: 'Think', logit: 3.0 },
        { text: 'Feel', logit: 0.8 },
        { text: 'Dream', logit: 0.6 },
        { text: 'File Taxes', logit: 0.3 },
      ],
      '… is about as relevant as the question of whether Submarines Can ',
      [
        { text: 'Swim', logit: 3.0 },
        { text: 'Think', logit: 0.7 },
        { text: 'Vibe', logit: 0.5 },
        { text: 'Dance', logit: 0.4 },
      ],
      '.',
    ],
  },
  {
    logit: 1.8,
    attribution: '— Alan Turing, 1950',
    parts: [
      'We can only see a ',
      [
        { text: 'short distance', logit: 3.0 },
        { text: 'few tokens', logit: 0.8 },
        { text: 'single epoch', logit: 0.6 },
        { text: 'coffee break', logit: 0.4 },
      ],
      ' ahead, but we can see plenty there that needs to be ',
      [
        { text: 'done', logit: 3.0 },
        { text: 'published', logit: 0.9 },
        { text: 'cited', logit: 0.6 },
        { text: 'ablated', logit: 0.4 },
      ],
      '.',
    ],
  },
  {
    logit: 1.8,
    attribution: '— Herbert A. Simon, 1971',
    parts: [
      'A wealth of ',
      [
        { text: 'information', logit: 3.0 },
        { text: 'tokens', logit: 0.8 },
        { text: 'parameters', logit: 0.7 },
        { text: 'browser tabs', logit: 0.5 },
      ],
      ' creates a poverty of ',
      [
        { text: 'attention', logit: 3.0 },
        { text: 'sleep', logit: 0.7 },
        { text: 'GPUs', logit: 0.6 },
        { text: 'attention heads', logit: 0.5 },
      ],
      '.',
    ],
  },
  {
    logit: 1.8,
    attribution: '— Noam Shazeer, “GLU Variants”, 2020',
    parts: [
      'We offer no explanation as to why these architectures seem to ',
      [
        { text: 'work', logit: 3.0 },
        { text: 'converge', logit: 1.0 },
        { text: 'vibe', logit: 0.5 },
      ],
      '; we attribute their success, as all else, to ',
      [
        { text: 'divine benevolence', logit: 3.0 },
        { text: 'the learning rate', logit: 1.0 },
        { text: 'good vibes', logit: 0.7 },
        { text: 'reviewer 2', logit: 0.4 },
      ],
      '.',
    ],
  },
  {
    logit: 1.8,
    attribution: '— Richard Hamming, 1962',
    parts: [
      'The purpose of computing is ',
      [
        { text: 'insight', logit: 3.0 },
        { text: 'citations', logit: 0.7 },
        { text: 'leaderboards', logit: 0.6 },
        { text: 'vibes', logit: 0.5 },
      ],
      ', not ',
      [
        { text: 'numbers', logit: 3.0 },
        { text: 'benchmarks', logit: 0.9 },
        { text: 'blog posts', logit: 0.4 },
      ],
      '.',
    ],
  },
  {
    logit: 1.7,
    attribution: '— Donald Knuth, 1977',
    parts: [
      'Beware of ',
      [
        { text: 'bugs', logit: 3.0 },
        { text: 'NaNs', logit: 0.9 },
        { text: 'off-by-ones', logit: 0.7 },
        { text: 'demons', logit: 0.4 },
      ],
      ' in the above code; I have only ',
      [
        { text: 'proved', logit: 3.0 },
        { text: 'dreamed', logit: 0.5 },
        { text: 'tweeted', logit: 0.4 },
      ],
      ' it correct, not tried it.',
    ],
  },
  {
    logit: 1.7,
    attribution: '— attributed to Frederick Jelinek, c. 1988',
    parts: [
      'Every time I fire a ',
      [
        { text: 'linguist', logit: 3.0 },
        { text: 'hyperparameter', logit: 0.6 },
        { text: 'consultant', logit: 0.5 },
        { text: 'vowel', logit: 0.3 },
      ],
      ', the performance of the speech recognizer goes ',
      [
        { text: 'up', logit: 3.0 },
        { text: 'down', logit: 0.7 },
        { text: 'sideways', logit: 0.4 },
        { text: 'to therapy', logit: 0.3 },
      ],
      '.',
    ],
  },
  {
    logit: 1.7,
    attribution: '— Wei et al., 2022',
    parts: [
      'Chain-of-thought prompting elicits ',
      [
        { text: 'reasoning', logit: 3.0 },
        { text: 'overthinking', logit: 0.8 },
        { text: 'rambling', logit: 0.6 },
        { text: 'anxiety', logit: 0.4 },
      ],
      ' in large ',
      [
        { text: 'language models', logit: 3.0 },
        { text: 'group chats', logit: 0.5 },
        { text: 'lecture halls', logit: 0.4 },
      ],
      '.',
    ],
  },
  {
    logit: 1.6,
    attribution: '— Grace Hopper, 1987',
    parts: [
      'The most ',
      [
        { text: 'damaging', logit: 3.0 },
        { text: 'expensive', logit: 0.7 },
        { text: 'deprecated', logit: 0.5 },
      ],
      ' phrase in the language is ‘We’ve always done it ',
      [
        { text: 'this way', logit: 3.0 },
        { text: 'in PyTorch', logit: 0.6 },
        { text: 'on main', logit: 0.5 },
        { text: 'in Excel', logit: 0.4 },
      ],
      '!’',
    ],
  },
  {
    logit: 1.6,
    attribution: '— Andrychowicz et al., 2016',
    parts: [
      'Learning to learn by gradient descent by ',
      [
        { text: 'gradient descent', logit: 3.0 },
        { text: 'more gradient descent', logit: 0.9 },
        { text: 'trial and error', logit: 0.7 },
        { text: 'sheer luck', logit: 0.5 },
      ],
      '.',
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

function sample(logitsIn: number[], { temp, topK, topP }: Params): Pick {
  const order = logitsIn.map((_, i) => i).sort((a, b) => logitsIn[b]! - logitsIn[a]!);
  if (temp < GREEDY_CUTOFF || topK <= 1) {
    return { idx: order[0]!, p: 1, rank: 0 };
  }

  const probs = softmax(logitsIn.map((l) => l / temp));

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

function quipFor(slotRanks: number[]): string {
  const deepest = Math.max(...slotRanks, 0);
  if (deepest === 0) return '// verbatim. citation intact.';
  if (deepest <= 1) return '// close enough for a keynote slide.';
  if (deepest <= 2) return '// paraphrased. handle with care.';
  return '// fabricated. do not cite.';
}

export function mountSampler(root: HTMLElement): void {
  const sentenceEl = root.querySelector<HTMLElement>('[data-sentence]');
  const attrEl = root.querySelector<HTMLElement>('[data-attr]');
  const quipEl = root.querySelector<HTMLElement>('[data-quip]');
  const probOut = root.querySelector<HTMLElement>('[data-prob-out]');
  const reroll = root.querySelector<HTMLButtonElement>('[data-reroll]');
  const tempIn = root.querySelector<HTMLInputElement>('[data-temp]');
  const topkIn = root.querySelector<HTMLInputElement>('[data-topk]');
  const toppIn = root.querySelector<HTMLInputElement>('[data-topp]');
  const tempOut = root.querySelector<HTMLElement>('[data-temp-out]');
  const topkOut = root.querySelector<HTMLElement>('[data-topk-out]');
  const toppOut = root.querySelector<HTMLElement>('[data-topp-out]');
  if (
    !sentenceEl || !attrEl || !quipEl || !probOut || !reroll ||
    !tempIn || !topkIn || !toppIn || !tempOut || !topkOut || !toppOut
  ) {
    return;
  }

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let quote = QUOTES[0]!;
  let quoteProb = 1;
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
    for (const part of quote.parts) {
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
    attrEl!.textContent = quote.attribution;
  }

  function resampleSlot(i: number, flash: boolean): void {
    const candidates = slotParts[i]!;
    const btn = slotButtons[i]!;
    const pick = sample(candidates.map((c) => c.logit), params());
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
    const joint = quoteProb * slotProbs.reduce((a, b) => a * b, 1);
    probOut!.textContent =
      joint >= 0.01 ? joint.toFixed(2) : joint.toExponential(1);
    quipEl!.textContent = quipFor(slotRanks);
  }

  // full resample: pick a quote from the corpus, then sample its slots
  function resampleAll(flash: boolean): void {
    const pick = sample(QUOTES.map((q) => q.logit), params());
    quote = QUOTES[pick.idx]!;
    quoteProb = pick.p;
    build();
    for (let i = 0; i < slotParts.length; i++) resampleSlot(i, flash);
    updateReadouts();
  }

  for (const input of [tempIn, topkIn, toppIn]) {
    input.addEventListener('input', () => resampleAll(!reduceMotion));
  }
  reroll.addEventListener('click', () => resampleAll(true));

  resampleAll(false);
}
