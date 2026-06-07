import { Router, Request, Response } from 'express';
import { getDb } from '../db';

const router = Router();

// Get all system affirmations (optionally filtered by category)
router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const { category } = req.query;

  let affirmations;
  if (category && typeof category === 'string') {
    affirmations = db.prepare(
      'SELECT * FROM affirmations WHERE category = ? ORDER BY id'
    ).all(category);
  } else {
    affirmations = db.prepare('SELECT * FROM affirmations ORDER BY category, id').all();
  }

  res.json({ affirmations });
});

// Get a random affirmation for a given set of categories
router.get('/random', (req: Request, res: Response) => {
  const db = getDb();
  const { categories, excludeIds } = req.query;

  let categoryList: string[];
  try {
    categoryList = categories ? JSON.parse(categories as string) : [];
  } catch {
    categoryList = [];
  }

  let excludeList: number[] = [];
  try {
    excludeList = excludeIds ? JSON.parse(excludeIds as string).map(Number) : [];
  } catch {
    excludeList = [];
  }

  if (categoryList.length === 0) {
    categoryList = ['finance', 'love', 'career', 'health', 'mindset'];
  }

  const placeholders = categoryList.map(() => '?').join(',');
  const query = `SELECT * FROM affirmations WHERE category IN (${placeholders}) ORDER BY RANDOM() LIMIT 1`;
  const affirmation = db.prepare(query).get(...categoryList) as any;

  if (!affirmation) {
    return res.status(404).json({ error: 'No affirmations found' });
  }

  res.json({ affirmation });
});

// Get affirmations by category with counts
router.get('/counts', (_req: Request, res: Response) => {
  const db = getDb();
  const counts = db.prepare(
    'SELECT category, COUNT(*) as count FROM affirmations GROUP BY category'
  ).all();

  res.json({ counts });
});

export default router;