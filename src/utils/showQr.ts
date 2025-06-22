import qrcode from "qrcode";
import { Client } from "whatsapp-web.js";

let qrSvg: string | null = null;

function showQr(client: Client, addHandler: (handler: (req: any, res: any) => void) => void) {
  client.on("qr", async (qr) => {
    qrSvg = await qrcode.toDataURL(qr);
    console.log("📸 QR generado y accesible desde el navegador");
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