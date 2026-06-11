# ngquangtrung57.github.io

Personal academic website of **Nguyen Quang Trung** — undergraduate researcher at NTU Singapore working on multimodal and audio LLMs.

Live at **https://ngquangtrung57.github.io**

## Stack

- [Astro 5](https://astro.build) — static output, zero framework JS
- Vanilla TypeScript for the interactive bit:
  - `src/scripts/sampler.ts` — "The Sampler": a toy LM over a corpus of 23 verified famous AI quotes. temperature / top_k / top_p pick both the quote (weighted by fame) and its slotted words — greedy decoding quotes the literature verbatim, high temperature misquotes it. Click any sampled word to reroll it
- Light/dark theme toggle (persisted in `localStorage`, defaults to `prefers-color-scheme`)
- Self-hosted fonts (Fraunces, Newsreader, IBM Plex Mono) via Fontsource

## Development

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # type-checks (astro check) + builds to dist/
npm run preview
```

## Updating content

All content lives in typed data files — no markup edits needed:

| File | Contents |
| --- | --- |
| `src/data/profile.ts` | Name, bio, links |
| `src/data/news.ts` | News items (currently unmounted — kept for later) |
| `src/data/publications.ts` | Papers — venue, status, arXiv/code links |
| `src/data/experience.ts` | Research/work timeline |
| `src/data/projects.ts` | Open-source contributions grid |

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site and deploys it to GitHub Pages.

One-time repo setting: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
