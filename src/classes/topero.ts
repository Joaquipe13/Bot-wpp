import DatabaseManager from "../db/database";
import { RowDataPacket } from 'mysql2';
import { capitalize } from "../utils"; 
export class Topero {
    id: number;
    name: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
	static async findByName(name: string): Promise<Topero | null> {
		name = capitalize(name);
		const dbManager = await DatabaseManager.getInstance();
		const db = await dbManager.getDB();
		const [rows] = await db.execute<RowDataPacket[]>(
			`SELECT id, name FROM toperos WHERE name = ?`,
			[name]
		);
		const row = rows[0];
		return row ? new Topero(row.id, row.name) : null;
	}

}