import { User, Affirmation, UserAffirmation, Category } from '../types';

// VITE_API_URL env variable for production builds (set at build time)
// In development (Vite proxy), it's empty so requests use relative /api/ paths
const API_BASE = `${import.meta.env.VITE_API_URL || ''}/api`;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// Auth
export async function login(email: string, name?: string): Promise<{ user: User }> {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, name }),
  });
}

export async function guestLogin(): Promise<{ user: User }> {
  return request('/auth/guest', { method: 'POST' });
}

export async function getUser(id: string): Promise<{ user: User }> {
  return request(`/auth/user/${id}`);
}

// Affirmations (system)
export async function getAffirmations(category?: string): Promise<{ affirmations: Affirmation[] }> {
  const params = category ? `?category=${category}` : '';
  return request(`/affirmations${params}`);
}

export async function getRandomAffirmation(categories: Category[]): Promise<{ affirmation: Affirmation }> {
  return request(`/affirmations/random?categories=${JSON.stringify(categories)}`);
}

export async function getAffirmationCounts(): Promise<{ counts: { category: string; count: number }[] }> {
  return request('/affirmations/counts');
}

// User Affirmations
export async function getUserAffirmations(userId: string, category?: string): Promise<{ affirmations: UserAffirmation[] }> {
  const params = category ? `?category=${category}` : '';
  return request(`/user-affirmations/${userId}${params}`);
}

export async function createUserAffirmation(data: {
  user_id: string;
  text: string;
  categories: Category[];
  include_in_notifications?: boolean;
  priority?: string;
}): Promise<{ affirmation: UserAffirmation }> {
  return request('/user-affirmations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateUserAffirmation(
  id: string,
  data: Partial<{
    text: string;
    categories: Category[];
    include_in_notifications: boolean;
    priority: string;
  }>
): Promise<{ affirmation: UserAffirmation }> {
  return request(`/user-affirmations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteUserAffirmation(id: string): Promise<{ success: boolean }> {
  return request(`/user-affirmations/${id}`, { method: 'DELETE' });
}

// Logs
export async function logAffirmation(user_id: string, affirmation_id: string, source: 'system' | 'user'): Promise<{ id: string; success: boolean }> {
  return request('/logs', {
    method: 'POST',
    body: JSON.stringify({ user_id, affirmation_id, source }),
  });
}

export async function getUserLogs(userId: string, limit?: number): Promise<{ logs: any[] }> {
  const params = limit ? `?limit=${limit}` : '';
  return request(`/logs/${userId}${params}`);
}

// User Profile
export async function updateUser(
  id: string,
  data: Partial<{
    name: string;
    selected_categories: Category[];
    notification_frequency: number;
  }>
): Promise<{ user: User }> {
  return request(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function resetStreak(userId: string): Promise<{ success: boolean; streak_count: number }> {
  return request(`/users/${userId}/reset-streak`, { method: 'POST' });
}