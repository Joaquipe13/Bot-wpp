
import fs from 'fs';
import path from 'path';
import {  MessageMedia } from 'whatsapp-web.js';

export async function audioCommand(file: string) {
  const carpeta = path.join(__dirname, './../../audios/', file);

  if (!fs.existsSync(carpeta)) {
    throw new Error(`❌ La carpeta ${file} no existe.`);
  }

  const archivos = fs.readdirSync(carpeta).filter(f => f.endsWith('.opus'));
  if (archivos.length === 0) {
    throw new Error(`❌ No hay audios del ${file} disponibles.`);
  }

  const archivoElegido = archivos[Math.floor(Math.random() * archivos.length)];
  const ruta = path.join(carpeta, archivoElegido);
  const buffer = fs.readFileSync(ruta);
  const base64Audio = buffer.toString('base64');
  const media = new MessageMedia('audio/ogg; codecs=opus', base64Audio, archivoElegido);
  return media;
}

