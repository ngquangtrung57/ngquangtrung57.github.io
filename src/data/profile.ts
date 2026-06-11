import type { Profile } from './types';

export const profile: Profile = {
  name: 'Nguyen Quang Trung',
  role: 'Undergraduate Researcher · NTU Singapore',
  metaDescription:
    'Nguyen Quang Trung (Trung) — EEE undergraduate at NTU Singapore interested in multimodal and audio LLMs and reinforcement learning. Research assistant at A*STAR and undergraduate researcher at S-Lab, NTU.',
  taglinePhrases: [
    'post-training audio LLMs',
    'evaluating multimodal models',
    'RL for reasoning and alignment',
    'building open-source LMM tools',
  ],
  // paragraphs may contain inline <a> links — rendered with set:html
  bio: [
    "I'm an Electrical & Electronic Engineering undergraduate at Nanyang Technological University, Singapore. I'm interested in multimodal LLMs, and lately most excited about reinforcement learning — for reasoning and for alignment.",
    'I work as a research assistant at A*STAR and an undergraduate researcher at S-Lab, NTU. I\'m really fortunate and grateful to work with and learn from <a href="https://liuziwei7.github.io/" target="_blank" rel="noopener">Prof. Ziwei Liu</a>, and to be mentored by <a href="https://brianboli.com/" target="_blank" rel="noopener">Dr. Bo Li</a>, <a href="https://kcz358.github.io/" target="_blank" rel="noopener">Kaichen Zhang</a>, <a href="https://github.com/dongyh20" target="_blank" rel="noopener">Yuhao Dong</a>, and <a href="https://ssun32.github.io/" target="_blank" rel="noopener">Dr. Sun Shuo</a>.',
    'Most of this I taught myself — books and courses like <a href="https://rail.eecs.berkeley.edu/deeprlcourse/" target="_blank" rel="noopener">CS285</a> for RL, <a href="https://rlhfbook.com/" target="_blank" rel="noopener">Nathan Lambert\'s RLHF Book</a>, implementations from <a href="https://www.youtube.com/@umarjamilai" target="_blank" rel="noopener">Umar Jamil</a>\'s channel — then sharpened through my mentors\' advice and real projects. That mix shaped my skills and interests, and my hope for a PhD in the future.',
  ],
  education:
    "B.Eng EEE @ NTU (2023–2027) · CGPA 4.96/5.0 · Dean's List ×2 · ASEAN Undergraduate Scholar",
  email: 'quangtrung5705@gmail.com',
  links: {
    github: 'https://github.com/ngquangtrung57',
    linkedin: 'https://www.linkedin.com/in/ngqtrung/',
    scholar: 'https://scholar.google.com/citations?user=hqt52d8AAAAJ',
  },
};
