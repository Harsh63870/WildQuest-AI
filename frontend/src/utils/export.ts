import { JournalEntry } from '../types';
import { formatLocalDate } from './formatters';

export function exportEntryToMarkdown(entry: JournalEntry): string {
  const dateFormatted = formatLocalDate(entry.created_at);
  const categories = entry.nature_categories.join(', ') || 'General Nature';

  return `# ${entry.title}

*Recorded on ${dateFormatted}*
*Categories: ${categories} | Outdoor Duration: ${entry.total_outdoor_minutes} mins | Quests Completed: ${entry.completed_quests_count}*
*Generated via: ${entry.fallback_used ? 'Deterministic Nature Templates (Offline)' : 'Local AI Model'}*

---

## Field Reflection
${entry.narrative}

---

## Key Observations & Takeaways
${entry.takeaways.map((t) => `- ${t}`).join('\n')}

---

## Suggested Future Activity
${entry.future_activity}

---

### Original Field Notes
- **Observations**: ${entry.user_observations}
${entry.user_surprises ? `- **Surprises**: ${entry.user_surprises}\n` : ''}${entry.user_learnings ? `- **Learnings**: ${entry.user_learnings}\n` : ''}${entry.user_feeling ? `- **Feeling**: ${entry.user_feeling}\n` : ''}
---
*Exported from WildQuest AI — Less scrolling. More discovering.*
`;
}

export function downloadMarkdownFile(entry: JournalEntry) {
  const content = exportEntryToMarkdown(entry);
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const sanitizedTitle = entry.title.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
  link.href = url;
  link.download = `wildquest_${sanitizedTitle}_${entry.id}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
