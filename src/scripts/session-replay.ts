/* Session replay — a scripted Claude Code terminal that auto-plays three
   real sessions from building this site. Cancellable via playId; pauseable
   via a shared barrier promise. */

type Step =
  | { kind: 'msg'; text: string }
  | { kind: 'think'; ms: number }
  | { kind: 'tool'; verb: string; path: string; ms: number }
  | { kind: 'text'; text: string }
  | { kind: 'diff'; file: string; removed: string[]; added: string[] }
  | { kind: 'agents'; label: string; count: number; tags: string[]; ms: number }
  | { kind: 'done'; text: string }
  | { kind: 'gap'; ms: number }

interface Session {
  label: string
  steps: Step[]
}

const SESSIONS: Session[] = [
  {
    label: 'hero redesign',
    steps: [
      {
        kind: 'msg',
        text: 'The hero looks narrow now that the QuoteBox moved below it — widen it to fill the full column. Add a short description above the box too.',
      },
      { kind: 'think', ms: 1800 },
      { kind: 'tool', verb: 'Read', path: 'src/components/Hero.astro', ms: 380 },
      { kind: 'tool', verb: 'Read', path: 'src/styles/tokens.css', ms: 260 },
      {
        kind: 'text',
        text: "Hero column is capped at ~40rem — half the old two-column width. I'll expand it to --wide-width (64rem) so it fills the full measure, then add a short intro line above the QuoteBox.",
      },
      {
        kind: 'diff',
        file: 'src/components/Hero.astro',
        removed: ['  width: min(100% - 2.5rem, 40rem);'],
        added:   ['  width: min(100% - 2.5rem, var(--wide-width));'],
      },
      {
        kind: 'diff',
        file: 'src/components/Hero.astro',
        removed: [],
        added: [
          '<p class="term-intro">',
          '  A little toy I built — a box of 180 real AI quotes.',
          '  Three knobs, every combination opens a different one.',
          '</p>',
        ],
      },
      { kind: 'gap', ms: 300 },
      { kind: 'done', text: '2 files  ·  4 tool calls  ·  build clean ✓' },
    ],
  },
  {
    label: 'corpus harvest',
    steps: [
      {
        kind: 'msg',
        text: 'Fill the 6×5×6 quote grid with real AI research content — papers, blogs, X posts. RL, multimodal, scaling, alignment. ultracode, as many agents as needed.',
      },
      { kind: 'think', ms: 2600 },
      {
        kind: 'text',
        text: "Launching a 3-phase workflow: 30 finder agents (6 topics × 5 eras) in parallel → chunk-of-4 verifiers → 6 writer agents landing JSON to disk.",
      },
      {
        kind: 'agents',
        label: 'phase 1 · finders · 30 parallel',
        count: 30,
        tags: [],
        ms: 3400,
      },
      {
        kind: 'text',
        text: '257 raw candidates. Deduping on 48-char normalized key, then verifying 4 cells at a time...',
      },
      {
        kind: 'agents',
        label: 'phase 2 · verifiers · 76 agents',
        count: 76,
        tags: [],
        ms: 2200,
      },
      { kind: 'text', text: '3 thin cells under quota. Running gap-fill finders...' },
      {
        kind: 'agents',
        label: 'phase 3 · writers',
        count: 6,
        tags: ['llms.json', 'rl.json', 'multimodal.json', 'scaling.json', 'agents.json', 'alignment.json'],
        ms: 1600,
      },
      { kind: 'gap', ms: 400 },
      { kind: 'done', text: '136 agents  ·  257 verified quotes  →  180-quote grid ✓' },
    ],
  },
  {
    label: 'a11y · 8 fixes',
    steps: [
      { kind: 'msg', text: "Fix all 8 of these with subagents. Parallel where the files don't overlap." },
      { kind: 'think', ms: 1200 },
      {
        kind: 'text',
        text: 'Splitting 8 fixes across 3 agents by file ownership — no conflicts.',
      },
      {
        kind: 'agents',
        label: '3 agents · parallel',
        count: 3,
        tags: [
          'quotebox.ts · race + aria',
          'Header.astro · nav + icons',
          'index · profile · Footer',
        ],
        ms: 3800,
      },
      { kind: 'tool', verb: 'Build', path: 'npm run build', ms: 2400 },
      { kind: 'gap', ms: 280 },
      { kind: 'done', text: '6 files  ·  80 insertions  ·  build clean ✓' },
    ],
  },
]

// ── Animation state ──────────────────────────────────────────────────────────

