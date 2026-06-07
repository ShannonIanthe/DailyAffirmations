import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Category, CATEGORIES, FREQUENCY_OPTIONS, NotificationFrequency } from '../types';
import * as api from '../lib/api';

export default function Settings() {
  const { user, logout, updateUser } = useAuth();
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleCategoryToggle = async (cat: Category) => {
    if (!user) return;
    const current = user.selected_categories;
    const updated = current.includes(cat)
      ? current.filter((c) => c !== cat)
      : [...current, cat];
    await updateUser({ selected_categories: updated });
  };

  const handleFrequencyChange = async (freq: NotificationFrequency) => {
    await updateUser({ notification_frequency: freq });
  };

  const handleResetStreak = async () => {
    if (!user) return;
    try {
      await api.resetStreak(user.id);
      await updateUser({ streak_count: 0 });
      setShowResetConfirm(false);
    } catch (err) {
      console.error('Failed to reset streak:', err);
    }
  };

  return (
    <div className="px-4 pt-6 max-w-lg mx-auto pb-8">
      <h1 className="text-2xl font-display font-bold text-text-primary mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Profile */}
        <section>
          <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-3 font-sans">Profile</h2>
          <div className="bg-white/70 rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-lg shadow-sm">
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-semibold text-text-primary font-sans">{user?.name}</p>
                <p className="text-sm text-text-secondary font-sans">{user?.email}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section>
          <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-3 font-sans">Life Categories</h2>
          <div className="bg-white/70 rounded-2xl p-4 border border-gray-100 space-y-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryToggle(cat.id)}
                className="flex items-center justify-between w-full p-2 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{cat.emoji}</span>
                  <span className="text-sm font-medium text-text-primary font-sans">{cat.label}</span>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  user?.selected_categories?.includes(cat.id)
                    ? 'border-brand-lavender bg-brand-lavender'
                    : 'border-gray-300'
                }`}>
                  {user?.selected_categories?.includes(cat.id) && (
                    <span className="text-white text-xs">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Notification Frequency */}
        <section>
          <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-3 font-sans">
            Notification Frequency
          </h2>
          <div className="bg-white/70 rounded-2xl p-4 border border-gray-100 space-y-2">
            {FREQUENCY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleFrequencyChange(opt.value)}
                className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${
                  user?.notification_frequency === opt.value
                    ? 'bg-purple-50 border border-purple-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <span className="text-2xl">{opt.icon}</span>
                <div className="flex-1 text-left">
                  <div className={`text-sm font-medium ${
                    user?.notification_frequency === opt.value ? 'text-purple-700' : 'text-gray-700'
                  }`}>
                    {opt.label}
                  </div>
                  <div className="text-xs text-gray-400">{opt.description}</div>
                </div>
                {user?.notification_frequency === opt.value && (
                  <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                    <span className="text-white text-[10px]">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Notifications toggle */}
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Push Notifications</h2>
          <div className="bg-white/70 rounded-2xl p-4 border border-gray-100">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-sm font-medium text-gray-700">Enable notifications</div>
                <div className="text-xs text-gray-400">Receive affirmations throughout the day</div>
              </div>
              <div
                onClick={() => setNotifEnabled(!notifEnabled)}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  notifEnabled ? 'bg-purple-500' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
                  notifEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </div>
            </label>
          </div>
        </section>

        {/* Reset Streak */}
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Streak</h2>
          <div className="bg-white/70 rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-700">Current streak</div>
                <div className="text-lg font-bold text-brand-peach">
                  🔥 {user?.streak_count || 0} days
                </div>
              </div>
              {!showResetConfirm ? (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="px-4 py-2 text-sm font-medium text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                >
                  Reset
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleResetStreak}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full py-3.5 text-sm font-medium text-gray-500 bg-white/50 rounded-2xl border border-gray-200 hover:bg-gray-50 hover:text-gray-700 transition-all"
        >
          Logout
        </button>

        {/* Version */}
        <p className="text-center text-xs text-gray-300">
          Daily Affirm v1.0.0
        </p>
      </div>
    </div>
  );
}