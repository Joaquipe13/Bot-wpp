
function parseTop(body: string): { nombres: string[]; fecha: Date }   {
  const lines = body.split("\n").map((line) => line.trim());
      const fechaRegex = /Top antipala del dia (\d{2}\/\d{2}\/\d{4})/i;
      const match = lines[0].match(fechaRegex);

      if (!match) {
        throw new Error("❌ Formato de fecha inválido. Usá: dd/mm/aaaa");
      }

      const [dia, mes, anio] = match[1].split("/");
      const fecha = new Date(+anio, +mes - 1, +dia);

      const nombres: string[] = lines
        .slice(1)
        .map((line) => line.replace(/^\d+\s+/, "").trim())
        .filter((nombre) => nombre.length > 0);
    return { nombres, fecha };
}
export default parseTop;