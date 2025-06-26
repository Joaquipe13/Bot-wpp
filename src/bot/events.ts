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
	const body = msg.body.trim().toLowerCase();
	console.log(`📩 Mensaje recibido: ${body} de ${msg.from}`);
  
	if (body.startsWith("top antipala del dia")) {
		try {
			await topDiarioCommand(body, topAntipala);
			const reply = await topAntipala.getTopAntipala();
			return msg.reply(reply);
		} catch (error: any) {
			return msg.reply(error.message || "❌ Error al procesar el top.");
		}
	}
  
	if (body.startsWith("/")) {
		const command = body.split(" ")[0].slice(1);
		try{
			if (commands.exists(command)) {
				return handleCommand(command, body, msg, client);
			}
		} catch (error: any) {
			return msg.reply(error.message || "❌ Error al procesar el comando.");
		}
	}
  });
}
