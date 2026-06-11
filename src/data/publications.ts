import type { Publication } from './types';

export const publications: Publication[] = [
  {
    id: 'interspeech2026-codeswitching',
    title:
      'Mitigating Code-Switching Failures in Audio LLMs with Preference Optimization',
    authors: ['Nguyen Quang Trung', 'et al.'],
    venue: 'Interspeech 2026',
    status: 'accepted',
    year: 2026,
    links: {
      arxiv: 'https://arxiv.org/abs/2605.23975',
    },
    note: 'First author',
    highlight: true,
  },
  {
    id: 'neurips2026-benchmark',
    title:
      'Diagnosing Multimodal Model Failures: Disentangling Visual and Audio Errors',
    authors: ['Nguyen Quang Trung', 'et al.'],
    venue: 'NeurIPS 2026 (under review)',
    status: 'under-review',
    year: 2026,
    links: {
      arxiv: 'https://arxiv.org/abs/2605.13737',
    },
  },
];
