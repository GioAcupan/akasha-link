import * as SQLite from 'expo-sqlite';

export interface SessionQueueItem {
  sessionId: string;
  timestamp: string;
  domain: string;
  mocs: string[];
  imagePaths: string[]; // local URIs
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  error?: string;
}

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export const getDb = async () => {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('akasha.db');
  }
  const db = await dbPromise;
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS session_queue (
      sessionId TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      domain TEXT NOT NULL,
      mocs TEXT NOT NULL,
      imagePaths TEXT NOT NULL,
      status TEXT NOT NULL,
      error TEXT
    );
  `);
  return db;
};

export const addSession = async (session: SessionQueueItem) => {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO session_queue (sessionId, timestamp, domain, mocs, imagePaths, status, error) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      session.sessionId,
      session.timestamp,
      session.domain,
      JSON.stringify(session.mocs),
      JSON.stringify(session.imagePaths),
      session.status,
      session.error || null,
    ]
  );
};

export const getPendingSessions = async (): Promise<SessionQueueItem[]> => {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    sessionId: string;
    timestamp: string;
    domain: string;
    mocs: string;
    imagePaths: string;
    status: string;
    error: string | null;
  }>(`SELECT * FROM session_queue WHERE status IN ('pending', 'uploading', 'failed')`);
  
  return rows.map(row => ({
    sessionId: row.sessionId,
    timestamp: row.timestamp,
    domain: row.domain,
    mocs: JSON.parse(row.mocs),
    imagePaths: JSON.parse(row.imagePaths),
    status: row.status as any,
    error: row.error || undefined,
  }));
};

export const updateSessionStatus = async (
  sessionId: string,
  status: SessionQueueItem['status'],
  error?: string
) => {
  const db = await getDb();
  await db.runAsync(
    `UPDATE session_queue SET status = ?, error = ? WHERE sessionId = ?`,
    [status, error || null, sessionId]
  );
};
