import { useEffect, useState } from "react";
import { CheckCircle2, RefreshCw, XCircle } from "lucide-react";
import { getPendingRequests, reviewResourceRequest } from "../lib/api";
import { subscribeToDbUpdates } from "../lib/db";
import { ResourceRequestRecord } from "../lib/types";
import { useAuth } from "../providers/AuthProvider";

export function ReviewRequests() {
  const { currentUser } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<ResourceRequestRecord[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  async function loadPendingRequests() {
    const requests = await getPendingRequests();
    setPendingRequests(requests);
  }

  useEffect(() => {
    loadPendingRequests();
    const unsubscribe = subscribeToDbUpdates(loadPendingRequests);
    return unsubscribe;
  }, []);

  async function handleReview(requestId: string, action: "Approved" | "Rejected") {
    if (!currentUser) {
      return;
    }

    setBusyId(requestId);
    setError("");
    setMessage("");

    try {
      const reviewed = await reviewResourceRequest(requestId, action, currentUser);
      setMessage(
        `${reviewed.resourceName} request ${action.toLowerCase()} and database status updated.`,
      );
      await loadPendingRequests();
    } catch (reviewError) {
      setError(
        reviewError instanceof Error
          ? reviewError.message
          : "Could not review request.",
      );
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-[2rem] leading-none font-handwriting">Admin Review Requests Dashboard</h2>
          <p className="text-sm text-gray-600">
            Review all pending faculty requests, then approve or reject them to
            update the shared request database.
          </p>
        </div>
        <button
          type="button"
          onClick={loadPendingRequests}
          className="inline-flex items-center gap-2 rounded-[1rem] border-2 border-black bg-[#d8fb77] px-4 py-2 font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
        >
          <RefreshCw size={16} />
          Refresh Pending Requests
        </button>
      </section>

      {message ? (
        <div className="rounded-xl border-2 border-lime-500 bg-lime-50 px-4 py-3 text-sm font-medium text-lime-800">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-xl border-2 border-red-400 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      <section className="rounded-[1.5rem] border-2 border-black bg-white p-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-black font-handwriting text-xl">
                <th className="p-3">Faculty</th>
                <th className="p-3">Resource</th>
                <th className="p-3">Classroom</th>
                <th className="p-3 text-center">Quantity</th>
                <th className="p-3">Requested On</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.map((request) => (
                <tr key={request.id} className="border-b border-black/10 last:border-b-0">
                  <td className="p-3 font-bold">{request.requesterName}</td>
                  <td className="p-3">{request.resourceName}</td>
                  <td className="p-3">{request.classroomType}</td>
                  <td className="p-3 text-center font-mono">{request.quantity}</td>
                  <td className="p-3">{new Date(request.requestedAt).toLocaleString()}</td>
                  <td className="p-3">
                    <div className="flex justify-center gap-3">
                      <button
                        type="button"
                        disabled={busyId === request.id}
                        onClick={() => handleReview(request.id, "Approved")}
                        className="inline-flex items-center gap-2 rounded-[1rem] border-2 border-black bg-lime-200 px-3 py-2 text-sm font-bold"
                      >
                        <CheckCircle2 size={16} />
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={busyId === request.id}
                        onClick={() => handleReview(request.id, "Rejected")}
                        className="inline-flex items-center gap-2 rounded-[1rem] border-2 border-black bg-red-200 px-3 py-2 text-sm font-bold"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pendingRequests.length === 0 ? (
                <tr>
                  <td className="p-4 text-center text-gray-500" colSpan={6}>
                    There are no pending requests to review.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
