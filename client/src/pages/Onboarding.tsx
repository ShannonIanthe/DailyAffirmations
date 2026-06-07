import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Category, CATEGORIES, FREQUENCY_OPTIONS } from '../types';

type Step = 'welcome' | 'categories' | 'frequency' | 'login';

export default function Onboarding() {
  const { login, loginAsGuest, updateUser, user } = useAuth();
  const [step, setStep] = useState<Step>('welcome');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [frequency, setFrequency] = useState<1 | 3 | 5>(3);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleCategory = (cat: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleFinish = async () => {
    if (!user || !email) return;
    setSaving(true);
    try {
      await login(email, name || undefined);
      await updateUser({
        selected_categories: selectedCategories.length > 0 ? selectedCategories : ['finance', 'love', 'career', 'health', 'mindset'],
        notification_frequency: frequency,
      });
    } catch (err) {
      console.error('Failed to save preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleGuestFlow = async () => {
    setSaving(true);
    try {
      await loginAsGuest();
      await updateUser({
        selected_categories: selectedCategories.length > 0 ? selectedCategories : ['finance', 'love', 'career', 'health', 'mindset'],
        notification_frequency: frequency,
      });
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-brand-bg">
      {/* Step indicator */}
      {step !== 'welcome' && (
        <div className="flex justify-center gap-2 pt-8 pb-4">
          {['welcome', 'categories', 'frequency', 'login'].map((s, i) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-500 ${
                s === step ? 'w-8 bg-brand-lavender' : 'w-2 bg-violet-200'
              }`}
            />
          ))}
        </div>
      )}

      {/* Welcome Step */}
      {step === 'welcome' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 animate-fade-in-up">
          <img
            src="/assets/onboarding-1.png"
            alt="Daily Affirm Welcome"
            className="w-64 h-64 mb-8 object-contain"
          />
          <h1 className="text-4xl font-display font-bold text-text-primary text-center mb-3">
            Daily Affirm
          </h1>
          <p className="text-lg text-text-secondary text-center max-w-xs font-sans leading-relaxed">
            Daily affirmations tailored to your life goals
          </p>
          <button
            onClick={() => setStep('categories')}
            className="mt-12 bg-brand-lavender text-white text-lg font-semibold px-10 py-4 rounded-full shadow-md hover:-translate-y-1 transition-transform active:scale-95"
          >
            Get Started
          </button>
        </div>
      )}

      {/* Category Selection Step */}
      {step === 'categories' && (
        <div className="flex-1 flex flex-col px-6 pt-4 animate-fade-in-up">
          <div className="flex justify-center mb-4">
            <img
              src="/assets/onboarding-2.png"
              alt="Choose categories"
              className="w-48 h-48 object-contain"
            />
          </div>
          <h2 className="text-2xl font-display font-bold text-text-primary text-center mb-2">
            What matters to you?
          </h2>
          <p className="text-text-secondary text-center mb-6 font-sans">
            Pick the areas you want to focus on
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto w-full">
            {CATEGORIES.map((cat) => {
              const selected = selectedCategories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`relative flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all duration-200 ${
                    selected
                      ? `border-brand-lavender bg-brand-bg shadow-md scale-[1.02]`
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <span className="text-4xl">{cat.emoji}</span>
                  <span className={`font-semibold font-sans ${selected ? 'text-brand-lavender' : 'text-gray-600'}`}>
                    {cat.label}
                  </span>
                  {selected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-brand-lavender rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-auto pt-8 pb-10 text-center">
            <button
              onClick={() => setStep('frequency')}
              className="bg-brand-lavender text-white text-lg font-semibold px-10 py-4 rounded-full shadow-md hover:-translate-y-1 transition-transform active:scale-95"
            >
              Continue
            </button>
            <button
              onClick={() => { setSelectedCategories([]); setStep('frequency'); }}
              className="block mx-auto mt-3 text-sm text-text-secondary hover:text-text-primary font-sans"
            >
              Skip — I'll choose later
            </button>
          </div>
        </div>
      )}

      {/* Frequency Step */}
      {step === 'frequency' && (
        <div className="flex-1 flex flex-col px-6 pt-4 animate-fade-in-up">
          <div className="flex justify-center mb-4">
            <img
              src="/assets/onboarding-3.png"
              alt="Choose frequency"
              className="w-48 h-48 object-contain"
            />
          </div>
          <h2 className="text-2xl font-display font-bold text-text-primary text-center mb-2">
            How often?
          </h2>
          <p className="text-text-secondary text-center mb-6 font-sans">
            Choose your daily affirmation rhythm
          </p>
          <div className="flex flex-col gap-3 max-w-sm mx-auto w-full">
            {FREQUENCY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFrequency(opt.value)}
                className={`flex items-center gap-4 p-5 rounded-3xl border-2 text-left transition-all duration-200 ${
                  frequency === opt.value
                    ? 'border-brand-lavender bg-brand-bg shadow-md'
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <span className="text-3xl">{opt.icon}</span>
                <div>
                  <div className="font-semibold text-text-primary font-sans">{opt.label}</div>
                  <div className="text-sm text-text-secondary">{opt.description}</div>
                </div>
                {frequency === opt.value && (
                  <div className="ml-auto w-6 h-6 bg-brand-lavender rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="mt-auto pt-8 pb-10 text-center">
            <button
              onClick={() => setStep('login')}
              className="bg-brand-lavender text-white text-lg font-semibold px-10 py-4 rounded-full shadow-md hover:-translate-y-1 transition-transform active:scale-95"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Login Step */}
      {step === 'login' && (
        <div className="flex-1 flex flex-col px-6 pt-4 animate-fade-in-up">
          <div className="text-center mb-6">
            <img
              src="/assets/daily-affirm-logo.png"
              alt="Daily Affirm Logo"
              className="w-24 h-24 object-contain mx-auto rounded-3xl mb-4"
            />
            <h2 className="text-2xl font-display font-bold text-text-primary mt-4 mb-2">
              Almost there!
            </h2>
            <p className="text-text-secondary font-sans">
              Enter your email to start your affirmation journey
            </p>
          </div>

          <div className="max-w-sm mx-auto w-full space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5 font-sans">
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white/60 focus:border-brand-lavender focus:ring-2 focus:ring-purple-100 outline-none transition-all text-text-primary placeholder-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5 font-sans">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white/60 focus:border-brand-lavender focus:ring-2 focus:ring-purple-100 outline-none transition-all text-text-primary placeholder-gray-300"
              />
            </div>

            <button
              onClick={handleFinish}
              disabled={!email || saving}
              className="w-full bg-brand-lavender text-white text-lg font-semibold py-4 rounded-full shadow-md hover:-translate-y-1 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Setting up...' : 'Start My Journey ✨'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-brand-bg px-4 text-sm text-text-secondary font-sans">or</span>
              </div>
            </div>

            <button
              onClick={handleGuestFlow}
              disabled={saving}
              className="w-full bg-white text-text-primary font-medium py-3.5 rounded-full border-2 border-gray-200 hover:border-brand-lavender hover:text-brand-lavender transition-all active:scale-95"
            >
              Continue as Guest 👋
            </button>
          </div>
        </div>
      )}
    </div>
  );
}