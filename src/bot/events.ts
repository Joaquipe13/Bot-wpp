// src/bot/events.ts
import { Client } from "whatsapp-web.js";
import { showQr } from "../utils/showQr";
import http from "http";
import { topDiarioCommand } from "../commands";
import { TopAntipala, Commands } from "../classes";
import { handleCommand } from "../utils/";

const topAntipala = TopAntipala.getInstance();
const commands = Commands.getInstance();

export function registerClientEvents(client: Client, server: http.Server) {
  showQr(client, (handler) => {
    server.on("request", handler);
  });

  client.on("authenticated", () => {
    console.log("🔐 Autenticado con éxito.");
  });

  client.on("auth_failure", (msg) => {
    console.error("❌ Falló la autenticación:", msg);
  });

  client.on("disconnected", (reason) => {
    console.warn("⚠️ Desconectado:", reason);
  });

  client.on("ready", () => {
    console.log(client.info);
  });
  client.on("message", async (msg) => {
	try {
		const body = msg.body.trim().toLowerCase();
		if (body.startsWith("top antipala del dia")) {
		try {
			await topDiarioCommand(body, topAntipala);
			const reply = await topAntipala.getTopAntipala();
			console.log("📊 Top Antipala del día:", reply);
			return msg.reply(reply);
		} catch (error: any) {
			return msg.reply(error.message || "❌ Error al procesar el top.");
		}
		}
	
		if (body.startsWith("/")) {
			try{
				const command = body.split(" ")[0].slice(1).toLowerCase();
				if (commands.exists(command)) {
					const result = await handleCommand(command, body);
					if (result.type === 'text') {
						console.log(`${msg.author}\n🔍 Comando ejecutado: ${command} con resultado:`, result.payload);
						return msg.reply(result.payload);

					} else if (result.type === 'media') {
						console.log(`${msg.author}\n🔍 Comando ejecutado: ${command}`);						
						return client.sendMessage(msg.from, result.payload, { sendAudioAsVoice: true });
					}
				}
			} catch (error: any) {
				return msg.reply(error.message || "❌ Error al procesar el comando.");

			}
		}
	} catch (error: any) {
		console.error("💥 Error no capturado:", error);
    	return msg.reply(error.message || "❌ Ocurrió un error inesperado.");
	}
  });
}
