import qrcode from "qrcode-terminal";
import { Client, LocalAuth, Message } from "whatsapp-web.js";
import { pingCommand } from "./commands/ping";
import DatabaseManager from "./db/database";
import TopAntipala from "./classes/topAntipala";
import { topDiarioCommand } from "./commands/topDiario";
import http from 'http';

http.createServer((_, res) => {
  res.writeHead(200);
  res.end('Bot is running');
}).listen(process.env.PORT || 3000);



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

client.on("authenticated", () => {
  console.log("🔐 Autenticado con éxito.");
});

client.on("auth_failure", (msg) => {
  console.error("❌ Falló la autenticación:", msg);
});

client.on("disconnected", (reason) => {
  console.warn("⚠️ Desconectado:", reason);
});
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
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
      const lines = body.split("\n").map((line) => line.trim());
      const fechaRegex = /Top antipala del dia (\d{2}\/\d{2}\/\d{4})/i;
      const match = lines[0].match(fechaRegex);

      if (!match) {
        await msg.reply("❌ Formato de fecha inválido. Usá: dd/mm/aaaa");
        return;
      }

      const [dia, mes, anio] = match[1].split("/");
      const fecha = new Date(+anio, +mes - 1, +dia);

      const nombres: string[] = lines
        .slice(1)
        .map((line) => line.replace(/^\d+\s+/, "").trim())
        .filter((nombre) => nombre.length > 0);

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
    }catch (err:any) {
      if (err.message) {
        await msg.reply(err.message);
      }else{
        await msg.reply("❌ Error al procesar el top. Verificá el formato.");
      }
    }
  }
});
