import { Achievement } from '../types';

export function formatLocalDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return isoString;
  }
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

export function computeAchievements(
  totalQuests: number,
  totalMinutes: number,
  totalSessions: number,
  categoriesCount: number
): Achievement[] {
  return [
    {
      id: 'first_steps',
      title: 'First Steps',
      description: 'Completed your very first outdoor exploration quest.',
      badge: 'Footprints',
      unlocked: totalQuests >= 1,
      progressPercentage: Math.min(100, Math.round((totalQuests / 1) * 100)),
      requirementText: '1 completed quest',
    },
    {
      id: 'curious_observer',
      title: 'Curious Observer',
      description: 'Penned your first reflective nature journal entry.',
      badge: 'Feather',
      unlocked: totalSessions >= 1,
      progressPercentage: Math.min(100, Math.round((totalSessions / 1) * 100)),
      requirementText: '1 recorded reflection',
    },
    {
      id: 'five_quests',
      title: 'Five Quests Completed',
      description: 'Accomplished five mindful nature exploration missions.',
      badge: 'Compass',
      unlocked: totalQuests >= 5,
      progressPercentage: Math.min(100, Math.round((totalQuests / 5) * 100)),
      requirementText: `${Math.min(5, totalQuests)}/5 quests`,
    },
    {
      id: 'nature_regular',
      title: 'Nature Regular',
      description: 'Completed three separate outdoor exploration sessions.',
      badge: 'TreePine',
      unlocked: totalSessions >= 3,
      progressPercentage: Math.min(100, Math.round((totalSessions / 3) * 100)),
      requirementText: `${Math.min(3, totalSessions)}/3 sessions`,
    },
    {
      id: 'canopy_whisperer',
      title: 'Canopy Whisperer',
      description: 'Explored 3 or more distinct nature categories.',
      badge: 'Leaf',
      unlocked: categoriesCount >= 3,
      progressPercentage: Math.min(100, Math.round((categoriesCount / 3) * 100)),
      requirementText: `${Math.min(3, categoriesCount)}/3 categories`,
    },
    {
      id: 'hour_in_wild',
      title: 'Hour in the Wild',
      description: 'Logged an hour of screen-free observation time outdoors.',
      badge: 'Sun',
      unlocked: totalMinutes >= 60,
      progressPercentage: Math.min(100, Math.round((totalMinutes / 60) * 100)),
      requirementText: `${Math.min(60, totalMinutes)}/60 minutes`,
    },
  ];
}
