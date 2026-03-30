import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { getResourceAvailability } from "../lib/api";
import { subscribeToDbUpdates } from "../lib/db";
import { ResourceRecord } from "../lib/types";

export function ResourceAvailability() {
  const [resources, setResources] = useState<ResourceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastLoadedAt, setLastLoadedAt] = useState("");

  async function loadResources() {
    try {
      setError("");
      const nextResources = await getResourceAvailability();
      setResources(nextResources);
      setLastLoadedAt(new Date().toLocaleTimeString());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load resource availability.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadResources();
    const intervalId = window.setInterval(loadResources, 5000);
    const unsubscribe = subscribeToDbUpdates(loadResources);

    return () => {
      window.clearInterval(intervalId);
      unsubscribe();
    };
  }, []);

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-handwriting">Resource Availability</h2>
          <p className="text-sm text-gray-600">
            Live inventory data refreshes every 5 seconds so faculty can check
            current availability before submitting a request.
          </p>
        </div>
        <button
          type="button"
          onClick={loadResources}
          className="inline-flex items-center gap-2 self-start rounded-lg border-2 border-black bg-lime-300 px-4 py-2 font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          <RefreshCw size={16} />
          Reload Availability
        </button>
      </section>

      <section className="rounded-xl border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-gray-600">
            Last refreshed: {lastLoadedAt || "Loading..."}
          </div>
          {error ? (
            <div className="rounded-md border-2 border-red-400 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-black font-handwriting text-xl">
                <th className="p-3">Resource</th>
                <th className="p-3">Classroom Type</th>
                <th className="p-3">Location</th>
                <th className="p-3 text-center">Available</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((resource) => {
                const isAvailable = resource.availableQuantity > 0;

                return (
                  <tr
                    key={resource.id}
                    className="border-b border-black/10 text-base last:border-b-0"
                  >
                    <td className="p-3 font-bold">{resource.name}</td>
                    <td className="p-3">{resource.classroomType}</td>
                    <td className="p-3">{resource.location}</td>
                    <td className="p-3 text-center font-mono">
                      {resource.availableQuantity} / {resource.totalQuantity}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-flex min-w-32 justify-center rounded-full border-2 border-black px-3 py-1 text-sm font-bold ${
                          isAvailable
                            ? "bg-lime-200 text-black"
                            : "bg-red-200 text-black"
                        }`}
                      >
                        {isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && resources.length === 0 ? (
                <tr>
                  <td className="p-4 text-center text-gray-500" colSpan={5}>
                    No resources found.
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
