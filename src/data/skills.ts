import type { SkillGroup } from './types';

export const skills: SkillGroup[] = [
  {
    label: 'Languages',
    items: ['Python', 'C++', 'SQL'],
  },
  {
    label: 'ML',
    items: ['PyTorch', 'Transformers', 'TRL', 'veRL', 'DeepSpeed', 'vLLM'],
  },
  {
    label: 'Training at scale',
    items: ['FSDP', 'ZeRO', 'sequence parallelism', 'Flash Attention', 'Slurm/PBS'],
  },
  {
    label: 'Areas',
    items: ['Audio LLMs', 'multimodal evaluation', 'RLHF/DPO', 'RAG'],
  },
];
