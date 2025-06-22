import http from "http";
import qrcode from "qrcode-terminal";
import type { Client } from "whatsapp-web.js";

function showQr(client: Client, port: number, latestQR: string | null = null): http.Server {
  
  const server = http.createServer((req, res) => {
    if (req.url === "/qr") {
      if (!latestQR) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("QR code not generated yet");
      } else {
        res.writeHead(200, { "Content-Type": "text/plain" });
        qrcode.generate(latestQR, { small: true }, (asciiQR:any) => {
          res.end(asciiQR);
        });
      }
    } else {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Bot is running");
    }
  });

  server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });

  return server; 
}

export default showQr;