import type { Publication } from './types';

export const publications: Publication[] = [
  {
    id: 'interspeech2026-codeswitching',
    title:
      'Direct Preference Optimization for English-Mandarin Code-Switching Speech Recognition in Audio LLMs',
    authors: [
      'Trung Nguyen Quang',
      'Cheng Yi Lewis Won',
      'Minh Duc Pham',
      'Yingxu He',
      'Shuo Sun',
      'Ai Ti Aw',
    ],
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
    id: 'neurips2026-senses-wide-shut',
    title: 'Senses Wide Shut: A Representation-Action Gap in Omnimodal LLMs',
    authors: [
      'Trung Nguyen Quang',
      'Yiming Gao',
      'Fanyi Pu',
      'Kaichen Zhang',
      'Shuo Sun',
      'Ziwei Liu',
    ],
    venue: 'NeurIPS 2026 (under review)',
    status: 'under-review',
    year: 2026,
    links: {
      arxiv: 'https://arxiv.org/abs/2605.13737',
    },
    note: 'First author',
  },
];
