import qrcode from "qrcode";
import { Client } from "whatsapp-web.js";

let qrSvg: string | null = null;
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

function showQr(client: Client, addHandler: (handler: (req: any, res: any) => void) => void) {
  client.on("qr", async (qr) => {
    qrSvg = await qrcode.toDataURL(qr);
	const url = process.env.RAILWAY_STATIC_URL || `http://localhost:${port}`;
    console.log(`📸 QR generado y accesible desde el navegador en: ${url}`);
  });

  addHandler((req, res) => {
    if (req.url === "/") {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(
        qrSvg
          ? `<img src="${qrSvg}" />`
          : "QR aún no disponible o ya fue escaneado."
      );
    }
  });
}

export default showQr;