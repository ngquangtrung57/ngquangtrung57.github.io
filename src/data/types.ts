export interface Profile {
  name: string;
  role: string;
  metaDescription: string;
  /** Phrases cycled by the token typewriter in the hero tagline. */
  taglinePhrases: string[];
  /** Bio paragraphs; may contain inline <a> HTML links (rendered with set:html). */
  bio: string[];
  /** Education line shown as metadata in the hero. */
  education: string;
  email: string;
  links: {
    github: string;
    linkedin: string;
    scholar: string;
  };
}

export interface NewsItem {
  /** "YYYY-MM" — rendered as "Jun 2026". */
  date: string;
  /** May contain [label](url) markdown-style links. */
  text: string;
}

export interface Publication {
  id: string;
  title: string;
  /** Exact author order; the component bolds the site owner's name. */
  authors: string[];
  venue: string;
  status: 'accepted' | 'under-review' | 'preprint';
  year: number;
  links: {
    paper?: string;
    arxiv?: string;
    code?: string;
    project?: string;
  };
  note?: string;
  highlight?: boolean;
}

export interface ExperienceItem {
  id: string;
  role: string;
  org: string;
  orgUrl?: string;
  location?: string;
  /** "YYYY-MM" */
  start: string;
  end: string | 'present';
  supervisors?: { name: string; url?: string }[];
  bullets: string[];
  tags?: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  role: string;
  links: {
    github?: string;
    post?: string;
  };
  tags: string[];
  /** Static star fallback; real-time count fetched client-side if github is set. */
  stars?: number;
}

export interface SkillGroup {
  label: string;
  items: string[];
}
