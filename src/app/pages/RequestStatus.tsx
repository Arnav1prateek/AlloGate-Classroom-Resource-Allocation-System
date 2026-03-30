import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { getResourceRequests } from "../lib/api";
import { subscribeToDbUpdates } from "../lib/db";
import { ResourceRequestRecord } from "../lib/types";
import { useAuth } from "../providers/AuthProvider";

const statusStyles: Record<string, string> = {
  Pending: "bg-yellow-200",
  Approved: "bg-lime-200",
  Rejected: "bg-red-200",
  Cancelled: "bg-gray-200",
};

export function RequestStatus() {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<ResourceRequestRecord[]>([]);
  const [lastLoadedAt, setLastLoadedAt] = useState("");

  async function loadStatuses() {
    if (!currentUser) {
      return;
    }

    const nextRequests = await getResourceRequests(currentUser.id);
    setRequests(nextRequests);
    setLastLoadedAt(new Date().toLocaleTimeString());
  }

  useEffect(() => {
    loadStatuses();
    const intervalId = window.setInterval(loadStatuses, 5000);
    const unsubscribe = subscribeToDbUpdates(loadStatuses);

    return () => {
      window.clearInterval(intervalId);
      unsubscribe();
    };
  }, [currentUser]);

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-handwriting">Track Request Status</h2>
          <p className="text-sm text-gray-600">
            Request statuses auto-refresh every 5 seconds. You can also reload
            manually to check the latest outcome.
          </p>
        </div>
        <button
          type="button"
          onClick={loadStatuses}
          className="inline-flex items-center gap-2 self-start rounded-lg border-2 border-black bg-lime-300 px-4 py-2 font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
        >
          <RefreshCw size={16} />
          Reload Status
        </button>
      </section>

      <section className="rounded-xl border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="mb-4 text-sm text-gray-600">
          Last refreshed: {lastLoadedAt || "Loading..."}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-black font-handwriting text-xl">
                <th className="p-3">Resource</th>
                <th className="p-3">Requested On</th>
                <th className="p-3 text-center">Quantity</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className="border-b border-black/10 last:border-b-0">
                  <td className="p-3 font-bold">{request.resourceName}</td>
                  <td className="p-3">
                    {new Date(request.requestedAt).toLocaleString()}
                  </td>
                  <td className="p-3 text-center font-mono">{request.quantity}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-flex min-w-28 justify-center rounded-full border-2 border-black px-3 py-1 text-sm font-bold ${
                        statusStyles[request.status]
                      }`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="p-3">{request.statusMessage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
