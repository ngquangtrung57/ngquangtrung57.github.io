/* Interactive hero terminal: type commands to explore the site.
   Progressive enhancement — the header nav covers navigation without JS. */

interface TermRefs {
  output: HTMLElement;
  input: HTMLInputElement;
  body: HTMLElement;
}

type LineKind = 'cmd' | 'out' | 'ok' | 'err' | 'dim';

const SECTIONS = ['publications', 'experience', 'projects', 'skills', 'contact'] as const;

const HELP_TEXT = [
  'ls            list sections',
  'cd <section>  jump to a section (e.g. cd publications)',
  'whoami        a short intro',
  'open <link>   github · scholar · linkedin',
  'email         get in touch',
  'neofetch      system info',
  'clear         clear the terminal',
  '',
  "shortcuts: 'pubs', 'exp' … also work. tab completes, ↑ recalls.",
];

const COMPLETIONS = [
  'help',
  'ls',
  'cd ',
  'whoami',
  'open github',
  'open scholar',
  'open linkedin',
  'email',
  'neofetch',
  'clear',
  ...SECTIONS,
];

const LINKS: Record<string, string> = {
  github: 'https://github.com/ngquangtrung57',
  scholar: 'https://scholar.google.com/citations?user=hqt52d8AAAAJ',
  linkedin: 'https://www.linkedin.com/in/ngqtrung/',
};

const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function scrollToSection(id: string): void {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' });
}

