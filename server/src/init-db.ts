import { initializeDatabase } from './db';

console.log('Initializing database...');
initializeDatabase();
console.log('Database initialized successfully.');

// Run seed too
import('./seed').catch(console.error);