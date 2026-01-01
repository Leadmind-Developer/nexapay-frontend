/* -------- Time formatting -------- */
export function formatTransactionTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60)
    return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24)
    return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* -------- Token formatting -------- */
export function formatToken(token: string) {
  if (!token) return "";
  return token.replace(/(.{4})/g, "$1 ").trim();
}

/* -------- Grouping -------- */
export function groupTransactionsByDate<T extends { createdAt: string }>(
  transactions: T[]
) {
  const today: T[] = [];
  const yesterday: T[] = [];
  const older: T[] = [];

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  for (const tx of transactions) {
    const created = new Date(tx.createdAt);

    if (created >= startOfToday) today.push(tx);
    else if (created >= startOfYesterday) yesterday.push(tx);
    else older.push(tx);
  }

  return { today, yesterday, older };
}

/* -------- WhatsApp Share -------- */
export function shareViaWhatsApp(reference: string) {
  const pdfUrl = `${API_BASE}/transactions/${reference}/receipt.pdf`;
  const message = `Hi! Here is my Nexa electricity receipt: ${pdfUrl}`;
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
}
