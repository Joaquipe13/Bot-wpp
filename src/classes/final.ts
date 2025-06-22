import Topero from './topero';

class TopDiario {
  fecha: Date;
  materia: string;
  nota: number;
  topero: Topero;

  constructor(fecha: Date, topero: Topero, materia: string, nota: number) {
    this.fecha = fecha;
    this.topero = topero;
    this.materia = materia;
    this.nota = nota;
  }
  
}