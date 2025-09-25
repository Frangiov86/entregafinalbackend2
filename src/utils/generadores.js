export function generarCodigoTicket() {
  // Código corto legible: AAA-999999
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const pref = Array.from({ length: 3 }, () => letras[Math.floor(Math.random() * letras.length)]).join('');
  const num = Math.floor(100000 + Math.random() * 900000);
  return `${pref}-${num}`;
}
