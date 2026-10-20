const rtf = new Intl.RelativeTimeFormat("it", { numeric: "auto" });
const dateFmt = new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric" });
const numberFmt = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 1, minimumFractionDigits: 1 });

export function relativeDate(date: Date, now = Date.now()): string {
  const diff = (date.getTime() - now) / 1000;
  const abs = Math.abs(diff);
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86_400) return rtf.format(Math.round(diff / 3600), "hour");
  if (abs < 86_400 * 30) return rtf.format(Math.round(diff / 86_400), "day");
  if (abs < 86_400 * 365) return rtf.format(Math.round(diff / (86_400 * 30)), "month");
  return dateFmt.format(date);
}

export function longDate(date: Date): string {
  return dateFmt.format(date);
}

export function rating(value: number): string {
  return numberFmt.format(value);
}

export function greeting(hour = new Date().getHours()): string {
  if (hour < 13) return "Buongiorno";
  if (hour < 18) return "Buon pomeriggio";
  return "Buonasera";
}
