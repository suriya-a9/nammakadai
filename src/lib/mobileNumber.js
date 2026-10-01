// Store Indian numbers in E.164; extend deliberately if other countries are supported.
export function normalizeMobile(input) {
  const raw = String(input ?? "").trim().replace(/[\s()-]/g, "");
  const digits = raw.replace(/^\+/, "");
  if (/^[6-9]\d{9}$/.test(digits)) return `+91${digits}`;
  if (/^91[6-9]\d{9}$/.test(digits)) return `+${digits}`;
  return null;
}
