import { Client } from "whatsapp-web.js";
import { showQr } from "../utils/showQr";
import http from "http";
import { topDiarioCommand } from "../commands";
import { TopAntipala, Commands } from "../classes";
import { handleCommand } from "../utils/";
import { restartClient } from "./restartClient";

const topAntipala = TopAntipala.getInstance();

export function registerClientEvents(client: Client, server: http.Server) {
  showQr(client, (handler) => {
    server.on("request", handler);
  });

  client.on("authenticated", () => {
    console.log("🔐 Autenticado con éxito.");
  });

  client.on("auth_failure", (msg) => {
    console.error("❌ Falló la autenticación:", msg);
	restartClient(server)
  });

  client.on("disconnected", (reason) => {
    console.warn("⚠️ Desconectado:", reason);
	restartClient(server)
  });

  client.on("ready", () => {
    console.log(client.info);
  });
  client.on("message", async (msg) => {
	try {
		const body = msg.body.trim().toLowerCase();
		const userId = msg.author ? msg.author.split("@")[0] : msg.from.split("@")[0];
		if (body.startsWith("top antipala del dia")) {
			try {
				if (Commands.hasPermission(userId)) {
					await topDiarioCommand(body, topAntipala);
					const reply = await topAntipala.getTopAntipala();
					console.log("📊 Top Antipala del día:", reply);
					return msg.reply(reply);
				}
			} catch (error: any) {
				return msg.reply(error.message || "❌ Error al procesar el top.");
			}
		}
	
		if (body.startsWith("/")) {
			try{
				const command = body.split(" ")[0].slice(1).toLowerCase();
				if (command === "help") {
					const helpMessage = Commands.getInstance().help(userId);
					return msg.reply(helpMessage);
				}
				if (Commands.exists(command)) {
					Commands.hasPermission(userId, command);
					const result = await handleCommand(command, body);
					console.log(`${userId}\n🔍 Comando ejecutado: ${command}`);
					if (result.type === 'text') {
						return msg.reply(result.payload);
					} else if (result.type === 'media') {				
						return client.sendMessage(msg.from, result.payload, { sendAudioAsVoice: true });
					}
				}
			} catch (error: any) {
				return msg.reply(error.message || "❌ Error al procesar el comando.");
			}
		}
	} catch (error: any) {
		console.error("💥 Error no capturado:", error);
		console.error("Mensaje que causó el error:", msg.body);
    	return msg.reply(error.message || "❌ Ocurrió un error inesperado.");
	}
  });
}