export function mountTerminal(root: HTMLElement): void {
  const output = root.querySelector<HTMLElement>('[data-term-output]');
  const input = root.querySelector<HTMLInputElement>('[data-term-input]');
  const body = root.querySelector<HTMLElement>('[data-term-body]');
  if (!output || !input || !body) return;
  const refs: TermRefs = { output, input, body };

  const history: string[] = [];
  let histIdx = -1;

  function print(text: string, kind: LineKind = 'out'): void {
    const line = document.createElement('div');
    line.className = `t-line t-${kind}`;
    if (kind === 'cmd') {
      const prompt = document.createElement('span');
      prompt.className = 't-prompt';
      prompt.textContent = 'trung@ntu:~$ ';
      line.append(prompt, document.createTextNode(text));
    } else {
      line.textContent = text || ' ';
    }
    refs.output.appendChild(line);
    // keep the buffer bounded
    while (refs.output.childElementCount > 200) {
      refs.output.firstElementChild?.remove();
    }
    refs.body.scrollTop = refs.body.scrollHeight;
  }

  function printMany(lines: string[], kind: LineKind = 'out'): void {
    for (const l of lines) print(l, kind);
  }

  function goto(section: string): void {
    print(`→ opening ~/${section}`, 'ok');
    scrollToSection(section);
  }

  function run(raw: string): void {
    const cmdline = raw.trim();
    print(cmdline, 'cmd');
    if (!cmdline) return;

    history.push(cmdline);
    histIdx = history.length;

    const [cmd = '', ...rest] = cmdline.toLowerCase().split(/\s+/);
    const arg = rest.join(' ');

    switch (cmd) {
      case 'help':
      case '?':
        printMany(HELP_TEXT, 'dim');
        break;

      case 'ls':
        print(SECTIONS.map((s) => `${s}/`).join('  '));
        break;

      case 'cd':
      case 'goto':
      case 'go': {
        const target = arg.replace(/^~?\//, '').replace(/\/$/, '');
        const match = resolveSection(target);
        if (match) goto(match);
        else print(`cd: no such section: ${arg || '~'} — try 'ls'`, 'err');
        break;
      }

      case 'whoami':
      case 'about':
        printMany([
          'nguyen quang trung — EEE undergrad @ NTU Singapore.',
          'research: audio LLM post-training (A*STAR) and',
          'multimodal evaluation + RL reasoning (S-Lab, NTU).',
        ]);
        break;

      case 'open': {
        const url = LINKS[arg];
        if (url) {
          print(`→ opening ${arg} in a new tab`, 'ok');
          window.open(url, '_blank', 'noopener');
        } else {
          print(`open: unknown link: ${arg} — try github · scholar · linkedin`, 'err');
        }
        break;
      }

      case 'github':
      case 'scholar':
      case 'linkedin':
        print(`→ opening ${cmd} in a new tab`, 'ok');
        window.open(LINKS[cmd] ?? '', '_blank', 'noopener');
        break;

      case 'email':
      case 'contact':
        if (cmd === 'contact') {
          goto('contact');
        } else {
          print('→ quangtrung5705@gmail.com', 'ok');
          window.location.href = 'mailto:quangtrung5705@gmail.com';
        }
        break;

      case 'neofetch':
        printMany([
          '        ▄▄▄        trung@ntu',
          '      ▄█▀▀▀█▄      ---------',
          '     ██  ▪  ██     degree:   B.Eng EEE, NTU (2023–2027)',
          '     ██     ██     focus:    audio · multimodal · RL',
          '      ▀█▄▄▄█▀      labs:     A*STAR · S-Lab',
          '        ▀▀▀        uptime:   3rd year, CGPA 4.96/5.0',
        ], 'dim');
        break;

      case 'clear':
        refs.output.replaceChildren();
        break;

      case 'cv':
      case 'resume':
        print("no cv served here — run 'email' instead.", 'dim');
        break;

      case 'sudo':
        print('permission denied: nice try.', 'err');
        break;

      case 'messi':
      case 'barca':
      case 'barça':
        print('⚽ visca el barça — més que un club.', 'ok');
        break;

      case 't1':
      case 'faker':
        print('🏆 unkillable demon king. what was that flash?', 'ok');
        break;

      case 'exit':
      case 'quit':
        print('there is no escape. scroll instead ↓', 'dim');
        break;

      default: {
        const match = resolveSection(cmd);
        if (match) goto(match);
        else print(`zsh: command not found: ${cmd} — try 'help'`, 'err');
      }
    }
  }

  function resolveSection(token: string): string | null {
    if (!token) return null;
    if (token === 'pubs' || token === 'papers') return 'publications';
    if (token === 'exp' || token === 'work') return 'experience';
    const hit = SECTIONS.find((s) => s === token || s.startsWith(token));
    return hit ?? null;
  }

  // --- input handling ---
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      run(input.value);
      input.value = '';
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx > 0) input.value = history[--histIdx] ?? '';
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx < history.length - 1) {
        input.value = history[++histIdx] ?? '';
      } else {
        histIdx = history.length;
        input.value = '';
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const v = input.value.toLowerCase();
      if (v) {
        const hit = COMPLETIONS.find((c) => c.startsWith(v) && c !== v);
        if (hit) input.value = hit;
      }
    }
  });

  // clicking anywhere in the window focuses the input (but not text selection)
  root.addEventListener('click', () => {
    if (!window.getSelection()?.toString()) input.focus({ preventScroll: true });
  });

  // suggestion chips run commands
  root.querySelectorAll<HTMLButtonElement>('[data-term-cmd]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      run(btn.dataset.termCmd ?? '');
      input.focus({ preventScroll: true });
    });
  });

  // --- boot sequence ---
  const boot: Array<[string, LineKind]> = [
    ['whoami', 'cmd'],
    ['nguyen quang trung — undergrad researcher @ ntu singapore', 'out'],
    ['ls ~/research', 'cmd'],
    ['audio-llms/  multimodal-eval/  rl-reasoning/', 'out'],
    ["type 'help' to explore — or click a suggestion below.", 'dim'],
  ];

  if (reducedMotion()) {
    for (const [text, kind] of boot) print(text, kind);
    return;
  }

  let i = 0;
  const step = () => {
    const entry = boot[i++];
    if (!entry) return;
    print(entry[0], entry[1]);
    window.setTimeout(step, entry[1] === 'cmd' ? 420 : 260);
  };
  window.setTimeout(step, 350);
}