let playId = 0
let paused = false
let _resumeSignal: () => void = () => {}
let _pauseBarrier: Promise<void> = Promise.resolve()

function setPaused(p: boolean) {
  paused = p
  if (!p) {
    _resumeSignal()
    _pauseBarrier = Promise.resolve()
  } else {
    _pauseBarrier = new Promise(r => {
      _resumeSignal = r
    })
  }
}

function makeSleep(id: number) {
  return async function sleep(ms: number): Promise<void> {
    if (paused) await _pauseBarrier
    if (playId !== id) throw new Error('cancelled')
    await new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (playId !== id) reject(new Error('cancelled'))
        else resolve()
      }, ms)
    })
  }
}

// ── DOM helpers ──────────────────────────────────────────────────────────────

function scrollBottom(body: HTMLElement) {
  body.scrollTop = body.scrollHeight
}

function append(body: HTMLElement, el: HTMLElement) {
  body.appendChild(el)
  scrollBottom(body)
}

// ── Step renderers ───────────────────────────────────────────────────────────

async function renderMsg(
  body: HTMLElement,
  text: string,
  sleep: (ms: number) => Promise<void>,
) {
  const row = document.createElement('div')
  row.className = 'sr-msg'
  const prompt = document.createElement('span')
  prompt.className = 'sr-msg-prompt'
  prompt.textContent = '>'
  const textEl = document.createElement('span')
  textEl.className = 'sr-msg-text'
  textEl.textContent = text
  row.appendChild(prompt)
  row.appendChild(textEl)
  append(body, row)
  await sleep(500)
}

async function renderThink(
  body: HTMLElement,
  ms: number,
  sleep: (ms: number) => Promise<void>,
) {
  const row = document.createElement('div')
  row.className = 'sr-think'
  const dot = document.createElement('span')
  dot.className = 'sr-think-dot'
  const label = document.createElement('span')
  label.textContent = 'claude is thinking'
  row.appendChild(dot)
  row.appendChild(label)
  append(body, row)
  await sleep(ms)
  if (row.parentElement) row.parentElement.removeChild(row)
}

async function renderTool(
  body: HTMLElement,
  verb: string,
  path: string,
  ms: number,
  sleep: (ms: number) => Promise<void>,
) {
  const row = document.createElement('div')
  row.className = 'sr-tool'
  const verbEl = document.createElement('span')
  verbEl.className = 'sr-tool-verb'
  verbEl.textContent = verb
  const pathEl = document.createElement('span')
  pathEl.className = 'sr-tool-path'
  pathEl.textContent = path
  const statusEl = document.createElement('span')
  statusEl.className = 'sr-tool-status'
  statusEl.textContent = '···'
  row.appendChild(verbEl)
  row.appendChild(pathEl)
  row.appendChild(statusEl)
  append(body, row)
  await sleep(ms)
  statusEl.textContent = '✓'
  statusEl.classList.add('done')
  await sleep(100)
}

async function renderText(
  body: HTMLElement,
  text: string,
  sleep: (ms: number) => Promise<void>,
) {
  const el = document.createElement('p')
  el.className = 'sr-text'
  append(body, el)
  for (const char of text) {
    el.textContent += char
    scrollBottom(body)
    await sleep(17)
  }
  await sleep(220)
}

async function renderDiff(
  body: HTMLElement,
  file: string,
  removed: string[],
  added: string[],
  sleep: (ms: number) => Promise<void>,
) {
  const block = document.createElement('div')
  block.className = 'sr-diff'
  const header = document.createElement('div')
  header.className = 'sr-diff-header'
  header.textContent = file
  block.appendChild(header)
  for (const line of removed) {
    const el = document.createElement('div')
    el.className = 'sr-diff-line sr-diff-removed'
    el.textContent = '- ' + line
    block.appendChild(el)
  }
  for (const line of added) {
    const el = document.createElement('div')
    el.className = 'sr-diff-line sr-diff-added'
    el.textContent = '+ ' + line
    block.appendChild(el)
  }
  append(body, block)
  await sleep(380)
}

// Completion ratios for labeled-box agents — staggered to feel parallel
const STAGGER: Record<number, number[]> = {
  3: [0.52, 0.82, 1.0],
  6: [0.14, 0.28, 0.46, 0.63, 0.80, 1.0],
}

