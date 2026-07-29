const MONTH_MAP: Record<string, number> = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, setiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
};

/** Días de gracia después de expires_at antes de que sea seguro purgar el evento de BD + Cloudinary. No se guarda: se calcula al momento de revisar. */
export const PURGE_GRACE_DAYS = 30;

function normalize(s: string) {
  return s.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

interface DateConfig {
  targetDate?: string;
  date?: { day?: string; month?: string; year?: string };
}

/** Extrae la fecha de la boda/evento desde el config del organizador (targetDate ISO o date {day, month, year} en español). */
export function parseWeddingDate(config: unknown): Date | null {
  const c = config as DateConfig | null;

  if (c?.targetDate) {
    const d = new Date(c.targetDate);
    if (!isNaN(d.getTime())) return d;
  }

  const date = c?.date;
  if (date?.day && date?.month && date?.year) {
    const day = parseInt(date.day, 10);
    const year = parseInt(date.year, 10);
    const monthKey = normalize(date.month);
    const monthNum = monthKey in MONTH_MAP ? MONTH_MAP[monthKey] : Number(date.month) - 1;
    if (Number.isFinite(day) && Number.isFinite(year) && Number.isFinite(monthNum) && monthNum >= 0 && monthNum <= 11) {
      const d = new Date(year, monthNum, day);
      if (!isNaN(d.getTime())) return d;
    }
  }

  return null;
}

/** expires_at = fecha de la boda: la invitación deja de ser funcional ahí. Los meses del plan solo rigen cuánto antes de la boda se puede publicar, no esto. */
export function computeExpiresAt(config: unknown): string | null {
  const weddingDate = parseWeddingDate(config);
  return weddingDate ? weddingDate.toISOString() : null;
}
