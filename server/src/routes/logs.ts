import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Log a shown affirmation
router.post('/', (req: Request, res: Response) => {
  const db = getDb();
  const { user_id, affirmation_id, source } = req.body;

  if (!user_id || !affirmation_id) {
    return res.status(400).json({ error: 'user_id and affirmation_id are required' });
  }

  const id = uuidv4();
  const src = source || 'system';

  db.prepare(
    'INSERT INTO user_logs (id, user_id, affirmation_id, source) VALUES (?, ?, ?, ?)'
  ).run(id, user_id, affirmation_id, src);

  // Update user streak
  const today = new Date().toISOString().split('T')[0];
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(user_id) as any;

  if (user) {
    if (user.last_active_date !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = 0;
      if (user.last_active_date === yesterdayStr) {
        newStreak = user.streak_count + 1;
      } else if (user.last_active_date !== today) {
        newStreak = 1;
      } else {
        newStreak = user.streak_count;
      }

      db.prepare(
        'UPDATE users SET streak_count = ?, last_active_date = ? WHERE id = ?'
      ).run(newStreak, today, user_id);
    }
  }

  res.status(201).json({ id, success: true });
});

// Get logs for a user
router.get('/:userId', (req: Request, res: Response) => {
  const db = getDb();
  const { userId } = req.params;
  const { limit } = req.query;

  const query = 'SELECT * FROM user_logs WHERE user_id = ? ORDER BY shown_at DESC';
  const logs = limit
    ? db.prepare(`${query} LIMIT ?`).all(userId, Number(limit))
    : db.prepare(query).all(userId);

  res.json({ logs });
});

export default router;