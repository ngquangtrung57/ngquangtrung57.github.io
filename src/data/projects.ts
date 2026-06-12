import type { Project } from './types';

export const projects: Project[] = [
  {
    id: 'lmms-eval',
    name: 'lmms-eval',
    description:
      'Unified evaluation framework for large multimodal models. Contributed model integrations, datasets, and pipeline improvements.',
    role: 'Contributor',
    links: {
      github: 'https://github.com/EvolvingLMMs-Lab/lmms-eval',
    },
    tags: ['Evaluation', 'VLM', 'ALM'],
    stars: 4200,
  },
  {
    id: 'lmms-engine',
    name: 'lmms-engine',
    description:
      'Training engine for large multimodal models. Contributed model integrations and training optimizations (sequence packing, parallelism).',
    role: 'Contributor',
    links: {
      github: 'https://github.com/EvolvingLMMs-Lab/lmms-engine',
    },
    tags: ['Training', 'Multimodal'],
    stars: 700,
  },
  {
    id: 'aero-1-audio',
    name: 'AERO-1-Audio',
    description:
      'A compact 1.5B audio language model with strong ASR and audio-understanding performance. Contributed to training and data work.',
    role: 'Contributor',
    links: {
      post: 'https://www.lmms-lab.com/posts/aero_audio/',
    },
    tags: ['Audio LLM', 'ASR'],
  },
];
