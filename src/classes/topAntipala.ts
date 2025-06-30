
import  {Topero}  from "./topero";
import {capitalize, parseDate} from "../utils";
import DatabaseManager from "../db/database";
import { RowDataPacket } from "mysql2";

export class TopAntipala {

	private static instance: TopAntipala;
	private top: string | null = null;
	private topList: string | null = null;
	private async getDB() {
		const dbManager = await DatabaseManager.getInstance();
		return dbManager.getDB();
	}
	private constructor() {}
	public refreshTopsList(): void {
		this.topList = null;
		this.top = null;
	}
	public static getInstance(): TopAntipala {
		if (!TopAntipala.instance) {
			TopAntipala.instance = new TopAntipala();
		}
		return TopAntipala.instance;
		}

	public async getTopAntipala(): Promise<string> {
		try {
			if (this.top) {
				return this.top;
			}
			const db = await this.getDB();
			const [rows] = await db.query<RowDataPacket[]>(`
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
			const results = rows as Array<{ name: string; total_points: number }>;
			if (results.length === 0) {
				return "📉 No hay registros aún para el Top Antipala.";
			}

			let mensaje = "🔝 Top Antipala:\n";
			results.forEach((results, index) => {
				mensaje += `${index + 1}. ${results.name} (${results.total_points} pts)\n`;
			});
			this.top = mensaje.trim();
			return mensaje.trim();
		} catch (error: any) {
			console.error("Error al obtener el Top Antipala:", error);
			throw new Error("❌ Error al obtener el Top Antipala.");
		}
	}


	public async validarUsuariosExistentes(nombres: string[]): Promise<Topero[]> {
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
		const [rows] = await db.query<RowDataPacket[]>(query, [...nombres, ...nombres]);
		const results = rows as Array<{  id: number; name: string}>;

		const encontrados = results.map((results) => new Topero(results.id, results.name));


		const encontradosSet = new Set(
			encontrados.map((topero:Topero) => capitalize(topero.name))
		);

		const faltantes = nombres.filter(
			(name) => !encontradosSet.has(capitalize(name))
		);

		if (faltantes.length > 0) {
			throw new Error(`❌ Flasheaste cualquiera con: ${faltantes.join(", ")}.\nEscribi bien mogolico.`);
		}
		console.log(encontrados);
		return encontrados;
		}
	public async getTopsList(): Promise<string> {
		if (this.topList) {
			return this.topList;
		}
		const db = await this.getDB();
		const [rows] = await db.query<RowDataPacket[]>(`
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
		const results = rows.map((row) => row.top_texto as string);
		if (results.length === 0) {
			throw new Error( "📉 No hay registros aún para el Top Antipala del día.")
		}
		const allTopsList: string = results.join("\n\n");
		this.topList = allTopsList;
		return allTopsList
	}
	public async getTopAntipalaByDate(date_top: string): Promise<string> {
		const db = await this.getDB();
		const dateParsed = parseDate(date_top);
		const [rows] = await db.query<RowDataPacket[]>(`
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