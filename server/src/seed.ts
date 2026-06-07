import { getDb, initializeDatabase } from './db';

const affirmations = [
  // FINANCE (12)
  { category: 'finance', text: 'I am in control of my finances and make wise money decisions.' },
  { category: 'finance', text: 'Abundance flows freely into my life every single day.' },
  { category: 'finance', text: 'I am worthy of financial prosperity and success.' },
  { category: 'finance', text: 'Money is a tool that helps me create the life I desire.' },
  { category: 'finance', text: 'I attract opportunities that increase my income and wealth.' },
  { category: 'finance', text: 'My financial goals are within reach, and I achieve them with ease.' },
  { category: 'finance', text: 'I spend wisely, save consistently, and invest in my future.' },
  { category: 'finance', text: 'Every day I am building stronger financial habits.' },
  { category: 'finance', text: 'I release all anxiety about money and trust in my abundance.' },
  { category: 'finance', text: 'My income grows as I grow in value and contribution.' },
  { category: 'finance', text: 'I am grateful for the money I have and the money coming to me.' },
  { category: 'finance', text: 'Financial freedom is my birthright and I claim it now.' },

  // LOVE (12)
  { category: 'love', text: 'I am deserving of deep, authentic love in all forms.' },
  { category: 'love', text: 'Love flows freely into my life and I receive it with an open heart.' },
  { category: 'love', text: 'I attract loving, supportive, and kind people into my life.' },
  { category: 'love', text: 'My heart is open to giving and receiving unconditional love.' },
  { category: 'love', text: 'I am worthy of a relationship built on trust, respect, and joy.' },
  { category: 'love', text: 'Love begins with me — I love and accept myself completely.' },
  { category: 'love', text: 'I radiate love and attract loving energy in return.' },
  { category: 'love', text: 'Every relationship in my life is a gift that helps me grow.' },
  { category: 'love', text: 'I communicate with kindness, honesty, and compassion.' },
  { category: 'love', text: 'My capacity to love expands more and more each day.' },
  { category: 'love', text: 'I am surrounded by people who cherish and appreciate me.' },
  { category: 'love', text: 'Love is my natural state and I share it freely with the world.' },

  // CAREER (12)
  { category: 'career', text: 'I am talented, capable, and excelling in my career.' },
  { category: 'career', text: 'Every day I grow more skilled and confident in my work.' },
  { category: 'career', text: 'I attract exciting opportunities that align with my purpose.' },
  { category: 'career', text: 'My contributions are valued and make a real difference.' },
  { category: 'career', text: 'I am building a career that fulfills and inspires me.' },
  { category: 'career', text: 'Success comes naturally to me because I am prepared and focused.' },
  { category: 'career', text: 'I collaborate with amazing people who support my growth.' },
  { category: 'career', text: 'My potential is limitless and I pursue it with passion.' },
  { category: 'career', text: 'I am confident in my abilities and embrace new challenges.' },
  { category: 'career', text: 'My work brings meaning and value to the world.' },
  { category: 'career', text: 'I am exactly where I need to be on my professional journey.' },
  { category: 'career', text: 'Creativity and innovation flow through me in my work.' },

  // HEALTH (12)
  { category: 'health', text: 'My body is healthy, strong, and full of vibrant energy.' },
  { category: 'health', text: 'I nourish my body with love, care, and healthy choices.' },
  { category: 'health', text: 'Every cell in my body radiates health and vitality.' },
  { category: 'health', text: 'I listen to my body and give it exactly what it needs.' },
  { category: 'health', text: 'Rest and recovery are essential parts of my wellness journey.' },
  { category: 'health', text: 'I am grateful for my body and all it does for me.' },
  { category: 'health', text: 'My mind and body are in perfect harmony.' },
  { category: 'health', text: 'I choose foods and activities that make me feel amazing.' },
  { category: 'health', text: 'My immune system is strong and resilient.' },
  { category: 'health', text: 'I move my body with joy and celebrate what it can do.' },
  { category: 'health', text: 'Sleep restores and rejuvenates me completely each night.' },
  { category: 'health', text: 'I am committed to my wellbeing and prioritize my health.' },

  // MINDSET (12)
  { category: 'mindset', text: 'I am in charge of my thoughts and I choose positivity.' },
  { category: 'mindset', text: 'Every challenge I face is an opportunity to grow stronger.' },
  { category: 'mindset', text: 'I believe in myself and my ability to achieve great things.' },
  { category: 'mindset', text: 'I release what I cannot control and focus on what I can.' },
  { category: 'mindset', text: 'Today I choose peace over worry and gratitude over fear.' },
  { category: 'mindset', text: 'I am resilient — I can handle anything life brings my way.' },
  { category: 'mindset', text: 'My potential is unlimited and I am constantly evolving.' },
  { category: 'mindset', text: 'I trust the journey and embrace the present moment.' },
  { category: 'mindset', text: 'I am kind to myself and speak to myself with love.' },
  { category: 'mindset', text: 'Every day is a fresh start filled with new possibilities.' },
  { category: 'mindset', text: 'I attract positive energy and let go of negativity.' },
  { category: 'mindset', text: 'I am grateful for this moment and all the blessings in my life.' },
];

function seed(): void {
  initializeDatabase();
  const db = getDb();

  const count = db.prepare('SELECT COUNT(*) as count FROM affirmations').get() as { count: number };

  if (count.count > 0) {
    console.log(`Database already has ${count.count} affirmations. Skipping seed.`);
    return;
  }

  const insert = db.prepare('INSERT INTO affirmations (category, text) VALUES (?, ?)');

  const insertMany = db.transaction((items: { category: string; text: string }[]) => {
    for (const item of items) {
      insert.run(item.category, item.text);
    }
  });

  insertMany(affirmations);

  console.log(`Seeded ${affirmations.length} affirmations across 5 categories.`);

  // Count by category
  const byCategory = db.prepare('SELECT category, COUNT(*) as count FROM affirmations GROUP BY category').all();
  console.log('By category:', byCategory);
}

seed();