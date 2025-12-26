import { clsx } from "clsx";
import { List } from "lucide-react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea un número dividiéndolo por 1000 y redondeando a 3 decimales si es necesario
 * @param {number} value - Número a formatear
 * @returns {number} Número formateado
 * @example
 * formatThousands(70991.87) // retorna 70.992
 * formatThousands(70000) // retorna 70
 */
export function formatThousands(value) {
  if (typeof value !== 'number') return 0;

  // Dividir por 1000
  const divided = value / 1000;

  // Si no tiene decimales, retornar el número entero
  if (Number.isInteger(divided)) return divided;

  // Si tiene decimales, redondear a 3 decimales
  return Number(divided.toFixed(4));
}

/**
 * Extrae el número de un texto que contiene letras y números
 * @param {string} text - Texto del que extraer el número (ej: "T1", "Lanza2")
 * @returns {number} Número extraído o 0 si no se encuentra ningún número
 * @example
 * extractNumber("T1") // retorna 1
 * extractNumber("Lanza2") // retorna 2
 * extractNumber("ABC") // retorna 0
 */
export function extractNumber(text) {
  if (typeof text !== 'string') return 0;

  // Usar una expresión regular para encontrar todos los números en el texto
  const matches = text.match(/\d+/);

  // Si se encontró un número, convertirlo a número y retornarlo
  if (matches && matches.length > 0) {
    return Number(matches[0]);
  }

  // Si no se encontró ningún número, retornar 0
  return 0;
}
export function restarUnMinuto(datetimeInput) {
  if (!datetimeInput) return null;
  try {
    const date = (datetimeInput instanceof Date) ? datetimeInput : new Date(datetimeInput);
    if (isNaN(date.getTime())) return null;
    const newDate = new Date(date.getTime() - 60000); // 60.000 ms = 1 minuto
    return newDate.toISOString();
  } catch {
    return null;
  }
}
export function VelocidadCarga(ListVelocidadCarga) {
  if (!Array.isArray(ListVelocidadCarga) || ListVelocidadCarga.length === 0) {
    return 0.000;
  }
  let total = 0;
  for (let i = 0; i < ListVelocidadCarga.length; i++) {
    const variable = ListVelocidadCarga[i];

    // Aseguramos que variable.value sea un número
    const valor = Number(variable.value);

    if (valor > 500) {
      total++;
    }
  }
  return total / 60;
}
export function VelCarD9(ListD9, ListAE, ListAF) {
  if (ListD9.length === 0 || ListAE.length === 0 || ListAF.length === 0) {
    return 0.000;
  }
  let total = 0;
  for (let i = 0; i < ListD9.length; i++) {
    const variableD9 = ListD9[i];
    const variableAE = ListAE[i];
    const variableAF = ListAF[i];
    let G = (variableD9.value > 1000) ? 1 : 0;
    // Paso 2: aplicar la segunda condición
    let resultado = (G === 1) ? ((variableAE.value <= variableAF.value * (1 / 3)) ? 1 : 0) : 0;
    total += resultado;
  }
  return total;
}

export function calcularFormula(BC5, BB5, F29) {
  // F29 puede ser un objeto Date o una cadena tipo "HH:MM"
  let hora, minuto;
  if (typeof F29 === "string") {
    const [h, m] = F29.split(":").map(Number);
    hora = h;
    minuto = m;
  } else if (F29 instanceof Date) {
    hora = F29.getHours();
    minuto = F29.getMinutes();
  } else {
    throw new Error("F29 debe ser una cadena 'HH:MM' o un objeto Date");
  }

  const tiempoHoras = hora + (minuto / 60);
  const resultado = (BC5 - BB5) / tiempoHoras;
  return resultado;
}

export const downloadFromBase64 = (base64String, mimeType, fileName) => {
  try {
    // Validar parámetros
    if (!base64String) {
      throw new Error('La cadena base64 es requerida');
    }
    if (!mimeType) {
      throw new Error('El tipo MIME es requerido');
    }
    if (!fileName) {
      throw new Error('El nombre del archivo es requerido');
    }

    // Convertir base64 a bytes
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    // Crear blob
    const blob = new Blob([byteArray], { type: mimeType });

    // Crear URL temporal
    const url = window.URL.createObjectURL(blob);

    // Crear elemento de descarga
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';

    // Agregar al DOM, hacer clic y remover
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Limpiar URL temporal
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error al descargar archivo desde base64:', error);
    throw error;
  }
};
