import { Client } from "whatsapp-web.js";

export function initializeClientWithRetry(client: Client, maxRetries = 5, delay = 5000) {
	let retries = 0;
	const tryInit = () => {
		console.log("🚀 Inicializando bot...");
		client.initialize().catch((err) => {
			console.error(`❌ Falló la inicialización: ${err.message || err}`);
			if (retries < maxRetries) {
				retries++;
				console.log(`🔄 Reintentando en ${delay / 1000}s (intento ${retries}/${maxRetries})...`);
				setTimeout(tryInit, delay);
			} else {
				console.error("💥 Máximo de reintentos alcanzado. Abortando.");
				process.exit(1);
			}
		});
	};
	tryInit();
}
