import DatabaseManager from '../db/database';
import Topero from './topero';

class Final {
  date: Date;
  materia: string;
  nota: number;
  topero: Topero;
  puntos: number;

  constructor(date: Date, topero: Topero, materia: string, nota: number) {
    this.date = date;
    this.topero = topero;
    this.materia = materia;
    this.nota = nota;
	this.puntos = this.calculatePoints();
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
			`INSERT INTO finales (date, nota, materia, puntos, topero_id) VALUES (?, ?, ?, ?, ?)`,
			[
				this.date.toISOString().slice(0, 10),
				this.nota,
				this.materia.trim(),
				this.puntos,
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