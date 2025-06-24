"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClient = createClient;
const whatsapp_web_js_1 = require("whatsapp-web.js");
function createClient() {
    return new whatsapp_web_js_1.Client({
        authStrategy: new whatsapp_web_js_1.LocalAuth({
            dataPath: './session'
        }),
        puppeteer: {
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        },
    });
}
