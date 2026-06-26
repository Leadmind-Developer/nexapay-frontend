"use client";

interface Candidate {
  id: string;
  amount: number;
  requestId: string;
  serviceID: string;
  phone?: string;
  meterNumber?: string;
  status: string;
  createdAt: string;

  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Props {
  candidates: Candidate[];
  onQueue: (id: string) => void;
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function serviceName(serviceID: string) {
 const services: Record<string, string> = {
  "ikeja-electric": "IKEDC",
  ikedc: "IKEDC",

  "eko-electric": "EKEDC",
  ekedc: "EKEDC",

  "abuja-electric": "AEDC",
  aedc: "AEDC",

  "ibadan-electric": "IBEDC",
  ibedc: "IBEDC",

  "kano-electric": "KEDCO",
  kedco: "KEDCO",

  "jos-electric": "JED",
  jed: "JED",

  "kaduna-electric": "KAEDCO",
  kaedco: "KAEDCO",

  "portharcourt-electric": "PHED",
  phed: "PHED",

  "enugu-electric": "EEDC",
  eedc: "EEDC",

  "benin-electric": "BEDC",
  bedc: "BEDC",

  mtn: "MTN",
  glo: "Glo",
  airtel: "Airtel",
  "9mobile": "9mobile",

  gotv: "GOtv",
  dstv: "DStv",
  startimes: "StarTimes",
};

  return services[serviceID] || serviceID;
}

export default function RefundCandidatesTable({
  candidates,
  onQueue,
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-gray-50 border-b">
            <tr className="text-left text-gray-700">
              <th className="px-5 py-4 font-semibold">
                User
              </th>

              <th className="px-5 py-4 font-semibold">
                Service
              </th>

              <th className="px-5 py-4 font-semibold">
                Meter / Phone
              </th>

              <th className="px-5 py-4 font-semibold text-right">
                Amount
              </th>

              <th className="px-5 py-4 font-semibold">
                Failed At
              </th>

              <th className="px-5 py-4 font-semibold">
                Status
              </th>

              <th className="px-5 py-4 font-semibold text-center">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {candidates.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-gray-500"
                >
                  No refund candidates found.
                </td>
              </tr>
            )}

            {candidates.map((txn, index) => (
              <tr
                key={txn.id}
                className={`
                  border-b last:border-0
                  hover:bg-indigo-50/40
                  transition-colors
                  ${
                    index % 2 === 0
                      ? "bg-white"
                      : "bg-gray-50/40"
                  }
                `}
              >
                <td className="px-5 py-4">
                  <div className="font-medium text-gray-900">
                    {txn.user.firstName}{" "}
                    {txn.user.lastName}
                  </div>

                  <div className="text-xs text-gray-500">
                    {txn.user.email}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <span className="font-medium">
                    {serviceName(txn.serviceID)}
                  </span>
                </td>

                <td className="px-5 py-4 font-mono text-gray-600">
                  {txn.meterNumber ||
                    txn.phone ||
                    "—"}
                </td>

                <td className="px-5 py-4 text-right font-semibold whitespace-nowrap">
                  ₦{txn.amount.toLocaleString()}
                </td>

                <td className="px-5 py-4 whitespace-nowrap text-gray-600">
                  {formatDate(txn.createdAt)}
                </td>

                <td className="px-5 py-4">
                  <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                    Failed
                  </span>
                </td>

                <td className="px-5 py-4 text-center">
                  <button
                    onClick={() => onQueue(txn.id)}
                    className="rounded-lg bg-[#39358c] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2e2a72] active:scale-95"
                  >
                    Queue Refund
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
