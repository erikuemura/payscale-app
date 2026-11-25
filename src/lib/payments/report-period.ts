/** Calendar buckets, not ISO weeks; keep years and months separate. */
export function reportPeriod(date: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return 'Data não reconhecida';
  const [, year, month, day] = match;
  const parsed = new Date(`${date}T12:00:00Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) return 'Data não reconhecida';
  return `${year}-${month} — faixa ${Math.ceil(Number(day) / 7)}`;
}
