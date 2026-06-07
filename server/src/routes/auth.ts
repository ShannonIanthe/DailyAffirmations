import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Login (simple MVP — email-based)
router.post('/login', (req: Request, res: Response) => {
  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const db = getDb();
  let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

  if (!user) {
    // Create new user
    const id = uuidv4();
    const displayName = name || email.split('@')[0];
    db.prepare(
      'INSERT INTO users (id, name, email) VALUES (?, ?, ?)'
    ).run(id, displayName, email);

    user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  }

  res.json({ user: formatUser(user) });
});

// Guest login
router.post('/guest', (_req: Request, res: Response) => {
  const db = getDb();
  const id = uuidv4();
  const guestEmail = `guest-${id.slice(0, 8)}@daily-affirm.app`;

  db.prepare(
    'INSERT INTO users (id, name, email) VALUES (?, ?, ?)'
  ).run(id, 'Guest', guestEmail);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  res.json({ user: formatUser(user) });
});

// Get user by ID
router.get('/user/:id', (req: Request, res: Response) => {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id) as any;

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ user: formatUser(user) });
});

function formatUser(user: any) {
  return {
    ...user,
    selected_categories: JSON.parse(user.selected_categories || '[]'),
  };
}

export default router;