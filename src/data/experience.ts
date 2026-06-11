import type { ExperienceItem } from './types';

export const experience: ExperienceItem[] = [
  {
    id: 'astar',
    role: 'Research Assistant (Audio LLM Post-Training)',
    org: 'A*STAR — Agency for Science, Technology and Research',
    location: 'Singapore',
    start: '2025-05',
    end: 'present',
    supervisors: [{ name: 'Dr. Sun Shuo', url: 'https://ssun32.github.io/' }],
    bullets: [
      'First author of a paper accepted to Interspeech 2026 targeting code-switching failures in Audio LLMs. Curated a dataset of 100K preference pairs (570 hours) and applied Direct Preference Optimization, resulting in MER reductions and behavioral improvement across MERaLiON Audio LLM, Phi-4-multimodal, and Qwen2-Audio.',
      'Post-trained MERaLiON Audio LLM to enhance user experience by curating a 500-hour audio dataset and generating preference pairs using Reinforcement Learning from AI Feedback for DPO training.',
      'Implemented a custom DPO framework from scratch using PyTorch, deployed training with FSDP across 32 H100 GPUs to optimize memory usage and training speed for the MERaLiON-2-10B model, achieving 20% improvement on a private test set.',
    ],
    tags: ['Audio LLMs', 'DPO', 'RLAIF', 'FSDP'],
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
      'Working on improving multi-hop reasoning in Vision Language Models on video understanding tasks with RL (ongoing).',
      'Led the development of a multimodal benchmark to diagnose the root causes of multimodal model failures by distinguishing between visual and audio errors, moving beyond isolated single-modality benchmarks to analyze capabilities in complex settings (submitted to NeurIPS 2026).',
      'Led the development of a large-scale multimodal dataset comprising 30,000 videos (1,500 hours) with 1.5 million cross-modality question-answer pairs for instruction tuning, designed to train omni models to enhance visual and audio understanding, by building a scalable annotation framework for internally developed multimodal models.',
      'Leveraged the dataset to conduct training experiments with Ola and Qwen 2.5 Omni models on 64 H100 GPUs, optimizing large-scale training with long multimodal inputs and achieving promising results on multimodal benchmarks.',
      'Served as a main contributor to the lmms-engine framework on GitHub (700 stars), integrating the Qwen Omni and Qwen VL series with advanced optimizations including Liger Kernel, sequence packing, DeepSpeed Ulysses sequence parallelism, and expert parallelism for efficient training.',
      'Served as a main contributor to AERO-1-Audio, a small audio language model (1.5B params) achieving state-of-the-art performance on ASR and audio understanding benchmarks, demonstrating that smart data (50k hours) can outperform massive training approaches.',
      'Contributed to the lmms-eval framework on GitHub (4.2k stars) by conducting research on Large Multimodal Models, including VLMs and ALMs, integrating new datasets and models, and optimizing the evaluation pipeline.',
    ],
    tags: ['Multimodal', 'Omni Models', 'RL', 'Evaluation'],
  },
  {
    id: 'amst',
    role: 'Student Research Assistant (NLP)',
    org: 'Academy of Military Science and Technology',
    location: 'Hanoi, Vietnam',
    start: '2024-05',
    end: '2024-08',
    bullets: [
      'Developed and implemented a QCA (Question-Context-Answer) fine-tuning framework that extends beyond traditional QC pair fine-tuning for embedding models by simultaneously minimizing distances between all three semantic relationships (Question-Context, Question-Answer, and Answer-Context pairs), capturing deeper semantic understanding.',
      'Achieved 10% MAP@K improvements over baseline QC fine-tuning in the legal document retrieval domain through QCA fine-tuning, testing on Vietnamese legal datasets with models including BAAI/bge-base-en-v1.5 and intfloat/multilingual-e5.',
      'Extended QCA framework evaluation to general-domain retrieval tasks on the SQuAD dataset, with preliminary experiments showing promising generalization capabilities.',
    ],
    tags: ['Embeddings', 'Retrieval', 'Fine-tuning'],
  },
  {
    id: 'vnpt',
    role: 'AI Engineer Intern',
    org: 'Vietnam Posts and Telecommunications Group',
    location: 'Hanoi, Vietnam',
    start: '2024-05',
    end: '2024-08',
    bullets: [
      'Built a Telegram chatbot for company customer support handling 100+ FAQ types using the LangChain framework, analyzing user queries to identify common failure patterns and redesigning prompts and the RAG pipeline accordingly.',
      'Developed a RAG system for Vietnamese high school history exam prep using 10,000+ documents (textbooks, practice tests, QA pairs) by building an Elasticsearch index with custom document chunking, combining keyword search (BM25) with semantic search using embedding models, and integrating web search for topics not in the document base.',
      'Tested the system on actual national graduation exams from 2019–2023; the baseline model scored 78% accuracy — after fine-tuning embeddings on history-specific data and optimizing the retrieval pipeline, achieved 88% accuracy (10% improvement).',
    ],
    tags: ['RAG', 'LangChain', 'Elasticsearch'],
  },
];
