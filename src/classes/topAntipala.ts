
import  Topero  from "../classes/topero";
import capitalize from "../utils/capitalize";
import DatabaseManager from "../db/database";

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

  const rows = await db.all(`
    SELECT t.name, SUM(tdt.puntos) AS total_points
    FROM top_diario_toperos tdt
    JOIN toperos t ON tdt.topero_id = t.id
    GROUP BY tdt.topero_id
    ORDER BY total_points DESC;
  `);
  if (rows.length === 0) {
    return "📉 No hay registros aún para el Top Antipala.";
  }

  let mensaje = "🔝 Top Antipala:\n";
  rows.forEach((row, index) => {
    mensaje += `${index + 1}. ${row.name} (${row.total_points} pts)\n`;
  });

  return mensaje.trim();
}


  public async validarUsuariosExistentes(nombres: string[]): Promise<Topero[]> {
    const db = await this.getDB();
    if (nombres.length === 0) {
      throw new Error("❌ No ha nadie en el top gil.");
    }

    const placeholders = nombres.map(() => "?").join(",");
    const rows = await db.all(
      `SELECT id, name FROM toperos WHERE name IN (${placeholders})`,
      nombres
    );

    const encontrados = rows.map((row: any) => new Topero(row.id, row.name));

    
    const encontradosSet = new Set(
      encontrados.map((topero:Topero) => capitalize(topero.name))
    );

    const faltantes = nombres.filter(
      (name) => !encontradosSet.has(capitalize(name))
    );

    if (faltantes.length > 0) {
      throw new Error(`❌ Flasheaste cualquiera con: ${faltantes.join(", ")}.\nEscribi bien mogolico.`);
    }
    return encontrados;
  }


}
export default TopAntipala;