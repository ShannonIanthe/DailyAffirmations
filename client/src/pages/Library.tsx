import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Affirmation, Category, UserAffirmation, CATEGORIES } from '../types';
import * as api from '../lib/api';

export default function Library() {
  const { user } = useAuth();
  const [systemAffirmations, setSystemAffirmations] = useState<Affirmation[]>([]);
  const [userAffirmations, setUserAffirmations] = useState<UserAffirmation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    if (user) {
      loadAll();
    }
  }, [user]);

  const loadAll = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [sysRes, userRes] = await Promise.all([
        api.getAffirmations(),
        api.getUserAffirmations(user.id),
      ]);
      setSystemAffirmations(sysRes.affirmations);
      setUserAffirmations(userRes.affirmations);

      // Determine saved IDs (those that exist in user affirmations)
      const saved = new Set<number>();
      userRes.affirmations.forEach((ua: UserAffirmation) => {
        // Match by text
        const match = sysRes.affirmations.find((sa: Affirmation) => sa.text === ua.text);
        if (match) saved.add(match.id);
      });
      setSavedIds(saved);
    } catch (err) {
      console.error('Failed to load library:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (aff: Affirmation) => {
    if (!user) return;
    if (savedIds.has(aff.id)) {
      // Remove: find and delete the user affirmation with matching text
      const toRemove = userAffirmations.find((ua) => ua.text === aff.text);
      if (toRemove) {
        await api.deleteUserAffirmation(toRemove.id);
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(aff.id);
          return next;
        });
        setUserAffirmations((prev) => prev.filter((a) => a.id !== toRemove.id));
      }
    } else {
      // Add
      const { affirmation } = await api.createUserAffirmation({
        user_id: user.id,
        text: aff.text,
        categories: [aff.category],
        include_in_notifications: false,
      });
      setSavedIds((prev) => new Set(prev).add(aff.id));
      setUserAffirmations((prev) => [...prev, affirmation]);
    }
  };

  const filtered = systemAffirmations.filter((aff) => {
    if (filterCategory !== 'all' && aff.category !== filterCategory) return false;
    if (showFavorites && !savedIds.has(aff.id)) return false;
    return true;
  });

  return (
    <div className="px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-display font-bold text-text-primary mb-4">Library</h1>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none -mx-4 px-4">
        <button
          onClick={() => { setFilterCategory('all'); setShowFavorites(false); }}
          className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all ${
            filterCategory === 'all' && !showFavorites
              ? 'bg-brand-lavender text-white'
              : 'bg-white/70 text-text-secondary hover:bg-white'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => { setFilterCategory(cat.id); setShowFavorites(false); }}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
              filterCategory === cat.id
                ? 'bg-brand-lavender text-white'
                : 'bg-white/70 text-text-secondary hover:bg-white'
            }`}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
        <button
          onClick={() => { setShowFavorites(true); setFilterCategory('all'); }}
          className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all ${
            showFavorites
              ? 'bg-brand-peach text-white'
              : 'bg-white/70 text-text-secondary hover:bg-white'
          }`}
        >
          ❤️ Saved
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-text-secondary animate-pulse-soft">
          Loading library...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📚</div>
          <p className="text-text-secondary">No affirmations found</p>
        </div>
      ) : (
        <div className="space-y-2 mt-4">
          {filtered.map((aff) => {
            const cat = CATEGORIES.find((c) => c.id === aff.category);
            const isSaved = savedIds.has(aff.id);
            return (
              <div
                key={aff.id}
                className="bg-white/70 rounded-2xl p-4 border border-gray-100 shadow-sm flex items-start gap-3"
              >
                <div className={`w-10 h-10 rounded-xl ${cat?.bg || 'bg-purple-50'} flex items-center justify-center shrink-0`}>
                  <span className="text-lg">{cat?.emoji || '✨'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary leading-relaxed font-sans">
                    "{aff.text}"
                  </p>
                  {cat && (
                    <span className="inline-block mt-1.5 text-[10px] font-medium text-text-secondary bg-gray-50 px-2 py-0.5 rounded-full font-sans">
                      {cat.label}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => toggleFavorite(aff)}
                  className="shrink-0 w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center hover:bg-pink-50 transition-colors"
                >
                  <span className={isSaved ? 'text-lg' : 'text-lg opacity-40'}>
                    {isSaved ? '❤️' : '🤍'}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}