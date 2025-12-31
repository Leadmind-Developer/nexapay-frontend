import { formatDate, getCategoryLabel, normalizeStatus } from "@/lib/transactionHelpers";

export function receiptRows(tx: any) {
  return [
    ["Transaction ID", tx.id],
    ["Status", normalizeStatus(tx).toUpperCase()],
    ["Category", getCategoryLabel(tx)],
    ["Type", tx.type.toUpperCase()],
    ["Amount", `₦${tx.amount.toLocaleString()}`],
    ["Date", formatDate(tx.createdAt)],
    ["Reference", tx.reference || "N/A"],
  ];
}
