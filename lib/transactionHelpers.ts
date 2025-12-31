/* ================= TYPES ================= */

export type TxStatus = "successful" | "pending" | "failed";

export interface ReceiptTransaction {
  id: number;
  type: "credit" | "debit";
  amount: number;
  reference?: string | null;
  createdAt: string;

  category?: string;
  narration?: string;
  status?: string;
  transactionStatus?: string;
}

/* ================= FORMATTERS ================= */

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getCategoryLabel(tx: ReceiptTransaction) {
  if (tx.category) return tx.category.toUpperCase();
  if (tx.reference?.toLowerCase().includes("airtime")) return "AIRTIME";
  if (tx.reference?.toLowerCase().includes("data")) return "DATA";
  if (tx.reference?.toLowerCase().includes("electric")) return "ELECTRICITY";
  if (tx.type === "credit") return "WALLET FUNDING";
  return "PAYMENT";
}

/* ================= STATUS ================= */

export function normalizeStatus(tx: ReceiptTransaction): TxStatus {
  const raw = tx.status || tx.transactionStatus || "";
  const s = raw.toLowerCase();

  if (["success", "successful", "completed"].includes(s)) return "successful";
  if (["failed", "error", "reversed"].includes(s)) return "failed";
  return "pending";
}

/* ================= GROUPING ================= */

function isToday(date: string) {
  return new Date(date).toDateString() === new Date().toDateString();
}

function isThisWeek(date: string) {
  const d = new Date(date);
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  return d >= start;
}

export function groupTransactions<T extends ReceiptTransaction>(list: T[]) {
  return {
    today: list.filter(tx => isToday(tx.createdAt)),
    thisWeek: list.filter(tx => !isToday(tx.createdAt) && isThisWeek(tx.createdAt)),
    older: list.filter(tx => !isToday(tx.createdAt) && !isThisWeek(tx.createdAt)),
  };
}

/* ================= RECEIPT ================= */

export function receiptText(tx: ReceiptTransaction) {
  return `
Transaction Receipt
-------------------
Category: ${getCategoryLabel(tx)}
Type: ${tx.type}
Status: ${normalizeStatus(tx)}
Amount: ₦${tx.amount}
Date: ${formatDate(tx.createdAt)}
Reference: ${tx.reference || "N/A"}
`;
}

export function shareWhatsApp(tx: ReceiptTransaction) {
  window.open(
    `https://wa.me/?text=${encodeURIComponent(receiptText(tx))}`,
    "_blank"
  );
}

export function shareEmail(tx: ReceiptTransaction) {
  window.location.href = `mailto:?subject=Transaction Receipt&body=${encodeURIComponent(
    receiptText(tx)
  )}`;
}

export function downloadReceipt(tx: ReceiptTransaction) {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<pre>${receiptText(tx)}</pre>`);
  win.print();
}
