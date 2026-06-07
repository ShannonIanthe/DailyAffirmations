import { Router, Request, Response } from 'express';
import { getDb } from '../db';

type Category = 'finance' | 'love' | 'career' | 'health' | 'mindset';

const router = Router();

// Update user profile
router.put('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const { id } = req.params;
  const { name, selected_categories, notification_frequency } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const updates: string[] = [];
  const values: any[] = [];

  if (name !== undefined) { updates.push('name = ?'); values.push(name); }
  if (selected_categories !== undefined) {
    updates.push('selected_categories = ?');
    values.push(JSON.stringify(selected_categories));
  }
  if (notification_frequency !== undefined) {
    updates.push('notification_frequency = ?');
    values.push(notification_frequency);
  }

  if (updates.length > 0) {
    values.push(id);
    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }

  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  res.json({
    user: {
      ...updated,
      selected_categories: JSON.parse(updated.selected_categories || '[]'),
    },
  });
});

// Reset streak
router.post('/:id/reset-streak', (req: Request, res: Response) => {
  const db = getDb();
  const { id } = req.params;

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  db.prepare('UPDATE users SET streak_count = 0 WHERE id = ?').run(id);
  res.json({ success: true, streak_count: 0 });
});

export default router;