import { Client, LocalAuth } from "whatsapp-web.js";
import { pingCommand } from "./commands/ping";
import DatabaseManager from "./db/database";
import TopAntipala from "./classes/topAntipala";
import { topDiarioCommand } from "./commands/topDiario";
import parseTop from "./utils/parseTop";
import showQr from "./utils/showQr";
import dotenv from "dotenv";
import http from "http";
import showAllTops from "./commands/showAllTops";
import uploadFinal from "./commands/uploadFinal";
import loroCommand from "./commands/loro";

dotenv.config();

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const server = http.createServer(); // sin handler directo

(async () => {
  try {
    const dbManager = await DatabaseManager.getInstance();
    dbManager.getDB(); // conexión lista
    console.log("✅ Base de datos lista y bot inicializado");
  } catch (error) {
    console.error("❌ Error al iniciar:", error);
    process.exit(1);
  }
})();
const topAntipala = TopAntipala.getInstance();

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.initialize();
server.listen(port, () => {
  const url = process.env.RAILWAY_STATIC_URL || `http://localhost:${port}`;
  console.log(`🌐 Escuchando en: ${url}`);
});


showQr(client, (handler) => {
  server.on("request", handler); // se encarga del QR y del mensaje fallback
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
  const body = msg.body.trim();
  console.log(`📩 Mensaje recibido: ${body} de ${msg.from}`);

  if (body.startsWith("/ping")) {
    pingCommand(msg);
    return;
  }

	if (body.startsWith("Top antipala del dia")) {
		try {
			const { nombres, date } = parseTop(body);
			const toperos = await topAntipala.validarUsuariosExistentes(nombres);
			await topDiarioCommand(toperos, date);
			const reply = await topAntipala.getTopAntipala();
			await msg.reply(reply);
			console.log(`📊 Top ${date.toISOString()} enviado.`);
		} catch (error: any) {
			await msg.reply(error.message || "❌ Error al procesar el top.");
		}
		return;
	}

  if (body.startsWith("/top")) {
    try {
      
      const reply = await topAntipala.getTopAntipala();
      await msg.reply(reply);
    } catch (error: any) {
      await msg.reply(error.message || "❌ Error al obtener el top.");
    }
  }
		else if (parts.length === 2) {
			const date = parts[1];
			try {
				const reply = await showTopOf(date);
				await msg.reply(reply);
			} catch (error: any) {
				await msg.reply(error.message || "❌ Error al obtener el top para esa fecha.");
			}
  if (body.startsWith("/topdiario")) {
	try {
	  	const tops = await showAllTops();
	  	await msg.reply(tops.join("\n\n"));
	}catch (error: any) {
	  	await msg.reply(error.message || "❌ Error al obtener el top diario.");
	}
  }
	if (body.startsWith("/final")) {
		console.log("📥 Subiendo un final...");
		try {
			const content = msg.body.trim();
			const reply = await uploadFinal(content)
			await msg.reply(reply)
			const top = await topAntipala.getTopAntipala();
			await msg.reply(top)
		} catch (error: any) {
			await msg.reply(error.message || "❌ Error al cargar un final.");
		}
	}
	if(body.startsWith("/loro")) {
		try {
			await loroCommand(msg, client);
		}catch (error: any) {
			await msg.reply(error.message || "❌ Error al obtener el loro.");
		}
	}
  }
);