async function renderAgents(
  body: HTMLElement,
  label: string,
  count: number,
  tags: string[],
  ms: number,
  sleep: (ms: number) => Promise<void>,
  id: number,
) {
  const block = document.createElement('div')
  block.className = 'sr-agents'
  const labelEl = document.createElement('div')
  labelEl.className = 'sr-agents-label'
  labelEl.textContent = label
  block.appendChild(labelEl)

  if (tags.length > 0) {
    const boxesEl = document.createElement('div')
    boxesEl.className = 'sr-agents-boxes'
    const boxes = tags.map(tag => {
      const box = document.createElement('div')
      box.className = 'sr-box'
      box.textContent = tag
      boxesEl.appendChild(box)
      return box
    })
    block.appendChild(boxesEl)
    append(body, block)

    const ratios = STAGGER[boxes.length] ?? boxes.map((_, i) => (i + 1) / boxes.length)
    boxes.forEach((box, i) => {
      setTimeout(() => {
        if (playId === id) box.classList.add('done')
      }, ms * ratios[i]!)
    })
  } else {
    const dotsEl = document.createElement('div')
    dotsEl.className = 'sr-agents-dots'
    const dots = Array.from({ length: count }, () => {
      const dot = document.createElement('span')
      dot.className = 'sr-dot'
      dotsEl.appendChild(dot)
      return dot
    })
    const counterEl = document.createElement('div')
    counterEl.className = 'sr-agents-counter'
    counterEl.textContent = `0 / ${count} complete`
    block.appendChild(dotsEl)
    block.appendChild(counterEl)
    append(body, block)

    const perDot = ms / count
    dots.forEach((dot, i) => {
      setTimeout(() => {
        if (playId === id) {
          dot.classList.add('done')
          counterEl.textContent = `${i + 1} / ${count} complete`
          scrollBottom(body)
        }
      }, perDot * (i + 1))
    })
  }

  await sleep(ms + 180)
}

async function renderDone(body: HTMLElement, text: string) {
  const el = document.createElement('div')
  el.className = 'sr-done'
  el.textContent = text
  append(body, el)
  // blinking cursor signals the terminal is idle
  const cursor = document.createElement('span')
  cursor.className = 'sr-cursor'
  cursor.setAttribute('aria-hidden', 'true')
  body.appendChild(cursor)
  scrollBottom(body)
}

// ── Main controller ──────────────────────────────────────────────────────────

export function mountSessionReplay(root: HTMLElement) {
  const body = root.querySelector<HTMLElement>('[data-sr-body]')!
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-tab]'))
  const replayBtn = root.querySelector<HTMLButtonElement>('[data-replay-btn]')
  const pauseBtn = root.querySelector<HTMLButtonElement>('[data-pause-btn]')

  let currentSession = 0
  let triggered = false

  async function play(sessionIndex: number) {
    setPaused(false)
    const id = ++playId
    if (pauseBtn) pauseBtn.textContent = '⏸'
    body.innerHTML = ''

    const session = SESSIONS[sessionIndex]!
    const sleep = makeSleep(id)

    try {
      for (const step of session.steps) {
        if (playId !== id) return
        switch (step.kind) {
          case 'msg':
            await renderMsg(body, step.text, sleep)
            break
          case 'think':
            await renderThink(body, step.ms, sleep)
            break
          case 'tool':
            await renderTool(body, step.verb, step.path, step.ms, sleep)
            break
          case 'text':
            await renderText(body, step.text, sleep)
            break
          case 'diff':
            await renderDiff(body, step.file, step.removed, step.added, sleep)
            break
          case 'agents':
            await renderAgents(body, step.label, step.count, step.tags, step.ms, sleep, id)
            break
          case 'done':
            await renderDone(body, step.text)
            break
          case 'gap':
            await sleep(step.ms)
            break
        }
      }
    } catch {
      // cancelled — normal on tab switch or replay
    }
  }

  function switchTab(idx: number) {
    currentSession = idx
    tabs.forEach((tab, i) => {
      tab.classList.toggle('active', i === idx)
      tab.setAttribute('aria-selected', String(i === idx))
    })
    play(idx)
  }

  tabs.forEach((tab, i) => tab.addEventListener('click', () => switchTab(i)))

  replayBtn?.addEventListener('click', () => play(currentSession))

  pauseBtn?.addEventListener('click', () => {
    setPaused(!paused)
    if (pauseBtn) pauseBtn.textContent = paused ? '▶' : '⏸'
  })

  // auto-start when the terminal scrolls into view, once per page load
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry!.isIntersecting && !triggered) {
        triggered = true
        play(0)
        observer.disconnect()
      }
    },
    { threshold: 0.25 },
  )
  observer.observe(root)
}
