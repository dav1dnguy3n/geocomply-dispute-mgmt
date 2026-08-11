import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const dbPath = path.join(process.cwd(), 'data.db');
const db = new Database(dbPath);

// Create tables if not exist
db.exec(`
  CREATE TABLE IF NOT EXISTS disputes (
    case_id TEXT PRIMARY KEY,
    user_id TEXT,
    user_email TEXT,
    device_id TEXT,
    amount REAL,
    currency TEXT,
    created_at DATETIME,
    region TEXT,
    status TEXT,
    outcome TEXT,
    outcome_note TEXT
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id TEXT,
    old_outcome TEXT,
    new_outcome TEXT,
    note TEXT,
    changed_at DATETIME,
    FOREIGN KEY(case_id) REFERENCES disputes(case_id)
  );
`);

let seedingPromise: Promise<void> | null = null;

export async function ensureDbSeeded() {
  if (seedingPromise) return seedingPromise;

  seedingPromise = (async () => {
    const count = db.prepare('SELECT COUNT(*) as count FROM disputes').get() as { count: number };
    if (count.count > 0) return;

    const seedPath = path.join(process.cwd(), 'seed_dataset.csv');
    if (!fs.existsSync(seedPath)) return;

    return new Promise<void>((resolve, reject) => {
      const results: any[] = [];
      fs.createReadStream(seedPath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          // INSERT OR IGNORE avoids crashing on "Duplicate case_id canary"
          const insert = db.prepare(`
            INSERT OR IGNORE INTO disputes (case_id, user_id, user_email, device_id, amount, currency, created_at, region, status, outcome, outcome_note)
            VALUES (@case_id, @user_id, @user_email, @device_id, @amount, @currency, @created_at, @region, @status, @outcome, @outcome_note)
          `);
          const insertMany = db.transaction((cases) => {
            for (const c of cases) {
              insert.run(c);
            }
          });
          insertMany(results);
          console.log('Database seeded from seed_dataset.csv');
          resolve();
        })
        .on('error', reject);
    });
  })();

  return seedingPromise;
}

export default db;
