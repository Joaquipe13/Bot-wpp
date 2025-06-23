
import fs from 'fs';
import path from 'path';
import { Message, Client, MessageMedia } from 'whatsapp-web.js';

export async function loroCommand(msg: Message, client: Client) {
	
  const carpeta = path.join(__dirname, './../../audios/loro');
  console.log("0");
  const archivos = fs.readdirSync(carpeta).filter(file => file.endsWith('.opus'));
console.log("1");
  if (archivos.length === 0) {
    throw new Error("❌ No hay audios del loro disponibles.");

  }
  const archivoElegido = archivos[Math.floor(Math.random() * archivos.length)];
  const ruta = path.join(carpeta, archivoElegido);
  console.log("2");
  const buffer = fs.readFileSync(ruta);
  const base64Audio = buffer.toString('base64');
console.log("3");
  const media = new MessageMedia('audio/ogg; codecs=opus', base64Audio, 'loro.opus');
console.log("4");
  await client.sendMessage(msg.from, media, {
    sendAudioAsVoice: true
  });
}
export default loroCommand;