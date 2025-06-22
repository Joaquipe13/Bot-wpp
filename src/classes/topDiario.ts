import Topero from './topero';
import DatabaseManager from '../db/database';
import type { OkPacket } from 'mysql2';


class TopDiario {
  fecha: string;
  toperos: Topero[];

  constructor(fecha: Date, toperos: Topero[]) {
    this.fecha = fecha.toISOString().slice(0, 10);
    this.toperos = toperos;
	}
	async save(): Promise<void> {
		try {
			const dbManager = await DatabaseManager.getInstance();
			const db = dbManager.getDB();
			await db.beginTransaction();
			const [result] = await db.execute<OkPacket>(
				`INSERT INTO top_diarios (fecha) VALUES (?)`,
				[this.fecha]
			);
			const topDiarioId = result.insertId;
			const topLength = this.toperos.length;
			for (let i = 0; i < topLength; i++) {
				const topero = this.toperos[i];
				await db.execute(
				`INSERT INTO top_diario_toperos (top_diario_id, topero_id, posicion, puntos) VALUES (?, ?, ?, ?)`,
				[topDiarioId, topero.id, i + 1, topLength - i]
				);
			}
			await db.commit();
			return; 

		}catch (error) {
			if(error instanceof Error) {
				console.log(error.message);
			}
			throw new Error(`❌ Error guardando TopDiario, suerte la proxima.`);
		}
	}
}

export default TopDiario;