"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";

/* ---------------- TYPES ---------------- */
interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  sold: number;
  currency: string;
}

/* ---------------- PAGE ---------------- */
export default function TicketTypesPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [rowEdits, setRowEdits] = useState<Partial<TicketType>>({});
  const [loadingRow, setLoadingRow] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /* ---------------- FETCH TICKETS ---------------- */
  const fetchTicketTypes = async () => {
    try {
      const res = await api.get(`/events/${eventId}`);
      setTicketTypes(res.data.ticketTypes || []);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load ticket types");
    }
  };

  useEffect(() => {
    if (!eventId) return;
    fetchTicketTypes();
  }, [eventId]);

  /* ---------------- INLINE EDIT HANDLERS ---------------- */
const [rowEdits, setRowEdits] = useState<Record<string, Partial<TicketType>>>({});

const handleRowChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
  const { name, value, type } = e.target;
  setRowEdits(prev => ({
    ...prev,
    [id]: {
      ...prev[id],
      [name]: type === "number" ? Number(value) : value,
    },
  }));
};


  const startEditingRow = (tt: TicketType) => {
    if (tt.sold > 0) return toast.error("Cannot edit ticket after sales have started");
    setEditingRow(tt.id);
    setRowEdits({ [tt.id]: { price: tt.price, quantity: tt.quantity } });
  };

  const cancelRowEdit = () => {
    setEditingRow(null);
    setRowEdits({});
  };

  const saveRowEdit = async (id: string) => {
    if (!rowEdits[id]) return;
    setLoadingRow(id);

    try {
      await api.patch(`/organizer/events/${eventId}/tickets/${id}`, rowEdits[id]);
      toast.success("Ticket updated");
      fetchTicketTypes();
      cancelRowEdit();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update ticket");
    } finally {
      setLoadingRow(null);
    }
  };

  /* ---------------- DELETE ---------------- */
  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      await api.delete(`/organizer/events/${eventId}/tickets/${deletingId}`);
      toast.success("Ticket type deleted");
      fetchTicketTypes();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to delete ticket type");
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
    }
  };

  /* ---------------- RENDER ---------------- */
  if (!eventId) {
    return (
      <main className="min-h-screen p-8 flex items-center justify-center">
        <p className="text-red-500 font-medium">
          Event must be created before adding tickets.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Ticket Types
          </h1>
          <button
            onClick={() => router.push(`/organizer/events`)}
            className="text-sm underline text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            Back to Events
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-gray-200 dark:border-neutral-700 shadow-sm overflow-x-auto">
          {ticketTypes.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No ticket types created yet.</p>
          ) : (
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="text-left text-sm bg-gray-100 dark:bg-neutral-800">
                  <th className="p-3">Name</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Sold</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ticketTypes.map(tt => {
                  const isEditing = editingRow === tt.id;
                  return (
                    <tr
                      key={tt.id}
                      className="border-t border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
                    >
                      <td className="p-3 text-gray-900 dark:text-gray-100">{tt.name}</td>

                      {/* INLINE EDIT PRICE */}
                      <td className="p-3 text-gray-900 dark:text-gray-100">
                        {isEditing ? (
                          <input
                            type="number"
                            name="price"
                            value={rowEdits[tt.id]?.price ?? tt.price}
                            onChange={e => handleRowChange(e, tt.id)}
                            className="w-24 rounded-lg border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 px-2 py-1 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          `${tt.currency} ${tt.price}`
                        )}
                      </td>

                      {/* INLINE EDIT QUANTITY */}
                      <td className="p-3 text-gray-900 dark:text-gray-100">
                        {isEditing ? (
                          <input
                            type="number"
                            name="quantity"
                            value={rowEdits[tt.id]?.quantity ?? tt.quantity}
                            onChange={e => handleRowChange(e, tt.id)}
                            className="w-20 rounded-lg border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 px-2 py-1 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          tt.quantity
                        )}
                      </td>

                      <td className="p-3 text-gray-900 dark:text-gray-100">{tt.sold}</td>

                      <td className="p-3 space-x-2 flex items-center">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => saveRowEdit(tt.id)}
                              disabled={loadingRow === tt.id}
                              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm transition disabled:opacity-50"
                            >
                              {loadingRow === tt.id ? "Saving..." : "Save"}
                            </button>
                            <button
                              onClick={cancelRowEdit}
                              className="rounded-lg border border-gray-400 dark:border-neutral-600 px-3 py-1 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditingRow(tt)}
                              disabled={tt.sold > 0}
                              className="rounded-lg border px-3 py-1 text-sm bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 transition disabled:opacity-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => confirmDelete(tt.id)}
                              disabled={tt.sold > 0}
                              className="rounded-lg border px-3 py-1 text-sm bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* DELETE MODAL */}
        {showDeleteModal && deletingId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 w-96 space-y-4 shadow-lg">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Delete Ticket Type</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This action cannot be undone.
              </p>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="rounded-lg border border-gray-400 dark:border-neutral-600 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-4 py-2 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
