import Topero from './topero';
import DatabaseManager from '../db/database';
import type { OkPacket } from 'mysql2';


class TopDiario {
  fecha: Date;
  toperos: Topero[];

  constructor(fecha: Date, toperos: Topero[]) {
    this.fecha = fecha;
    this.toperos = toperos;
  }
  private readonly MAX_RETRIES = 3;
  async save(): Promise<void> {
    const dbManager = await DatabaseManager.getInstance();
    const db = dbManager.getDB();

    await db.beginTransaction();

    let attempts = 0;

    while (attempts < this.MAX_RETRIES) {
      try {
        const dbManager = await DatabaseManager.getInstance();
        const db = dbManager.getDB();

        await db.execute("BEGIN TRANSACTION");

        const [result] = await db.execute<OkPacket>(
          `INSERT INTO top_diarios (fecha) VALUES (?)`,
          [this.fecha.toISOString()]
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

      } catch (error) {
        attempts++;
        try {
          const dbManager = await DatabaseManager.getInstance();
          const db = dbManager.getDB();
          await db.rollback();
        } catch {
        }
        if (attempts >= this.MAX_RETRIES) {
          throw new Error(`❌ Error guardando TopDiario, serte la proxima.`);
        }

        await new Promise(res => setTimeout(res, 1000));
      }
    }
  }


}
export default TopDiario;