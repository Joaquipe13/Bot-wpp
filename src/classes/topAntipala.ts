
import  Topero  from "../classes/topero";
import capitalize from "../utils/capitalize";
import DatabaseManager from "../db/database";
import { RowDataPacket } from "mysql2";

class TopAntipala {
  private static instance: TopAntipala;
    private async getDB() {
        const dbManager = await DatabaseManager.getInstance();
        return dbManager.getDB();
    }
  private constructor() {}

  public static getInstance(): TopAntipala {
    if (!TopAntipala.instance) {
      TopAntipala.instance = new TopAntipala();
    }
    return TopAntipala.instance;
  }

  public async getTopAntipala(): Promise<string> {
  const db = await this.getDB();

  const [rows] = await db.query<RowDataPacket[]>(`
    SELECT 
	t.name,
	COALESCE(tops.total_top_points, 0) - COALESCE(finals.total_final_points, 0) AS total_points
	FROM toperos t
	LEFT JOIN (
	SELECT topero_id, SUM(puntos) AS total_top_points
	FROM top_diario_toperos
	GROUP BY topero_id
	) AS tops ON tops.topero_id = t.id
	LEFT JOIN (
	SELECT topero_id, SUM(puntos) AS total_final_points
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

  return mensaje.trim();
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
  public async getTopsList(): Promise<string[]> {
	const db = await this.getDB();
	const [rows] = await db.query<RowDataPacket[]>(`
		SELECT 
		CONCAT(
			'Top antipala del dia ', d.fecha, ':\n',
			GROUP_CONCAT(CONCAT(dt.posicion, ' ', t.name) ORDER BY dt.posicion SEPARATOR '\n')
		) AS top_texto
		FROM top_diario_toperos dt
		JOIN top_diarios d ON d.id = dt.top_diario_id
		JOIN toperos t ON t.id = dt.topero_id
		GROUP BY d.fecha
		ORDER BY d.fecha DESC
	`);

  	return rows.map((row) => row.top_texto as string);

  }


}
export default TopAntipala;