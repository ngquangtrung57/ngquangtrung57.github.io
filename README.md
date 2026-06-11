# ngquangtrung57.github.io

Personal academic website of **Nguyen Quang Trung** — undergraduate researcher at NTU Singapore working on multimodal and audio LLMs.

Live at **https://ngquangtrung57.github.io**

## Stack

- [Astro 5](https://astro.build) — static output, zero framework JS
- Vanilla TypeScript for the interactive bits:
  - `src/scripts/attention-field.ts` — the "multimodal attention field" hero canvas (cursor acts as a query over drifting text/audio/vision tokens)
  - `src/scripts/token-typewriter.ts` — token-by-token tagline generation with fake top-k logit chips
- Self-hosted fonts (Inter Variable, JetBrains Mono Variable) via Fontsource

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
| `src/data/profile.ts` | Name, bio, tagline phrases, links |
| `src/data/news.ts` | News items (supports `[label](url)` links) |
| `src/data/publications.ts` | Papers — venue, status, arXiv/code links |
| `src/data/experience.ts` | Research/work timeline |
| `src/data/projects.ts` | Open-source & projects grid |
| `src/data/skills.ts` | Skill groups |

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site and deploys it to GitHub Pages.

One-time repo setting: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
