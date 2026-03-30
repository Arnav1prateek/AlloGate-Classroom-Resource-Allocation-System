import { FormEvent, useEffect, useMemo, useState } from "react";
import { Ban, RefreshCw, Save } from "lucide-react";
import { getInventoryData, updateResourceInventory } from "../lib/api";
import { subscribeToDbUpdates } from "../lib/db";
import { InventoryUpdatePayload, ResourceRecord } from "../lib/types";
import { useAuth } from "../providers/AuthProvider";

const emptyPayload: InventoryUpdatePayload = {
  totalQuantity: 0,
  availableQuantity: 0,
  status: "Available",
  location: "",
  classroomType: "",
  technicianNotes: "",
};

export function UpdateStatus() {
  const { currentUser } = useAuth();
  const [resources, setResources] = useState<ResourceRecord[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [formState, setFormState] = useState<InventoryUpdatePayload>(emptyPayload);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadResources() {
    const nextResources = await getInventoryData();
    setResources(nextResources);
  }

  useEffect(() => {
    loadResources();
    const unsubscribe = subscribeToDbUpdates(loadResources);
    return unsubscribe;
  }, []);

  const selectedResource = useMemo(
    () => resources.find((resource) => resource.id === selectedId) ?? null,
    [resources, selectedId],
  );

  useEffect(() => {
    if (!selectedResource) {
      return;
    }

    setFormState({
      totalQuantity: selectedResource.totalQuantity,
      availableQuantity: selectedResource.availableQuantity,
      status: selectedResource.status,
      location: selectedResource.location,
      classroomType: selectedResource.classroomType,
      technicianNotes: selectedResource.technicianNotes,
    });
  }, [selectedResource]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!currentUser || !selectedId) {
      return;
    }

    setMessage("");
    setError("");

    try {
      await updateResourceInventory(selectedId, formState, currentUser);
      setMessage("Resource status and quantity updated successfully.");
      await loadResources();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Could not update resource.",
      );
    }
  }

  async function markUnavailable() {
    if (!currentUser || !selectedId) {
      return;
    }

    setMessage("");
    setError("");

    try {
      await updateResourceInventory(
        selectedId,
        {
          ...formState,
          status: "Unavailable",
          availableQuantity: 0,
        },
        currentUser,
      );
      setMessage("Resource marked as unavailable and inventory updated immediately.");
      await loadResources();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Could not mark resource as unavailable.",
      );
    }
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-[2rem] leading-none font-handwriting">Lab Technician Resource Update UI</h2>
          <p className="text-sm text-gray-600">
            Update resource availability, quantity, and technician notes. Changes
            are reflected in inventory immediately.
          </p>
        </div>
        <button
          type="button"
          onClick={loadResources}
          className="inline-flex items-center gap-2 rounded-[1rem] border-2 border-black bg-[#d8fb77] px-4 py-2 font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
        >
          <RefreshCw size={16} />
          Refresh Resource Data
        </button>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[1.5rem] border-2 border-black bg-white p-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="mb-4 text-[1.8rem] leading-none font-handwriting">Resources</h3>
          <div className="space-y-3">
            {resources.map((resource) => (
              <button
                key={resource.id}
                type="button"
                onClick={() => setSelectedId(resource.id)}
                className={`w-full rounded-[1rem] border-2 border-black p-4 text-left ${
                  selectedId === resource.id ? "bg-[#d8fb77]" : "bg-[#fffce8]"
                }`}
              >
                <div className="font-bold">{resource.name}</div>
                <div className="mt-1 text-sm text-gray-700">
                  {resource.classroomType} | {resource.location}
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {resource.availableQuantity} / {resource.totalQuantity} available
                </div>
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[1.5rem] border-2 border-black bg-white p-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
        >
          <h3 className="mb-4 text-[1.8rem] leading-none font-handwriting">Update Resource Status</h3>

          {!selectedResource ? (
            <div className="rounded-[1rem] border border-dashed border-black/30 bg-gray-50 px-4 py-10 text-center text-sm text-gray-600">
              Select a resource from the left to update its status or quantity.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="classroom">Classroom / Lab</label>
                <select
                  id="classroom"
                  value={formState.classroomType}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      classroomType: event.target.value,
                    }))
                  }
                  className="h-12 rounded-[1rem] border-2 border-black px-4"
                >
                  <option value="Regular Class">Regular Class</option>
                  <option value="Scientific Lab">Scientific Lab</option>
                  <option value="Computer Lab">Computer Lab</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  value={formState.location}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      location: event.target.value,
                    }))
                  }
                  className="h-12 rounded-[1rem] border-2 border-black px-4"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="total">Total Quantity</label>
                <input
                  id="total"
                  type="number"
                  min={0}
                  value={formState.totalQuantity}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      totalQuantity: Number(event.target.value),
                    }))
                  }
                  className="h-12 rounded-[1rem] border-2 border-black px-4"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="available">Available Quantity</label>
                <input
                  id="available"
                  type="number"
                  min={0}
                  value={formState.availableQuantity}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      availableQuantity: Number(event.target.value),
                    }))
                  }
                  className="h-12 rounded-[1rem] border-2 border-black px-4"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  value={formState.status}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      status: event.target.value as InventoryUpdatePayload["status"],
                    }))
                  }
                  className="h-12 rounded-[1rem] border-2 border-black px-4"
                >
                  <option value="Available">Available</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label htmlFor="technician-notes">Technician Notes</label>
                <textarea
                  id="technician-notes"
                  value={formState.technicianNotes}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      technicianNotes: event.target.value,
                    }))
                  }
                  className="min-h-28 rounded-[1rem] border-2 border-black px-4 py-3"
                />
              </div>
            </div>
          )}

          {message ? (
            <div className="mt-4 rounded-xl border-2 border-lime-500 bg-lime-50 px-4 py-3 text-sm font-medium text-lime-800">
              {message}
            </div>
          ) : null}
          {error ? (
            <div className="mt-4 rounded-xl border-2 border-red-400 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          {selectedResource ? (
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-[1rem] border-2 border-black bg-[#d8fb77] px-5 py-3 font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                <Save size={16} />
                Save Resource Update
              </button>
              <button
                type="button"
                onClick={markUnavailable}
                className="inline-flex items-center gap-2 rounded-[1rem] border-2 border-black bg-red-200 px-5 py-3 font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                <Ban size={16} />
                Mark Unavailable
              </button>
            </div>
          ) : null}
        </form>
      </section>
    </div>
  );
}
