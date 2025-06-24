import fs from 'fs/promises';
import path from 'path';
import { MessageMedia } from 'whatsapp-web.js';

export async function audioCommand(file: string) {
  const folder = path.join(__dirname, './../../audios/', file);
  const files = (await fs.readdir(folder)).filter(file => file.endsWith('.ogg'));
  if (files.length === 0) {
	
    throw new Error(`❌ No hay audios del ${file} disponibles.`);
  }
  const selectedFile = files[Math.floor(Math.random() * files.length)];
  const ruta = path.join(folder, selectedFile);
  const buffer = await fs.readFile(ruta); 
  const base64Audio = buffer.toString('base64');
  const media = new MessageMedia('audio/ogg; codecs=ogg', base64Audio, `${file}.ogg`); 
  return media;
}