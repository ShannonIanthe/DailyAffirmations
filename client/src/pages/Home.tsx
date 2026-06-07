import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Affirmation, Category, CATEGORIES } from '../types';
import * as api from '../lib/api';

export default function Home() {
  const { user, updateUser } = useAuth();
  const [affirmation, setAffirmation] = useState<Affirmation | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [nextIn, setNextIn] = useState('');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const fetchAffirmation = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const categories: Category[] =
        selectedCategory === 'all'
          ? user.selected_categories
          : [selectedCategory];

      const { affirmation: a } = await api.getRandomAffirmation(categories);
      setAffirmation(a);
      setSaved(false);

      // Log the shown affirmation
      await api.logAffirmation(user.id, String(a.id), 'system');
    } catch (err) {
      console.error('Failed to fetch affirmation:', err);
    } finally {
      setLoading(false);
    }
  }, [user, selectedCategory]);

  useEffect(() => {
    fetchAffirmation();
  }, [fetchAffirmation]);

  // Next affirmation countdown
  useEffect(() => {
    const updateNextIn = () => {
      const now = new Date();
      const freq = user?.notification_frequency || 3;
      const intervals = {
        1: [{ h: 9, m: 0 }],
        3: [{ h: 8, m: 0 }, { h: 13, m: 0 }, { h: 19, m: 0 }],
        5: [{ h: 7, m: 0 }, { h: 10, m: 0 }, { h: 13, m: 0 }, { h: 17, m: 0 }, { h: 21, m: 0 }],
      };
      const times = intervals[freq as keyof typeof intervals] || intervals[3];

      // Find next time
      let nextTime: Date | null = null;
      for (const t of times) {
        const candidate = new Date(now);
        candidate.setHours(t.h, t.m, 0, 0);
        if (candidate > now) {
          nextTime = candidate;
          break;
        }
      }
      if (!nextTime) {
        // Tomorrow morning
        nextTime = new Date(now);
        nextTime.setDate(nextTime.getDate() + 1);
        nextTime.setHours(times[0].h, times[0].m, 0, 0);
      }

      const diffMs = nextTime.getTime() - now.getTime();
      const hours = Math.floor(diffMs / 3600000);
      const minutes = Math.floor((diffMs % 3600000) / 60000);
      setNextIn(`${hours}h ${minutes}m`);
    };

    updateNextIn();
    const interval = setInterval(updateNextIn, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const handleSave = async () => {
    if (!user || !affirmation || saved) return;
    setSaved(true);
    try {
      await api.createUserAffirmation({
        user_id: user.id,
        text: affirmation.text,
        categories: [affirmation.category],
        include_in_notifications: false,
      });
    } catch {
      setSaved(false);
    }
  };

  const handleShare = async () => {
    if (!affirmation) return;
    const text = `${affirmation.text} ✨\n\nvia Daily Affirm`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  const currentCat = CATEGORIES.find((c) => c.id === (selectedCategory === 'all' ? (affirmation?.category || 'mindset') : selectedCategory));

  return (
    <div className="px-4 pt-6 max-w-lg mx-auto">
      {/* Header with Logo */}
      <div className="flex justify-center mb-8">
        <img
          src="/assets/daily-affirm-logo.png"
          alt="Daily Affirm"
          className="w-16 h-16 object-contain rounded-2xl shadow-sm"
        />
      </div>

      {/* Greeting */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">
            {getGreeting()}, {user?.name || 'there'} 👋
          </h1>
          {user && user.streak_count > 0 && (
            <p className="text-sm text-brand-peach font-medium mt-1">
              🔥 {user.streak_count} day streak
            </p>
          )}
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mt-4 scrollbar-none -mx-4 px-4">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selectedCategory === 'all'
              ? 'bg-brand-lavender text-white shadow-md'
              : 'bg-white/70 text-text-secondary hover:bg-white'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? 'bg-brand-lavender text-white shadow-md'
                : 'bg-white/70 text-text-secondary hover:bg-white'
            }`}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Affirmation Card */}
      <div className="mt-2 animate-fade-in-up">
        {loading ? (
          <div className="aspect-[4/3] rounded-3xl bg-gradient-brand flex items-center justify-center">
            <div className="animate-pulse-soft text-2xl text-white/70 font-sans">Loading...</div>
          </div>
        ) : affirmation ? (
          <div
            className={`relative aspect-[4/3] rounded-3xl ${currentCat?.gradient || 'bg-gradient-brand'} p-8 flex flex-col items-center justify-center text-center shadow-xl shadow-slate-200/50 affirmation-card hover:-translate-y-1 transition-transform`}
          >
            {currentCat?.emoji && <div className="text-5xl mb-4">{currentCat.emoji}</div>}
            <p className="text-white text-xl md:text-2xl font-display font-medium leading-relaxed max-w-xs">
              "{affirmation.text}"
            </p>
            <div className="absolute bottom-4 text-white/50 text-xs font-medium uppercase tracking-wider">
              {currentCat?.label || 'Mindset'}
            </div>
          </div>
        ) : (
          <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <p className="text-gray-400">No affirmations available</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-6 mt-6">
          <button
            onClick={fetchAffirmation}
            className="flex flex-col items-center gap-1 text-text-secondary hover:text-brand-lavender transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-shadow">
              <span className="text-xl">🔄</span>
            </div>
            <span className="text-xs font-medium font-sans">Repeat</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saved}
            className={`flex flex-col items-center gap-1 transition-colors ${
              saved ? 'text-red-400' : 'text-text-secondary hover:text-red-400'
            }`}
          >
            <div className={`w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-shadow ${
              saved ? 'shadow-red-100' : ''
            }`}>
              <span className="text-xl">{saved ? '❤️' : '🤍'}</span>
            </div>
            <span className="text-xs font-medium font-sans">{saved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-1 text-text-secondary hover:text-blue-500 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-shadow">
              <span className="text-xl">📤</span>
            </div>
            <span className="text-xs font-medium font-sans">Share</span>
          </button>
        </div>

        {/* Next affirmation timer */}
        <p className="text-center text-sm text-text-secondary mt-6 font-sans">
          Next affirmation in: <span className="font-semibold text-brand-lavender">{nextIn}</span>
        </p>
      </div>
    </div>
  );
}