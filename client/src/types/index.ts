export type Category = 'finance' | 'love' | 'career' | 'health' | 'mindset';
export type NotificationFrequency = 1 | 3 | 5;
export type AffirmationPriority = 'normal' | 'high';
export type AffirmationSource = 'system' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  selected_categories: Category[];
  notification_frequency: NotificationFrequency;
  streak_count: number;
  last_active_date?: string;
  created_at: string;
}

export interface Affirmation {
  id: number;
  category: Category;
  text: string;
}

export interface UserAffirmation {
  id: string;
  user_id: string;
  text: string;
  categories: Category[];
  include_in_notifications: boolean;
  priority: AffirmationPriority;
  created_at: string;
}

export interface UserLog {
  id: string;
  user_id: string;
  affirmation_id: string;
  source: AffirmationSource;
  shown_at: string;
}

// Designer's design system tokens for categories
export const CATEGORIES: {
  id: Category;
  label: string;
  emoji: string;
  color: string;
  gradient: string;
  bgGradient: string;
  bg: string;
}[] = [
  {
    id: 'finance',
    label: 'Finance',
    emoji: '💰',
    color: '#34D399',
    gradient: 'bg-gradient-finance',
    bgGradient: 'from-emerald-200 to-emerald-400',
    bg: 'bg-emerald-50',
  },
  {
    id: 'love',
    label: 'Love',
    emoji: '❤️',
    color: '#FDA4AF',
    gradient: 'bg-gradient-love',
    bgGradient: 'from-rose-200 to-rose-300',
    bg: 'bg-rose-50',
  },
  {
    id: 'career',
    label: 'Career',
    emoji: '💼',
    color: '#818CF8',
    gradient: 'bg-gradient-career',
    bgGradient: 'from-indigo-200 to-indigo-400',
    bg: 'bg-indigo-50',
  },
  {
    id: 'health',
    label: 'Health',
    emoji: '🌿',
    color: '#2DD4BF',
    gradient: 'bg-gradient-health',
    bgGradient: 'from-teal-200 to-teal-400',
    bg: 'bg-teal-50',
  },
  {
    id: 'mindset',
    label: 'Mindset',
    emoji: '🧠',
    color: '#C084FC',
    gradient: 'bg-gradient-mindset',
    bgGradient: 'from-purple-200 to-purple-400',
    bg: 'bg-purple-50',
  },
];

export const FREQUENCY_OPTIONS: { value: NotificationFrequency; label: string; description: string; icon: string }[] = [
  { value: 1, label: 'Light', description: '1x per day — morning', icon: '🌅' },
  { value: 3, label: 'Balanced', description: '3x per day — morning, afternoon, evening', icon: '☀️' },
  { value: 5, label: 'Intense', description: '5x per day — full day coverage', icon: '⭐' },
];