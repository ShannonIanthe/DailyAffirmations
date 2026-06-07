import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Category, CATEGORIES } from '../types';
import * as api from '../lib/api';

export default function CreateAffirmation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [includeNotif, setIncludeNotif] = useState(true);
  const [saving, setSaving] = useState(false);

  const toggleCategory = (cat: Category) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = async () => {
    if (!user || !text.trim() || categories.length === 0) return;
    setSaving(true);
    try {
      await api.createUserAffirmation({
        user_id: user.id,
        text: text.trim(),
        categories,
        include_in_notifications: includeNotif,
      });
      navigate('/my-affirmations');
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-display font-bold text-text-primary mb-6">Create Affirmation</h1>

      <div className="space-y-6">
        {/* Text input */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2 font-sans">
            Your affirmation
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write something uplifting..."
            className="w-full px-4 py-4 rounded-2xl border border-gray-200 bg-white/60 focus:border-brand-lavender focus:ring-2 focus:ring-violet-100 outline-none transition-all text-text-primary placeholder-gray-300 resize-none min-h-[120px] text-lg leading-relaxed font-sans"
            rows={4}
            maxLength={280}
          />
          <p className="text-right text-xs text-text-secondary mt-1 font-sans">
            {text.length}/280
          </p>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2 font-sans">
            Categories
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`flex items-center gap-2 p-3 rounded-3xl border-2 transition-all ${
                  categories.includes(cat.id)
                    ? 'border-brand-lavender bg-brand-bg'
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <span className="text-xl">{cat.emoji}</span>
                <span className={`text-sm font-medium ${
                  categories.includes(cat.id) ? 'text-brand-lavender' : 'text-text-secondary'
                }`}>
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Include in notifications */}
        <label className="flex items-center gap-3 p-4 bg-white/60 rounded-xl border border-gray-100 cursor-pointer">
          <input
            type="checkbox"
            checked={includeNotif}
            onChange={(e) => setIncludeNotif(e.target.checked)}
            className="w-5 h-5 rounded text-brand-lavender focus:ring-brand-lavender"
          />
          <div>
            <div className="text-sm font-medium text-text-primary font-sans">Include in notifications</div>
            <div className="text-xs text-text-secondary font-sans">This affirmation may appear in your daily rotation</div>
          </div>
        </label>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!text.trim() || categories.length === 0 || saving}
          className="w-full bg-brand-lavender text-white text-lg font-semibold py-4 rounded-full shadow-md hover:-translate-y-1 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Affirmation ✨'}
        </button>
      </div>
    </div>
  );
}