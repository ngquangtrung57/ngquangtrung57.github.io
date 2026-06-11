/** Shared date/text formatting helpers for content components. */

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/** "2026-06" → "Jun 2026". Falls back to the input if it doesn't parse. */
export function formatMonth(ym: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(ym);
  if (!match) return ym;
  const year = match[1];
  const monthIndex = Number(match[2]) - 1;
  const month = MONTHS[monthIndex];
  if (!month) return ym;
  return `${month} ${year}`;
}

/** "2025-05" + "present" → "May 2025 — Present". */
export function formatRange(start: string, end: string | 'present'): string {
  const endLabel = end === 'present' ? 'Present' : formatMonth(end);
  return `${formatMonth(start)} — ${endLabel}`;
}

export type TextPart =
  | { type: 'text'; value: string }
  | { type: 'link'; label: string; url: string };

/** Split text containing [label](url) markdown-style links into renderable parts. */
export function parseLinks(text: string): TextPart[] {
  const parts: TextPart[] = [];
  const pattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'link', label: match[1] ?? '', url: match[2] ?? '' });
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }
  return parts;
}
