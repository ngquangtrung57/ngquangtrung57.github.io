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
    label: '3am debug',
    steps: [
      {
        kind: 'msg',
        text: "why does the quotebox freeze when i click fast. been staring at this for 2hrs pls help",
      },
      { kind: 'think', ms: 2000 },
      { kind: 'tool', verb: 'Read', path: 'src/scripts/quotebox.ts', ms: 340 },
      { kind: 'tool', verb: 'Read', path: 'src/components/QuoteBox.astro', ms: 250 },
      { kind: 'tool', verb: 'Bash', path: "grep -n 'setTimeout' src/scripts/quotebox.ts", ms: 140 },
      {
        kind: 'text',
        text: "Found it. render() fires setTimeout on every click without ever clearing the previous one — fast clicks stack up multiple pending renders that all fire in sequence, locking the animation.",
      },
      {
        kind: 'diff',
        file: 'src/scripts/quotebox.ts',
        removed: [
          '  const render = () => {',
          '    setTimeout(() => { draw() }, 120)',
        ],
        added: [
          '  let pending: ReturnType<typeof setTimeout> | null = null',
          '  const render = () => {',
          '    if (pending !== null) clearTimeout(pending)',
          '    pending = setTimeout(() => { draw() }, 120)',
        ],
      },
      {
        kind: 'text',
        text: "Same pattern in the snow-globe reset path — fixing that too:",
      },
      {
        kind: 'diff',
        file: 'src/scripts/quotebox.ts',
        removed: ['    resetTimer = setTimeout(triggerReset, 4000)'],
        added: [
          '    if (resetTimer !== null) clearTimeout(resetTimer)',
          '    resetTimer = setTimeout(triggerReset, 4000)',
        ],
      },
      { kind: 'tool', verb: 'Build', path: 'npm run build', ms: 2400 },
      {
        kind: 'text',
        text: "Clean. Tested at 20 clicks/sec in devtools — no stacking, debounces correctly every time.",
      },
      { kind: 'gap', ms: 300 },
      { kind: 'done', text: '1 file  ·  6 lines  ·  race condition sealed ✓' },
    ],
  },
  {
    label: 'make it alive',
    steps: [
      {
        kind: 'msg',
        text: "hero looks kinda dead idk. make it feel more alive without breaking the layout",
      },
      { kind: 'think', ms: 2600 },
      { kind: 'tool', verb: 'Read', path: 'src/components/Hero.astro', ms: 300 },
      { kind: 'tool', verb: 'Read', path: 'src/styles/global.css', ms: 230 },
      { kind: 'tool', verb: 'Read', path: 'src/styles/tokens.css', ms: 180 },
      {
        kind: 'text',
        text: "Plan: radial gradient bloom behind the name, staggered bio line entry on paint, subtle grid-dot layer that drifts on scroll. All respect prefers-reduced-motion.",
      },
      {
        kind: 'diff',
        file: 'src/styles/global.css',
        removed: [],
        added: [
          '.hero { position: relative; overflow: hidden; }',
          '.hero::before { content: ""; position: absolute; inset: 0; pointer-events: none;',
          '  background: radial-gradient(ellipse at 18% 55%, var(--accent-dim), transparent 62%); }',
          '@keyframes fade-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; } }',
        ],
      },
      {
        kind: 'diff',
        file: 'src/components/Hero.astro',
        removed: ['{bio.map(line => <p class="bio" set:html={line} />)}'],
        added: [
          '{bio.map((line, i) => (',
          '  <p class="bio" style={`animation-delay:${i * 90}ms`} set:html={line} />',
          '))}',
        ],
      },
      {
        kind: 'diff',
        file: 'src/styles/global.css',
        removed: [],
        added: [
          '.hero .bio { animation: fade-up 500ms cubic-bezier(0.2, 0.7, 0.3, 1) both; }',
          '@media (prefers-reduced-motion: reduce) { .hero .bio { animation: none; } }',
        ],
      },
      {
        kind: 'agents',
        label: 'cross-browser smoke · 4 agents',
        count: 4,
        tags: ['Chrome 124', 'Firefox 126', 'Safari 17', 'Mobile'],
        ms: 3200,
      },
      {
        kind: 'text',
        text: "All green. Safari needed -webkit-mask on one gradient rule — patched. Reduced-motion path confirmed static.",
      },
      { kind: 'tool', verb: 'Build', path: 'npm run build', ms: 2200 },
      { kind: 'gap', ms: 260 },
      { kind: 'done', text: '3 files  ·  34 lines  ·  build clean ✓' },
    ],
  },
  {
    label: 'corpus harvest',
    steps: [
      {
        kind: 'msg',
        text: "fill the quote grid. 6 topics × 5 eras × 6 heat = 180 slots. go wild with agents lol",
      },
      { kind: 'think', ms: 3400 },
      {
        kind: 'text',
        text: "4-phase workflow: 30 finders in parallel → chunk-of-4 verifiers → gap-fill pass → 6 writers to disk. Deduping on 48-char normalized key between phases.",
      },
      {
        kind: 'agents',
        label: 'phase 1 · finders · 30 parallel',
        count: 30,
        tags: [],
        ms: 4200,
      },
      {
        kind: 'text',
        text: "261 raw candidates across 180 cells. Running verifiers in chunks of 4...",
      },
      {
        kind: 'agents',
        label: 'phase 2 · verifiers · 65 agents',
        count: 65,
        tags: [],
        ms: 3200,
      },
      {
        kind: 'text',
        text: "4 cells still thin after dedup — attribution unclear or quote too short. Gap-fill round:",
      },
      {
        kind: 'agents',
        label: 'phase 3 · gap-fill · 8 agents',
        count: 8,
        tags: [],
        ms: 1800,
      },
      {
        kind: 'agents',
        label: 'phase 4 · writers',
        count: 6,
        tags: ['llms.json', 'rl.json', 'multimodal.json', 'scaling.json', 'agents.json', 'alignment.json'],
        ms: 2000,
      },
      {
        kind: 'text',
        text: "180/180 filled. Spot-checking heat distribution — balanced within ±2 per row.",
      },
      { kind: 'gap', ms: 380 },
      { kind: 'done', text: '109 agents  ·  261 candidates  →  180-slot grid ✓' },
    ],
  },
  {
    label: 'scroll reveal',
    steps: [
      {
        kind: 'msg',
        text: "sections just pop in instantly, feels kinda abrupt. scroll animations? nothing too crazy",
      },
      { kind: 'think', ms: 1600 },
      { kind: 'tool', verb: 'Read', path: 'src/pages/index.astro', ms: 270 },
      { kind: 'tool', verb: 'Read', path: 'src/styles/global.css', ms: 200 },
      { kind: 'tool', verb: 'Read', path: 'src/scripts/', ms: 160 },
      {
        kind: 'text',
        text: "IntersectionObserver on [data-reveal] — fade + 18px lift, 600ms ease. Gated behind html.js so no flash on first paint. Reduced-motion path gets instant reveal.",
      },
      {
        kind: 'diff',
        file: 'src/styles/global.css',
        removed: [],
        added: [
          'html.js [data-reveal] { opacity: 0; transform: translateY(18px);',
          '  transition: opacity 600ms ease, transform 600ms cubic-bezier(0.2, 0.7, 0.3, 1); }',
          'html.js [data-reveal].revealed { opacity: 1; transform: none; }',
        ],
      },
      {
        kind: 'diff',
        file: 'src/scripts/reveal.ts',
        removed: [],
        added: [
          'export function mountReveal() {',
          '  const els = document.querySelectorAll("[data-reveal]")',
          '  const obs = new IntersectionObserver(entries => {',
          '    entries.filter(e => e.isIntersecting).forEach(e => {',
          '      e.target.classList.add("revealed"); obs.unobserve(e.target)',
          '    })}, { threshold: 0.08, rootMargin: "0px 0px -10% 0px" })',
          '  els.forEach(el => obs.observe(el)) }',
        ],
      },
      {
        kind: 'diff',
        file: 'src/pages/index.astro',
        removed: ['<Publications />', '<Experience />', '<Projects />'],
        added: ['<Publications data-reveal />', '<Experience data-reveal />', '<Projects data-reveal />'],
      },
      { kind: 'tool', verb: 'Build', path: 'npm run build', ms: 2200 },
      {
        kind: 'text',
        text: "Verified with 6x CPU throttle — smooth. rootMargin -10% stops short sections from never triggering on mobile.",
      },
      { kind: 'tool', verb: 'Bash', path: 'npm run preview', ms: 1400 },
      { kind: 'gap', ms: 280 },
      { kind: 'done', text: '4 files  ·  40 lines  ·  build clean ✓' },
    ],
  },
  {
    label: 'ship it',
    steps: [
      {
        kind: 'msg',
        text: "ok i think it's ready. check og tags + json-ld look right then just push it",
      },
      { kind: 'think', ms: 2000 },
      { kind: 'tool', verb: 'Read', path: 'src/layouts/BaseLayout.astro', ms: 310 },
      { kind: 'tool', verb: 'Bash', path: 'curl -sI https://ngquangtrung57.github.io', ms: 920 },
      {
        kind: 'text',
        text: "Two things: og:image has no width/height hints so Twitter crops it randomly. JSON-LD Person is missing jobTitle — easy structured-data win for search.",
      },
      {
        kind: 'diff',
        file: 'src/layouts/BaseLayout.astro',
        removed: ['<meta property="og:image" content={ogImage} />'],
        added: [
          '<meta property="og:image" content={ogImage} />',
          '<meta property="og:image:width"  content="1200" />',
          '<meta property="og:image:height" content="630" />',
          '<meta name="twitter:image" content={ogImage} />',
        ],
      },
      {
        kind: 'diff',
        file: 'src/layouts/BaseLayout.astro',
        removed: ['"name": profile.name,'],
        added: ['"name": profile.name,', '"jobTitle": "Undergraduate Researcher",'],
      },
      { kind: 'tool', verb: 'Build', path: 'npm run build', ms: 2600 },
      { kind: 'tool', verb: 'Bash', path: 'git push origin main', ms: 3400 },
      {
        kind: 'text',
        text: "Pages CDN propagating — usually live in under 90s.",
      },
      { kind: 'tool', verb: 'Bash', path: "curl -s https://ngquangtrung57.github.io | grep 'og:image'", ms: 2100 },
      {
        kind: 'text',
        text: "Live and resolving. OG tags confirmed in response headers.",
      },
      { kind: 'gap', ms: 320 },
      { kind: 'done', text: '1 file  ·  6 lines  ·  live at ngquangtrung57.github.io ✓' },
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
  4: [0.35, 0.58, 0.78, 1.0],
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
