import DatabaseManager from '../db/database';
import Topero from './topero';

class Final {
  date_top: Date;
  materia: string;
  nota: number;
  topero: Topero;
  points: number;

  constructor(date_top: Date, topero: Topero, materia: string, nota: number) {
    this.date_top = date_top;
    this.topero = topero;
    this.materia = materia;
    this.nota = nota;
	this.points = this.calculatePoints();
  }
	private async getDB() {
			const dbManager = await DatabaseManager.getInstance();
			return dbManager.getDB();
		}
  calculatePoints(): number {
		if (this.nota >= 10) {
		return 5;
		} else if (this.nota >= 8) {
		return 4;
		} else if (this.nota >= 6) {
		return 3;
		} else {
		return 1;
		}
	}
	async save():Promise<void> {
		const db = await this.getDB();
		try {
			await db.execute(
			`INSERT INTO finales (date_top, nota, materia, puntos, topero_id) VALUES (?, ?, ?, ?, ?)`,
			[
				this.date_top.toISOString().slice(0, 10),
				this.nota,
				this.materia.trim(),
				this.points,
				this.topero.id,
			]
			);
		} catch (error) {
			console.error("❌ Error al guardar el final:", error);
			throw new Error("No se pudo guardar el final.");
		}
	}
  
}
export default Final;