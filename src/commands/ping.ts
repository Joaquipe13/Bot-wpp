import { Message } from "whatsapp-web.js";

export const pingCommand = (msg: Message) => {
    msg.reply("🏓 Pong!");
};