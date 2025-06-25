import DatabaseManager from "./db/database";
import dotenv from "dotenv";
import http from "http";
import { registerClientEvents, createClient } from "./bot";


async function main() {
	dotenv.config();

	const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

	const server = http.createServer(); 
	try {
		const dbManager = await DatabaseManager.getInstance();
		dbManager.getDB();
		console.log("✅ Base de datos lista y bot inicializado");

		const client = createClient();
		registerClientEvents(client, server);
		client.initialize();

		server.listen(port, () => {
		});
	} catch (error) {
		console.error("❌ Error al iniciar:", error);
		process.exit(1);
		
	}
}

main();
