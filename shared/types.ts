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

export interface OnboardingStep {
  step: number;
  completed: boolean;
}

export const CATEGORIES: { id: Category; label: string; emoji: string; gradient: string }[] = [
  { id: 'finance', label: 'Finance', emoji: '💰', gradient: 'from-emerald-400 to-teal-500' },
  { id: 'love', label: 'Love', emoji: '❤️', gradient: 'from-rose-400 to-pink-500' },
  { id: 'career', label: 'Career', emoji: '💼', gradient: 'from-blue-400 to-indigo-500' },
  { id: 'health', label: 'Health', emoji: '🌿', gradient: 'from-green-400 to-emerald-500' },
  { id: 'mindset', label: 'Mindset', emoji: '🧠', gradient: 'from-purple-400 to-violet-500' },
];

export const FREQUENCY_OPTIONS: { value: NotificationFrequency; label: string; description: string }[] = [
  { value: 1, label: 'Light', description: '1x per day — morning' },
  { value: 3, label: 'Balanced', description: '3x per day — morning, afternoon, evening' },
  { value: 5, label: 'Intense', description: '5x per day — morning, late morning, afternoon, evening, night' },
];