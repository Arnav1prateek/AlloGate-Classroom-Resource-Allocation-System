import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { getInventoryData } from "../lib/api";
import { subscribeToDbUpdates } from "../lib/db";
import { ResourceRecord } from "../lib/types";

export function Inventory() {
  const [resources, setResources] = useState<ResourceRecord[]>([]);
  const [lastLoadedAt, setLastLoadedAt] = useState("");

  async function loadInventory() {
    const nextResources = await getInventoryData();
    setResources(nextResources);
    setLastLoadedAt(new Date().toLocaleTimeString());
  }

  useEffect(() => {
    loadInventory();
    const unsubscribe = subscribeToDbUpdates(loadInventory);
    return unsubscribe;
  }, []);

  const groupedResources = useMemo(() => {
    const groups = new Map<string, ResourceRecord[]>();

    resources.forEach((resource) => {
      const current = groups.get(resource.classroomType) ?? [];
      current.push(resource);
      groups.set(resource.classroomType, current);
    });

    return Array.from(groups.entries());
  }, [resources]);

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-[2rem] leading-none font-handwriting">Resource Inventory Dashboard</h2>
          <p className="text-sm text-gray-600">
            Inventory is grouped by classroom and lab so admins and technicians can
            review stock quickly.
          </p>
        </div>
        <button
          type="button"
          onClick={loadInventory}
          className="inline-flex items-center gap-2 rounded-[1rem] border-2 border-black bg-[#d8fb77] px-4 py-2 font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
        >
          <RefreshCw size={16} />
          Refresh Inventory
        </button>
      </section>

      <div className="text-sm text-gray-600">Last refreshed: {lastLoadedAt || "Loading..."}</div>

      <section className="grid gap-5">
        {groupedResources.map(([group, items]) => (
          <div
            key={group}
            className="rounded-[1.5rem] border-2 border-black bg-white p-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
          >
            <h3 className="mb-4 text-[1.8rem] leading-none font-handwriting">{group}</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b-2 border-black font-handwriting text-xl">
                    <th className="p-3">Resource</th>
                    <th className="p-3">Location</th>
                    <th className="p-3 text-center">Available</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3">Technician Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((resource) => (
                    <tr key={resource.id} className="border-b border-black/10 last:border-b-0">
                      <td className="p-3 font-bold">{resource.name}</td>
                      <td className="p-3">{resource.location}</td>
                      <td className="p-3 text-center font-mono">
                        {resource.availableQuantity} / {resource.totalQuantity}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`rounded-full border-2 border-black px-3 py-1 text-sm font-bold ${
                            resource.status === "Available" ? "bg-lime-200" : "bg-red-200"
                          }`}
                        >
                          {resource.status}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-gray-600">{resource.technicianNotes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
