
import fs from 'fs';
import path from 'path';
import { Message, Client, MessageMedia } from 'whatsapp-web.js';

export async function loroCommand(msg: Message, client: Client) {
	
  const carpeta = path.join(__dirname, './../../audios/loro');
  const archivos = fs.readdirSync(carpeta).filter(file => file.endsWith('.opus'));
  if (archivos.length === 0) {
    throw new Error("❌ No hay audios del loro disponibles.");

  }
  const archivoElegido = archivos[Math.floor(Math.random() * archivos.length)];
  const ruta = path.join(carpeta, archivoElegido);
  const buffer = fs.readFileSync(ruta);
  const base64Audio = buffer.toString('base64');
  const media = new MessageMedia('audio/ogg; codecs=opus', base64Audio, 'loro.opus');
  await client.sendMessage(msg.from, media, {
    sendAudioAsVoice: true
  });
}
export default loroCommand;