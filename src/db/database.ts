import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";

class DatabaseManager {
  private static instance: DatabaseManager;
  private db: Database | null = null;

  private constructor() {}

  public static async getInstance(): Promise<DatabaseManager> {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
      await DatabaseManager.instance.init();
    }
    return DatabaseManager.instance;
  }
  public static clearInstance(): DatabaseManager {
    if (DatabaseManager.instance) {
      DatabaseManager.instance.db?.close();
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  private async init() {
    this.db = await open({
      filename: "./bot-database.db",
      driver: sqlite3.Database,
    });

    // Definición de tablas
    await this.db.exec(`

      CREATE TABLE IF NOT EXISTS top_diarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS top_diario_toperos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        top_diario_id INTEGER NOT NULL,
        topero_id INTEGER NOT NULL,
        posicion INTEGER NOT NULL,
        puntos INTEGER NOT NULL,
        FOREIGN KEY(top_diario_id) REFERENCES top_diarios(id),
        FOREIGN KEY(topero_id) REFERENCES scores(id)
      );
      CREATE TABLE IF NOT EXISTS toperos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      );
    `);
  }

  public getDB(): Database {
    if (!this.db) {
      throw new Error("❌ Database no inicializada.");
    }
    return this.db;
  }
}

export default DatabaseManager;
