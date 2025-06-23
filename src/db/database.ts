import mysql, { Pool } from "mysql2/promise";
import dotenv from 'dotenv';

dotenv.config();

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE } = process.env;

class DatabaseManager {
  private static instance: DatabaseManager;
  private pool: Pool;

  private constructor(pool: Pool) {
    this.pool = pool;
  }

  public static async getInstance(): Promise<DatabaseManager> {
    if (!DatabaseManager.instance) {
      const pool = mysql.createPool({
        host: DB_HOST,
        port: parseInt(DB_PORT || "3306", 10),
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_DATABASE,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

      // Aseguramos existencia de la DB (opcional, ya debería existir)
      const tempConnection = await mysql.createConnection({
        host: DB_HOST,
        port: parseInt(DB_PORT || "3306", 10),
        user: DB_USER,
        password: DB_PASSWORD,
      });
      await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_DATABASE}\`;`);
      await tempConnection.end();

      const instance = new DatabaseManager(pool);
      await instance.createTables(); // crea las tablas
      DatabaseManager.instance = instance;
    }
    return DatabaseManager.instance;
  }

  private async createTables() {
    const conn = await this.pool.getConnection();
    try {
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS top_diarios (
          id INT AUTO_INCREMENT PRIMARY KEY,
          date_top VARCHAR(255) NOT NULL
        );
      `);
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS toperos (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE
        );
      `);
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS top_diario_toperos (
          id INT AUTO_INCREMENT PRIMARY KEY,
          top_diario_id INT NOT NULL,
          topero_id INT NOT NULL,
          posicion INT NOT NULL,
          points INT NOT NULL,
          FOREIGN KEY (top_diario_id) REFERENCES top_diarios(id),
          FOREIGN KEY (topero_id) REFERENCES toperos(id)
        );
      `);
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS finales (
          id INT AUTO_INCREMENT PRIMARY KEY,
          topero_id INT NOT NULL,
          date_top DATE NOT NULL,
          nota INT NOT NULL,
          materia VARCHAR(255) NOT NULL,
          points INT NOT NULL,
          FOREIGN KEY (topero_id) REFERENCES toperos(id)
        );
      `);
    } finally {
      conn.release();
    }
  }

  public getDB(): Pool {
    return this.pool;
  }
}

export default DatabaseManager;

