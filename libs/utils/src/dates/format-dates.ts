export function formatISODate(isoDate: string): string {
  const trimmed = isoDate.trim();

  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
    ? `${trimmed}T12:00:00.000Z`
    : trimmed;

  const d = new Date(normalized);

  if (Number.isNaN(d.getTime())) {
    return isoDate;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(d);
}
