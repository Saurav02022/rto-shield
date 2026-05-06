/** Pure formatters — no runtime dependencies on app state or external services. */

export function formatCurrency(value: number, currency = "INR", locale = "en-IN"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDateTime(value: string | null | undefined, locale = "en-IN"): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatRelativeTime(
  value: string | null | undefined,
  now: Date = new Date(),
): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const diffMs = date.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const absSec = Math.abs(diffSec);

  if (absSec < 60) return "just now";

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (absSec < 3600) return formatter.format(Math.round(diffSec / 60), "minute");
  if (absSec < 86400) return formatter.format(Math.round(diffSec / 3600), "hour");
  return formatter.format(Math.round(diffSec / 86400), "day");
}
