"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE, RETRY_DELAY, DB_INIT } = process.env;
class DatabaseManager {
    constructor(pool, retryDelay = 2000, initDB = true) {
        this.pool = pool;
        this.retryDelay = Number(RETRY_DELAY) || retryDelay;
        this.initDB = initDB;
    }
    static async getInstance() {
        try {
            if (!DatabaseManager.instance) {
                const pool = promise_1.default.createPool({
                    host: DB_HOST,
                    port: parseInt(DB_PORT || "3306", 10),
                    user: DB_USER,
                    password: DB_PASSWORD,
                    database: DB_DATABASE,
                    waitForConnections: true,
                    connectionLimit: 10,
                    queueLimit: 0,
                });
                const initDBFlag = DB_INIT === 'true';
                const instance = new DatabaseManager(pool, Number(RETRY_DELAY), initDBFlag);
                if (initDBFlag) {
                    const tempConnection = await promise_1.default.createConnection({
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
        catch (err) {
            console.error("💥 Error creando DatabaseManager:", err);
            throw new Error("❌ No se pudo inicializar la base de datos. Verificá la conexión y la configuración.");
        }
    }
    async ensureConnection() {
        let retries = 5;
        let connected = false;
        while (retries > 0 && !connected) {
            try {
                const tempConn = await this.pool.getConnection();
                await tempConn.ping();
                tempConn.release();
                connected = true;
            }
            catch (err) {
                if (err.code === 'ECONNREFUSED') {
                    console.warn("😴 Base dormida. Reintentando en 3s...");
                    await new Promise((res) => setTimeout(res, this.retryDelay));
                    retries--;
                }
                else {
                    throw err;
                }
            }
        }
        if (!connected) {
            throw new Error("❌ No se pudo conectar a la base de datos. Intentalo de nuevo en unos segundos.");
        }
    }
    async createTables() {
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
        }
        finally {
            conn.release();
        }
    }
    getDB() {
        return this.pool;
    }
}
exports.default = DatabaseManager;
