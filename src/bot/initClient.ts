import { Client, LocalAuth } from "whatsapp-web.js";

export function createClient(): Client {
  return new Client({
    authStrategy: new LocalAuth({
    	dataPath: './session' 
  	}),
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });
}
