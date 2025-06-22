import qrcode from "qrcode-terminal";
import { Client, LocalAuth, Message } from "whatsapp-web.js";
import { pingCommand } from "./commands/ping";
import DatabaseManager from "./db/database";
import TopAntipala from "./classes/topAntipala";
import { topDiarioCommand } from "./commands/topDiario";
import log from "./utils/logger";
import http from 'http';
import parseTop from "./utils/parseTop";
import showQr from "./utils/showQr";
import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Bot is running");
  }
});


(async () => {
  try {
    const dbManager = await DatabaseManager.getInstance();
    const db = dbManager.getDB();

    console.log("✅ Base de datos lista y bot inicializado");
  } catch (error) {
    console.error("❌ Error al iniciar:", error);
    process.exit(1);
  }
})();

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
   },
});

client.initialize();
server.listen(port, () => {
  console.log(`🌐 HTTP server listening on port ${port}`);
});

// Pasás una función que agrega handlers
showQr(client, (handler) => {
  server.on("request", handler); // Hookeás el nuevo handler a las requests
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
    console.log("👉 Comando /ping detectado");
    pingCommand(msg);
    return;
  }

  if (body.startsWith("Top antipala del dia")) {
    try {
      const {nombres, fecha} = parseTop(body);
      const topAntipala = TopAntipala.getInstance();

      let toperos;
      try {
        toperos = await topAntipala.validarUsuariosExistentes(nombres);
      } catch (error: any) {
        await msg.reply(error.message);
        return;
      }

      await topDiarioCommand(toperos, fecha);
      console.log(`✅ Top antipala del día ${fecha.toISOString()} guardado exitosamente.`);
      const reply = await topAntipala.getTopAntipala()
      console.log(`📊 Top antipala del día ${fecha.toISOString()} enviado.`);
      await msg.reply(reply);
    }catch (error:any) {
      if (error.message) {
        await msg.reply(error.message);
      }else{
        await msg.reply("❌ Error al procesar el top. Verificá el formato.");
      }
    }
  }
  if (body.startsWith("/top")) {
    try {
      const topAntipala = TopAntipala.getInstance();
      const reply = await topAntipala.getTopAntipala();
      await msg.reply(reply);
    }catch (error: any) {
      if (error.message) {
        await msg.reply(error.message);
      }else{
        await msg.reply("❌ Error al procesar el top. Verificá el formato.");
      }
    }
  }
});
