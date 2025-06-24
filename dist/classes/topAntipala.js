"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopAntipala = void 0;
const topero_1 = require("./topero");
const utils_1 = require("../utils");
const database_1 = __importDefault(require("../db/database"));
class TopAntipala {
    async getDB() {
        const dbManager = await database_1.default.getInstance();
        return dbManager.getDB();
    }
    constructor() { }
    static getInstance() {
        if (!TopAntipala.instance) {
            TopAntipala.instance = new TopAntipala();
        }
        return TopAntipala.instance;
    }
    async getTopAntipala() {
        const db = await this.getDB();
        const [rows] = await db.query(`
    SELECT 
	t.name,
	COALESCE(tops.total_top_points, 0) - COALESCE(finals.total_final_points, 0) AS total_points
	FROM toperos t
	LEFT JOIN (
	SELECT topero_id, SUM(points) AS total_top_points
	FROM top_diario_toperos
	GROUP BY topero_id
	) AS tops ON tops.topero_id = t.id
	LEFT JOIN (
	SELECT topero_id, SUM(points) AS total_final_points
	FROM finales
	GROUP BY topero_id
	) AS finals ON finals.topero_id = t.id
	ORDER BY total_points DESC;
  `);
        const results = rows;
        if (results.length === 0) {
            return "📉 No hay registros aún para el Top Antipala.";
        }
        let mensaje = "🔝 Top Antipala:\n";
        results.forEach((results, index) => {
            mensaje += `${index + 1}. ${results.name} (${results.total_points} pts)\n`;
        });
        return mensaje.trim();
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
        return rows.map((row) => row.top_texto);
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
