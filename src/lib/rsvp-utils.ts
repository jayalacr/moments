/**
 * Utilidades para codificar y decodificar el número de pases en la URL
 * de forma que no sea obvio para el invitado.
 */

const SALT = 17;
const MULTIPLIER = 31;
const PREFIXES = ['k', 'm', 'x', 'z', 'p', 'r', 's', 't', 'w', 'v'];

/**
 * Codifica el número de pases adicionales.
 * Ejemplo: 1 pase -> "m422e"
 */
export function encodePasses(passes: number): string {
  const val = (passes + SALT) * MULTIPLIER;
  const hex = val.toString(16);
  // Prefijo basado en el número de pases para que sea consistente pero variado
  const char = PREFIXES[passes % PREFIXES.length];
  const noise = (passes + 3) % 10;
  return `${char}${noise}${hex}`;
}

/**
 * Decodifica el código de la URL para obtener el número de pases adicionales.
 */
export function decodePasses(code: string | null): number | null {
  if (!code || code.length < 4) return null;
  
  try {
    const hex = code.slice(2);
    const val = parseInt(hex, 16);
    if (isNaN(val)) return null;
    
    const passes = (val / MULTIPLIER) - SALT;
    
    // Validar que sea un entero positivo razonable
    if (Number.isInteger(passes) && passes >= 0 && passes < 50) {
      return passes;
    }
  } catch (e) {
    return null;
  }
  
  return null;
}
