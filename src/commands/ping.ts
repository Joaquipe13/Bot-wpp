import { Message } from "whatsapp-web.js";

export const pingCommand = (msg: Message) => {
    msg.reply("🏓 Pong!");
};

/* import { Client, LocalAuth } from "whatsapp-web.js";


const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true },
});

export default client */