"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopAntipala = void 0;
const topero_1 = require("./topero");
const utils_1 = require("../utils");
const database_1 = __importDefault(require("../db/database"));
const cuatrimestre_1 = require("./cuatrimestre");
class TopAntipala {
    async getDB() {
        const dbManager = await database_1.default.getInstance();
        return dbManager.getDB();
    }
    constructor() {
        this.tops = {};
        this.topList = null;
    }
    refreshTopsList() {
        this.topList = null;
        this.tops = {};
    }
    static getInstance() {
        if (!TopAntipala.instance) {
            TopAntipala.instance = new TopAntipala();
        }
        return TopAntipala.instance;
    }
    async getTopAntipala(period) {
        try {
            if (!period) {
                period = cuatrimestre_1.PeriodManager.resolvePeriodByDate(new Date());
            }
            if (this.tops[period]) {
                return this.tops[period];
            }
            const periodDates = cuatrimestre_1.PeriodManager.getPeriod(period);
            const db = await this.getDB();
            const [rows] = await db.query(`
				SELECT 
					t.name,
					COALESCE(tops.total_top_points, 0) - COALESCE(finals.total_final_points, 0) AS total_points
				FROM toperos t
				LEFT JOIN (
					SELECT topero_id, SUM(points) AS total_top_points
					FROM top_diario_toperos td
					JOIN top_diarios d ON td.top_diario_id = d.id
					WHERE STR_TO_DATE(d.date_top, '%d/%m/%Y') BETWEEN ? AND ?
					GROUP BY topero_id
				) AS tops ON tops.topero_id = t.id
				LEFT JOIN (
					SELECT topero_id, SUM(points) AS total_final_points
					FROM finales
					WHERE date_top BETWEEN ? AND ?
					GROUP BY topero_id
				) AS finals ON finals.topero_id = t.id
				ORDER BY total_points DESC;
				`, [
                periodDates.date_start,
                periodDates.date_end,
                periodDates.date_start,
                periodDates.date_end
            ]);
            const results = rows;
            if (results.length === 0) {
                return `📉 No hay registros aún para el Top Antipala del período ${period}.`;
            }
            const peeriodInfo = period.split("-");
            const anio = peeriodInfo[0];
            const cuatri = peeriodInfo[1] === "1" ? "1er cuatrimestre" : "2do cuatrimestre";
            let mensaje = `🔝 Top Antipala ${cuatri} ${anio}:\n`;
            results.forEach((results, index) => {
                mensaje += `${index + 1}. ${results.name} (${results.total_points} pts)\n`;
            });
            this.tops[period] = mensaje.trim();
            return mensaje.trim();
        }
        catch (error) {
            throw new Error("❌ Error al obtener el Top Antipala.");
        }
    }
    async validarUsuariosExistentes(nombres) {
        const db = await this.getDB();
        if (nombres.length === 0) {
            throw new Error("❌ No ha nadie en el top gil.");
        }
        const placeholders = nombres.map(() => "?").join(",");
        const query = `
			SELECT id, name FROM toperos
			WHERE name IN (${placeholders})
			ORDER BY FIELD(name, ${placeholders})
		`;
        const [rows] = await db.query(query, [...nombres, ...nombres]);
        const results = rows;
        const encontrados = results.map((results) => new topero_1.Topero(results.id, results.name));
        const encontradosSet = new Set(encontrados.map((topero) => (0, utils_1.capitalize)(topero.name)));
        const faltantes = nombres.filter((name) => !encontradosSet.has((0, utils_1.capitalize)(name)));
        if (faltantes.length > 0) {
            throw new Error(`❌ Flasheaste cualquiera con: ${faltantes.join(", ")}.\nEscribi bien mogolico.`);
        }
        console.log(encontrados);
        return encontrados;
    }
    async getTopsList() {
        if (this.topList) {
            return this.topList;
        }
        const db = await this.getDB();
        const [rows] = await db.query(`
			SELECT 
			CONCAT(
				'Top antipala del dia ', d.date_top, ':\n',
				GROUP_CONCAT(CONCAT(dt.posicion, ' ', t.name) ORDER BY dt.posicion SEPARATOR '\n')
			) AS top_texto
			FROM top_diario_toperos dt
			JOIN top_diarios d ON d.id = dt.top_diario_id
			JOIN toperos t ON t.id = dt.topero_id
			GROUP BY d.date_top
			ORDER BY d.date_top DESC
		`);
        const results = rows.map((row) => row.top_texto);
        if (results.length === 0) {
            throw new Error("📉 No hay registros aún para el Top Antipala del día.");
        }
        const allTopsList = results.join("\n\n");
        this.topList = allTopsList;
        return allTopsList;
    }
    async getTopAntipalaByDate(date_top) {
        const db = await this.getDB();
        const dateParsed = (0, utils_1.parseDate)(date_top);
        const [rows] = await db.query(`
			SELECT 
			t.name,
			dt.points
			FROM top_diario_toperos dt
			JOIN top_diarios d ON d.id = dt.top_diario_id
			JOIN toperos t ON t.id = dt.topero_id
			WHERE d.date_top = ?
			ORDER BY dt.posicion;
		`, [dateParsed.toISOString().split("T")[0]]);
        if (rows.length === 0) {
            return `📉 No hay registros para el Top Antipala del ${dateParsed.toISOString().split("T")[0]}.`;
        }
        let mensaje = `🔝 Top Antipala del ${dateParsed.toISOString().split("T")[0]}:\n`;
        rows.forEach((row, index) => {
            mensaje += `${index + 1}. ${row.name} (${row.points} pts)\n`;
        });
        return mensaje.trim();
    }
}
exports.TopAntipala = TopAntipala;
