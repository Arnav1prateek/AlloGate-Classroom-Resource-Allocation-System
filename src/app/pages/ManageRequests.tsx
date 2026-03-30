import { FormEvent, useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import {
  cancelResourceRequest,
  getResourceAvailability,
  getResourceRequests,
  updateResourceRequest,
} from "../lib/api";
import { subscribeToDbUpdates } from "../lib/db";
import { RequestPayload, ResourceRecord, ResourceRequestRecord } from "../lib/types";
import { useAuth } from "../providers/AuthProvider";

const emptyForm: RequestPayload = {
  classroomType: "",
  resourceId: "",
  quantity: 1,
  purpose: "",
  notes: "",
};

export function ManageRequests() {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<ResourceRequestRecord[]>([]);
  const [resources, setResources] = useState<ResourceRecord[]>([]);
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);
  const [formState, setFormState] = useState<RequestPayload>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    if (!currentUser) {
      return;
    }

    const [nextRequests, nextResources] = await Promise.all([
      getResourceRequests(currentUser.id),
      getResourceAvailability(),
    ]);

    setRequests(nextRequests);
    setResources(nextResources);
  }

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToDbUpdates(loadData);
    return unsubscribe;
  }, [currentUser]);

  const pendingRequests = requests.filter((request) => request.status === "Pending");
  const editingRequest = pendingRequests.find(
    (request) => request.id === editingRequestId,
  );

  function startEditing(request: ResourceRequestRecord) {
    setEditingRequestId(request.id);
    setFormState({
      classroomType: request.classroomType,
      resourceId: request.resourceId,
      quantity: request.quantity,
      purpose: request.purpose,
      notes: request.notes,
    });
    setError("");
    setSuccess("");
  }

  function stopEditing() {
    setEditingRequestId(null);
    setFormState(emptyForm);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!currentUser || !editingRequestId) {
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      await updateResourceRequest(editingRequestId, currentUser, formState);
      setSuccess("Request updated successfully.");
      stopEditing();
      await loadData();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not update request.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCancel(requestId: string) {
    if (!currentUser) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await cancelResourceRequest(requestId, currentUser);
      setSuccess("Request cancelled and availability updated.");
      if (editingRequestId === requestId) {
        stopEditing();
      }
      await loadData();
    } catch (cancelError) {
      setError(
        cancelError instanceof Error
          ? cancelError.message
          : "Could not cancel request.",
      );
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-3xl font-handwriting">Modify or Cancel Requests</h2>
        <p className="text-sm text-gray-600">
          Pending requests can be edited or cancelled. Any cancellation immediately
          returns the reserved quantity back to available inventory.
        </p>
      </section>

      {error ? (
        <div className="rounded-lg border-2 border-red-400 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-lg border-2 border-lime-500 bg-lime-50 px-4 py-3 text-sm font-medium text-lime-800">
          {success}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-xl border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="border-b-2 border-black px-6 py-4">
          <h3 className="text-2xl font-handwriting">Pending Requests</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-black font-handwriting text-xl">
                <th className="p-3">Resource</th>
                <th className="p-3">Classroom</th>
                <th className="p-3 text-center">Quantity</th>
                <th className="p-3">Purpose</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.map((request) => (
                <tr key={request.id} className="border-b border-black/10 last:border-b-0">
                  <td className="p-3 font-bold">{request.resourceName}</td>
                  <td className="p-3">{request.classroomType}</td>
                  <td className="p-3 text-center font-mono">{request.quantity}</td>
                  <td className="p-3">{request.purpose}</td>
                  <td className="p-3">
                    <div className="flex justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => startEditing(request)}
                        className="inline-flex items-center gap-2 rounded-lg border-2 border-black bg-yellow-200 px-3 py-2 text-sm font-bold"
                      >
                        <Pencil size={16} />
                        Modify
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCancel(request.id)}
                        className="inline-flex items-center gap-2 rounded-lg border-2 border-black bg-red-300 px-3 py-2 text-sm font-bold text-black"
                      >
                        <Trash2 size={16} />
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pendingRequests.length === 0 ? (
                <tr>
                  <td className="p-4 text-center text-gray-500" colSpan={5}>
                    There are no pending requests available for modification.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="mb-4">
          <h3 className="text-2xl font-handwriting">Modify Request UI</h3>
          <p className="text-sm text-gray-600">
            Select a pending request above to edit its details.
          </p>
        </div>

        {editingRequest ? (
          <form className="grid grid-cols-1 gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label htmlFor="edit-classroom">Classroom Type</label>
              <select
                id="edit-classroom"
                value={formState.classroomType}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    classroomType: event.target.value,
                  }))
                }
                className="h-12 rounded-lg border-2 border-black px-3"
              >
                <option value="">Select classroom type</option>
                <option value="Regular Class">Regular Class</option>
                <option value="Scientific Lab">Scientific Lab</option>
                <option value="Computer Lab">Computer Lab</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="edit-resource">Resource</label>
              <select
                id="edit-resource"
                value={formState.resourceId}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    resourceId: event.target.value,
                  }))
                }
                className="h-12 rounded-lg border-2 border-black px-3"
              >
                <option value="">Select resource</option>
                {resources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.name} ({resource.availableQuantity} available)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="edit-quantity">Quantity</label>
              <input
                id="edit-quantity"
                type="number"
                min={1}
                value={formState.quantity}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    quantity: Number(event.target.value),
                  }))
                }
                className="h-12 rounded-lg border-2 border-black px-3"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="edit-purpose">Purpose</label>
              <input
                id="edit-purpose"
                value={formState.purpose}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    purpose: event.target.value,
                  }))
                }
                className="h-12 rounded-lg border-2 border-black px-3"
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label htmlFor="edit-notes">Notes</label>
              <textarea
                id="edit-notes"
                value={formState.notes}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
                className="min-h-28 rounded-lg border-2 border-black px-3 py-2"
              />
            </div>

            <div className="flex gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg border-2 border-black bg-lime-300 px-5 py-3 font-bold"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={stopEditing}
                className="rounded-lg border-2 border-black bg-white px-5 py-3 font-bold"
              >
                Close
              </button>
            </div>
          </form>
        ) : (
          <div className="rounded-lg border border-dashed border-black/30 bg-gray-50 px-4 py-8 text-center text-sm text-gray-600">
            Choose a pending request to open the modify request form.
          </div>
        )}
      </section>
    </div>
  );
}
