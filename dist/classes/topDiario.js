"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopDiario = void 0;
const database_1 = __importDefault(require("../db/database"));
class TopDiario {
    constructor(date_top, toperos) {
        this.date_top = date_top.toISOString().slice(0, 10);
        this.toperos = toperos;
    }
    async save() {
        const dbManager = await database_1.default.getInstance();
        const pool = dbManager.getDB();
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();
            const [result] = await conn.execute(`INSERT INTO top_diarios (date_top) VALUES (?)`, [this.date_top]);
            const topDiarioId = result.insertId;
            const topLength = this.toperos.length;
            for (let i = 0; i < topLength; i++) {
                const topero = this.toperos[i];
                await conn.execute(`INSERT INTO top_diario_toperos (top_diario_id, topero_id, posicion, points) VALUES (?, ?, ?, ?)`, [topDiarioId, topero.id, i + 1, topLength - i]);
            }
            await conn.commit();
        }
        catch (error) {
            await conn.rollback();
            console.error("❌ Error en transacción:", error);
            throw new Error("❌ Error guardando TopDiario, suerte la próxima.");
        }
        finally {
            conn.release(); // 🔓 Importantísimo para liberar la conexión al pool
        }
    }
    static async delete(date) {
        const dbManager = await database_1.default.getInstance();
        const pool = dbManager.getDB();
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();
            const [rows] = await conn.execute(`SELECT id FROM top_diarios WHERE date_top = ?`, [date]);
            if (rows.length === 0) {
                throw new Error(`🔎 No se encontró top_diario con fecha ${date}`);
            }
            const topDiarioId = rows[0].id;
            await conn.execute(`DELETE FROM top_diario_toperos WHERE top_diario_id = ?`, [topDiarioId]);
            await conn.execute(`DELETE FROM top_diarios WHERE id = ?`, [topDiarioId]);
            await conn.commit();
            console.log(`🗑️ TopDiario del ${date} eliminado exitosamente.`);
        }
        catch (error) {
            await conn.rollback();
            console.error("❌ Error al eliminar TopDiario:", error);
            throw new Error("❌ Error eliminando el TopDiario. Que no se repita.");
        }
        finally {
            conn.release();
        }
    }
}
exports.TopDiario = TopDiario;
