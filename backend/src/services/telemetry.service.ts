import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

export interface MachineStatus {
  machine_name: string;
  ip: string | null;
  active_user: string | null;
  last_seen: number;
}

class TelemetryService {
  private dbPromise: Promise<Database>;

  constructor() {
    this.dbPromise = this.initDb();
  }

  private async initDb(): Promise<Database> {
    const dbPath = path.join(__dirname, '../../telemetry.sqlite');
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS telemetry (
        machine_name TEXT PRIMARY KEY,
        ip TEXT,
        active_user TEXT,
        last_seen INTEGER
      )
    `);

    return db;
  }

  async registerHeartbeat(machineName: string, ip: string | null, activeUser: string | null): Promise<void> {
    const db = await this.dbPromise;
    const now = Date.now();
    
    await db.run(
      `INSERT INTO telemetry (machine_name, ip, active_user, last_seen)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(machine_name) DO UPDATE SET
         ip = excluded.ip,
         active_user = excluded.active_user,
         last_seen = excluded.last_seen`,
      [machineName.toLowerCase(), ip, activeUser, now]
    );
  }

  async getMachineStatus(machineName: string): Promise<MachineStatus | undefined> {
    const db = await this.dbPromise;
    return db.get<MachineStatus>(
      `SELECT * FROM telemetry WHERE machine_name = ?`,
      [machineName.toLowerCase()]
    );
  }

  async isMachineOnline(machineName: string): Promise<boolean> {
    const status = await this.getMachineStatus(machineName);
    if (!status) return false;

    const FIFTEEN_MINUTES = 15 * 60 * 1000;
    return (Date.now() - status.last_seen) <= FIFTEEN_MINUTES;
  }

  async getActiveUserForMachine(machineName: string): Promise<string | null> {
    const status = await this.getMachineStatus(machineName);
    if (!status) return null;

    const FIFTEEN_MINUTES = 15 * 60 * 1000;
    if ((Date.now() - status.last_seen) > FIFTEEN_MINUTES) {
      return null; // User is not active if the machine is offline
    }

    return status.active_user;
  }

  async getActiveMachineForUser(username: string): Promise<string | null> {
    const db = await this.dbPromise;
    const FIFTEEN_MINUTES = 15 * 60 * 1000;
    const cutoff = Date.now() - FIFTEEN_MINUTES;

    const result = await db.get<{ machine_name: string }>(
      `SELECT machine_name FROM telemetry WHERE LOWER(active_user) = ? AND last_seen >= ? ORDER BY last_seen DESC LIMIT 1`,
      [username.toLowerCase(), cutoff]
    );

    return result ? result.machine_name : null;
  }
}

export const telemetryService = new TelemetryService();
