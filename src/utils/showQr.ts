import { IncomingMessage, ServerResponse } from "http";
import qrcode from "qrcode-terminal";
import type { Client } from "whatsapp-web.js";

let latestQR: string | null = null;

function showQr(client: Client, attachHandler: (handler: (req: IncomingMessage, res: ServerResponse) => void) => void) {
  client.on("qr", (qr) => {
    latestQR = qr;
    qrcode.generate(qr, { small: true });
  });

  // Agrega un handler a tu servidor HTTP
  attachHandler((req, res) => {
    if (req.url === "/qr") {
      if (!latestQR) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("QR code not generated yet");
      } else {
        qrcode.generate(latestQR, { small: true }, (asciiQR:any) => {
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end(asciiQR);
        });
      }
    }
  });
}
export default showQr;