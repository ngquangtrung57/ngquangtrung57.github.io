import type { ExperienceItem } from './types';

export const experience: ExperienceItem[] = [
  {
    id: 'astar',
    role: 'Research Assistant',
    org: 'A*STAR — Agency for Science, Technology and Research',
    location: 'Singapore',
    start: '2025-05',
    end: 'present',
    supervisors: [{ name: 'Dr. Sun Shuo', url: 'https://ssun32.github.io/' }],
    bullets: [
      'Work on post-training for audio LLMs, focusing on preference optimization (DPO) for the MERaLiON Audio LLM.',
      'First-author paper accepted to Interspeech 2026 on code-switching failures in audio LLMs and mitigation with preference data.',
      'Run distributed DPO training with PyTorch FSDP on H100 clusters.',
    ],
    tags: ['Audio LLMs', 'DPO', 'FSDP'],
  },
  {
    id: 'slab',
    role: 'Undergraduate Research Student',
    org: 'S-Lab for Advanced Intelligence, NTU',
    location: 'Singapore',
    start: '2024-08',
    end: 'present',
    supervisors: [
      { name: 'Prof. Ziwei Liu', url: 'https://liuziwei7.github.io/' },
      { name: 'Dr. Bo Li', url: 'https://brianboli.com/' },
    ],
    bullets: [
      'Contributed to a benchmark for separating visual and audio errors in multimodal models (submitted to NeurIPS 2026).',
      'Helped build data pipelines for a large-scale multimodal video dataset for instruction tuning.',
      'Contributor to the open-source lmms-engine and lmms-eval frameworks, and to the AERO-1-Audio release.',
      'Currently exploring reinforcement learning for multi-hop reasoning in vision–language models.',
    ],
    tags: ['Multimodal', 'Evaluation', 'RL'],
  },
  {
    id: 'amst',
    role: 'Student Research Assistant (NLP)',
    org: 'Academy of Military Science and Technology',
    location: 'Hanoi, Vietnam',
    start: '2024-05',
    end: '2024-08',
    bullets: [
      'Worked on fine-tuning embedding models with a question–context–answer objective for legal-document retrieval.',
    ],
    tags: ['Embeddings', 'Retrieval'],
  },
  {
    id: 'vnpt',
    role: 'AI Engineer Intern',
    org: 'Vietnam Posts and Telecommunications Group',
    location: 'Hanoi, Vietnam',
    start: '2024-05',
    end: '2024-08',
    bullets: [
      'Built RAG pipelines and chatbot prototypes for customer support and education use cases.',
    ],
    tags: ['RAG', 'LangChain', 'Elasticsearch'],
  },
];
