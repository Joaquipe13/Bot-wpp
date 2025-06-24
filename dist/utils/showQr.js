"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showQr = showQr;
const qrcode_1 = __importDefault(require("qrcode"));
let qrSvg = null;
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
function showQr(client, addHandler) {
    client.on("qr", async (qr) => {
        qrSvg = await qrcode_1.default.toDataURL(qr);
        const url = process.env.RAILWAY_STATIC_URL || `http://localhost:${port}`;
        console.log(`📸 QR generado y accesible desde el navegador en: ${url}`);
    });
    addHandler((req, res) => {
        if (req.url === "/") {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(qrSvg
                ? `<img src="${qrSvg}" />`
                : "QR aún no disponible o ya fue escaneado.");
        }
    });
}
