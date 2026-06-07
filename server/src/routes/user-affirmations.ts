import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import { v4 as uuidv4 } from 'uuid';

type Category = 'finance' | 'love' | 'career' | 'health' | 'mindset';

const router = Router();

// Get all user affirmations
router.get('/:userId', (req: Request, res: Response) => {
  const db = getDb();
  const { userId } = req.params;
  const { category } = req.query;

  let affirmations;
  if (category && typeof category === 'string') {
    affirmations = db.prepare(
      `SELECT * FROM user_affirmations WHERE user_id = ? AND categories LIKE ? ORDER BY created_at DESC`
    ).all(userId, `%${category}%`);
  } else {
    affirmations = db.prepare(
      'SELECT * FROM user_affirmations WHERE user_id = ? ORDER BY created_at DESC'
    ).all(userId);
  }

  res.json({
    affirmations: affirmations.map((a: any) => ({
      ...a,
      categories: JSON.parse(a.categories || '[]'),
      include_in_notifications: Boolean(a.include_in_notifications),
    })),
  });
});

// Create user affirmation
router.post('/', (req: Request, res: Response) => {
  const db = getDb();
  const { user_id, text, categories, include_in_notifications, priority } = req.body;

  if (!user_id || !text) {
    return res.status(400).json({ error: 'user_id and text are required' });
  }

  const id = uuidv4();
  const cats = JSON.stringify(categories || []);
  const includeNotif = include_in_notifications !== false ? 1 : 0;
  const prio = priority || 'normal';

  db.prepare(
    'INSERT INTO user_affirmations (id, user_id, text, categories, include_in_notifications, priority) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, user_id, text, cats, includeNotif, prio);

  const affirmation = db.prepare('SELECT * FROM user_affirmations WHERE id = ?').get(id) as any;

  res.status(201).json({
    affirmation: {
      ...affirmation,
      categories: JSON.parse(affirmation.categories || '[]'),
      include_in_notifications: Boolean(affirmation.include_in_notifications),
    },
  });
});

// Update user affirmation
router.put('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const { id } = req.params;
  const { text, categories, include_in_notifications, priority } = req.body;

  const existing = db.prepare('SELECT * FROM user_affirmations WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Affirmation not found' });
  }

  const updates: string[] = [];
  const values: any[] = [];

  if (text !== undefined) { updates.push('text = ?'); values.push(text); }
  if (categories !== undefined) { updates.push('categories = ?'); values.push(JSON.stringify(categories)); }
  if (include_in_notifications !== undefined) { updates.push('include_in_notifications = ?'); values.push(include_in_notifications ? 1 : 0); }
  if (priority !== undefined) { updates.push('priority = ?'); values.push(priority); }

  if (updates.length > 0) {
    values.push(id);
    db.prepare(`UPDATE user_affirmations SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }

  const updated = db.prepare('SELECT * FROM user_affirmations WHERE id = ?').get(id) as any;
  res.json({
    affirmation: {
      ...updated,
      categories: JSON.parse(updated.categories || '[]'),
      include_in_notifications: Boolean(updated.include_in_notifications),
    },
  });
});

// Delete user affirmation
router.delete('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const { id } = req.params;

  const existing = db.prepare('SELECT * FROM user_affirmations WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Affirmation not found' });
  }

  db.prepare('DELETE FROM user_affirmations WHERE id = ?').run(id);
  res.json({ success: true });
});

export default router;