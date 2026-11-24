export function lkr(n: number): string {
  return "Rs. " + Math.round(n).toLocaleString("en-LK");
}

export function formatDate(d: string | Date): string {
  return new Date(d).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Colombo",
  });
}
