import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserAffirmation, Category, CATEGORIES } from '../types';
import * as api from '../lib/api';

export default function MyAffirmations() {
  const { user } = useAuth();
  const [affirmations, setAffirmations] = useState<UserAffirmation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editCategories, setEditCategories] = useState<Category[]>([]);
  const [editInclude, setEditInclude] = useState(true);

  useEffect(() => {
    if (user) {
      loadAffirmations();
    }
  }, [user]);

  const loadAffirmations = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { affirmations } = await api.getUserAffirmations(user.id);
      setAffirmations(affirmations);
    } catch (err) {
      console.error('Failed to load affirmations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteUserAffirmation(id);
      setAffirmations((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const startEditing = (aff: UserAffirmation) => {
    setEditingId(aff.id);
    setEditText(aff.text);
    setEditCategories(aff.categories);
    setEditInclude(aff.include_in_notifications);
  };

  const saveEdit = async () => {
    if (!editingId || !editText.trim()) return;
    try {
      const { affirmation } = await api.updateUserAffirmation(editingId, {
        text: editText.trim(),
        categories: editCategories,
        include_in_notifications: editInclude,
      });
      setAffirmations((prev) =>
        prev.map((a) => (a.id === editingId ? affirmation : a))
      );
      setEditingId(null);
    } catch (err) {
      console.error('Failed to update:', err);
    }
  };

  const toggleCategory = (cat: Category) => {
    setEditCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-display font-bold text-text-primary mb-6">My Affirmations</h1>

      {loading ? (
        <div className="text-center py-16 text-text-secondary animate-pulse-soft">
          Loading...
        </div>
      ) : affirmations.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">💬</div>
          <p className="text-gray-400 mb-2">No affirmations yet</p>
          <p className="text-gray-300 text-sm">Create your first affirmation</p>
        </div>
      ) : (
        <div className="space-y-3">
          {affirmations.map((aff) => (
            <div
              key={aff.id}
              className="bg-white/70 rounded-2xl p-4 border border-gray-100 shadow-sm"
            >
              {editingId === aff.id ? (
                <div className="space-y-3">
                <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:border-brand-lavender focus:ring-2 focus:ring-violet-100 outline-none resize-none"
                    rows={3}
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          editCategories.includes(cat.id)
                            ? 'bg-violet-100 text-brand-lavender'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {cat.emoji} {cat.label}
                      </button>
                    ))}
                  </div>
                  <label className="flex items-center gap-2 text-sm text-text-secondary font-sans">
                    <input
                      type="checkbox"
                      checked={editInclude}
                      onChange={(e) => setEditInclude(e.target.checked)}
                      className="rounded text-brand-lavender focus:ring-brand-lavender"
                    />
                    Include in notifications
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      className="px-4 py-2 bg-brand-lavender text-white text-sm rounded-full font-medium hover:opacity-90 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 bg-gray-100 text-text-secondary text-sm rounded-full font-medium hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-700 text-sm leading-relaxed mb-3">
                    "{aff.text}"
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {aff.categories.map((cat) => {
                        const c = CATEGORIES.find((c) => c.id === cat);
                        return c ? (
                          <span
                            key={cat}
                            className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500"
                          >
                            {c.emoji} {c.label}
                          </span>
                        ) : null;
                      })}
                      {aff.include_in_notifications && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-600">
                          🔔 Notify
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => startEditing(aff)}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-500"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(aff.id)}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-100 transition-colors text-gray-500"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}