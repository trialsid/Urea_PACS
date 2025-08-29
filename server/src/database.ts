import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('📁 Created data directory:', dataDir);
}

const dbPath = path.join(dataDir, 'urea_pacs.db');
console.log('📄 Database path:', dbPath);

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

export const initializeDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create farmers table
      db.run(`
        CREATE TABLE IF NOT EXISTS farmers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          aadhaar TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create farmers table if it doesn't exist
      db.run(`
        CREATE TABLE IF NOT EXISTS farmers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          aadhaar TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          village TEXT NOT NULL,
          contact TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create simplified orders table (cash only, always paid)
      db.run(`
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          farmer_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 2,
          unit_price REAL NOT NULL DEFAULT 268.0,
          total_amount REAL NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (farmer_id) REFERENCES farmers (id)
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database initialized successfully');
          resolve();
        }
      });
    });
  });
};

export const closeDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};