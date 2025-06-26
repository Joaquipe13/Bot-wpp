import mysql, { Pool } from "mysql2/promise";
import dotenv from 'dotenv';

dotenv.config();

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE, RETRY_DELAY, DB_INIT } = process.env;

class DatabaseManager {
	private static instance: DatabaseManager;
	private pool: Pool;
	private retryDelay: number;

	private constructor(pool: Pool, retryDelay: number = 2000) {
		this.pool = pool;
		this.retryDelay = Number(RETRY_DELAY) || retryDelay;
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

			const initDBFlag: boolean =  DB_INIT === "true" || false

			const instance = new DatabaseManager(pool, Number(RETRY_DELAY));

			if (initDBFlag) {
				const tempConnection = await mysql.createConnection({
					host: DB_HOST,
					port: parseInt(DB_PORT || "3306", 10),
					user: DB_USER,
					password: DB_PASSWORD,
				});
				await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_DATABASE}\`;`);
				await tempConnection.end();
				await instance.createTables();
			}

			DatabaseManager.instance = instance;
		}

		await DatabaseManager.instance.ensureConnection();

		return DatabaseManager.instance;
	}

	private async reconnectPool() {
		let retries = 5;
		while (retries > 0) {
			try {
				// Cerramos el pool viejo (importante)
				await this.pool.end();
				// Creamos un nuevo pool
				this.pool = mysql.createPool({
					host: DB_HOST,
					port: parseInt(DB_PORT || "3306", 10),
					user: DB_USER,
					password: DB_PASSWORD,
					database: DB_DATABASE,
					waitForConnections: true,
					connectionLimit: 10,
					queueLimit: 0,
				});
				console.log("✅ Pool reconectado!");
				break;
			} catch {
				retries--;
				console.warn(`Intento de reconexión fallido. Reintentando en 3s... (${retries} intentos restantes)`);
				await new Promise(res => setTimeout(res, 3000));
			}
		}

		if (retries === 0) {
			console.error("❌ No se pudo reconectar el pool de base de datos.");
			process.exit(1);
		}
	}


	public async query(sql: string, params?: any[]) {
		let retries = 3;
		while (retries > 0) {
			try {
				return await this.pool.query(sql, params);
			} catch (err: any) {
				if (err.code === 'PROTOCOL_CONNECTION_LOST') {
					console.warn("Conexión perdida durante query, reintentando...");
					await this.reconnectPool();
					retries--;
				} else {
					throw err;
				}
			}
		}
		throw new Error("No se pudo completar la query después de varios intentos.");
	}
	public async execute(sql: string, params?: any[]) {
		let retries = 3;
		while (retries > 0) {
			try {
				return await this.pool.execute(sql, params);
			} catch (error: any) {
				if (error.code === 'PROTOCOL_CONNECTION_LOST' || error.code === 'ECONNRESET') {
				console.warn("Conexión perdida en execute, recreando pool y reintentando...");
				await this.reconnectPool();
				retries--;
				} else {
				throw error;
				}
			}
		}
		throw new Error("No se pudo completar el execute después de varios intentos.");
	}

	private async ensureConnection() {
		let retries = 5;
		let connected = false;

		while (retries > 0 && !connected) {
			try {
				const tempConn = await this.pool.getConnection();
				await tempConn.ping();
				tempConn.release();
				connected = true;
			} catch (err: any) {
				if (err.code === 'ECONNREFUSED') {
					console.warn("😴 Base dormida. Reintentando en 3s...");
					await new Promise((res) => setTimeout(res, this.retryDelay));
					retries--;
				} else {
					throw err;
				}
			}
		}

		if (!connected) {
			throw new Error("❌ No se pudo conectar a la base de datos. Intentalo de nuevo en unos segundos.");
		}
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

