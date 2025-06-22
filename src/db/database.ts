import mysql from "mysql2/promise";
import dotenv from 'dotenv';

dotenv.config();

const {DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE} = process.env;

class DatabaseManager {
  private static instance: DatabaseManager;
  private connection: mysql.Connection | null = null;

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
      DatabaseManager.instance.connection?.end();
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  private async init() {
    console.log("➡️ Intentando conectar con:", {
			host: DB_HOST,
			port: DB_PORT,
			user: DB_USER,
			database: DB_DATABASE,
			password: DB_PASSWORD ? "********" : "no password provided",
		});
	try {
		
      	this.connection = await mysql.createConnection({
			host: DB_HOST,
			port: parseInt(DB_PORT || "3306", 10),
			user: DB_USER,
			password: DB_PASSWORD,
			database: DB_DATABASE,
		});
	  

      await this.connection.execute(`
        CREATE TABLE IF NOT EXISTS top_diarios (
          id INT AUTO_INCREMENT PRIMARY KEY,
          fecha VARCHAR(255) NOT NULL
        );
      `);

      await this.connection.execute(`
        CREATE TABLE IF NOT EXISTS toperos (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE
        );
      `);

      await this.connection.execute(`
        CREATE TABLE IF NOT EXISTS top_diario_toperos (
          id INT AUTO_INCREMENT PRIMARY KEY,
          top_diario_id INT NOT NULL,
          topero_id INT NOT NULL,
          posicion INT NOT NULL,
          puntos INT NOT NULL,
          FOREIGN KEY (top_diario_id) REFERENCES top_diarios(id),
          FOREIGN KEY (topero_id) REFERENCES toperos(id)
        );
      `);
    }catch (error) {
  		console.error("❌ Error conectando a la base de datos:", error);
  		throw error; // o no lo tires, y dejá que se maneje más arriba
	}
  }

  public getDB(): mysql.Connection {
    if (!this.connection) {
      throw new Error("❌ Database no inicializada.");
    }
    return this.connection;
  }
}

export default DatabaseManager;
