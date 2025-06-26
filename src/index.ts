import DatabaseManager from "./db/database";
import dotenv from "dotenv";
import http from "http";
import { registerClientEvents, createClient } from "./bot";

dotenv.config();
const {APP_URL, RAILWAY_STATIC_URL, PORT} = process.env 
const url = RAILWAY_STATIC_URL || APP_URL || `http://localhost:${PORT}`;

async function main() {

	const server = http.createServer(); 
	try {
		const dbManager = await DatabaseManager.getInstance();
		dbManager.getDB();
		console.log("✅ Base de datos lista y bot inicializado");

		const client = createClient();
		registerClientEvents(client, server);
		client.initialize();

		server.listen(PORT, () => {
			console.log(`🌐 Escuchando en: ${url}`);
		});
	} catch (error) {
		console.error("❌ Error al iniciar:", error);
		process.exit(1);
		
	}
}

main();
