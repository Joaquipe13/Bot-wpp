import DatabaseManager from '../db/database';
import Topero from './topero';

class Final {
  fecha: Date;
  materia: string;
  nota: number;
  topero: Topero;
  puntos: number;

  constructor(fecha: Date, topero: Topero, materia: string, nota: number) {
    this.fecha = fecha;
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
		await db.execute(
			`INSERT INTO finales (fecha, nota, materia, puntos, topero_id) VALUES (?, ?, ?, ?, ?)`,
			[this.fecha.toISOString().slice(0, 10), this.nota, this.materia.trim(), this.puntos, this.topero.id]
		);

	}
  
}
export default Final;