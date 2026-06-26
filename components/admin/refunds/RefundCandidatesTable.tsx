"use client";

interface Candidate {
  id: string;
  amount: number;
  requestId: string;
  serviceID: string;
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

export default function RefundCandidatesTable({
  candidates,
  onQueue,
}: Props) {
  return (
    <table className="w-full border rounded">
      <thead>
        <tr>
          <th>User</th>
          <th>Service</th>
          <th>Amount</th>
          <th />
        </tr>
      </thead>

      <tbody>
        {candidates.map((txn) => (
          <tr key={txn.id}>
            <td>
              {txn.user.firstName} {txn.user.lastName}
            </td>

            <td>{txn.serviceID}</td>

            <td>
              ₦{txn.amount.toLocaleString()}
            </td>

            <td>
              <button
                onClick={() => onQueue(txn.id)}
                className="bg-[#39358c] text-white px-3 py-1 rounded"
              >
                Queue Refund
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
