import { Transaction } from "@/lib/types";

function statusClass(status?: string) {
  if (!status) return "bg-gray-100 text-gray-800";
  const s = String(status).toLowerCase();
  if (s.includes("success") || s === "ts") return "bg-green-100 text-green-800";
  if (s.includes("fail") || s === "tf") return "bg-red-100 text-red-800";
  return "bg-yellow-100 text-yellow-800";
}

export default function TransactionCard({ tx }: { tx: any }) {
  const amount = tx.amount ?? tx.value ?? tx.total ?? "-";
  const status = tx.status ?? tx.state ?? tx.smartcash_status ?? "unknown";
  return (
    <article className="bg-white dark:bg-gray-800 p-4 rounded shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="text-sm text-gray-500">{tx.type ?? tx.category ?? "TX"}</div>
          <div className="text-lg font-semibold">₦{amount}</div>
        </div>
        <div className={`px-2 py-1 rounded text-sm ${statusClass(status)}`}>{String(status)}</div>
      </div>
      <div className="text-sm text-gray-500">
        Ref: {tx.reference_id ?? tx.id ?? "-"} • {new Date(tx.created_at ?? tx.timestamp ?? Date.now()).toLocaleString()}
      </div>
      {tx.provider && <div className="mt-2 text-sm">Provider: {tx.provider}</div>}
    </article>
  );
}
