import { FormEvent, useEffect, useState } from "react";
import { ClipboardCheck } from "lucide-react";
import {
  createResourceRequest,
  getResourceAvailability,
  getResourceRequests,
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

export function RequestResources() {
  const { currentUser } = useAuth();
  const [resources, setResources] = useState<ResourceRecord[]>([]);
  const [recentRequests, setRecentRequests] = useState<ResourceRequestRecord[]>([]);
  const [formState, setFormState] = useState<RequestPayload>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState("");

  async function loadData() {
    if (!currentUser) {
      return;
    }

    const [nextResources, nextRequests] = await Promise.all([
      getResourceAvailability(),
      getResourceRequests(currentUser.id),
    ]);

    setResources(nextResources);
    setRecentRequests(nextRequests.slice(0, 5));
  }

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToDbUpdates(loadData);
    return unsubscribe;
  }, [currentUser]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!currentUser) {
      return;
    }

    setIsSubmitting(true);
    setError("");
    setConfirmation("");

    try {
      const request = await createResourceRequest(currentUser, formState);
      setConfirmation(
        `${request.resourceName} request submitted successfully. Current status: ${request.status}.`,
      );
      setFormState(emptyForm);
      await loadData();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not submit request.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <section className="max-w-4xl">
        <h2 className="text-[2rem] leading-none font-handwriting">Request Teaching Resources</h2>
        <p className="text-sm text-gray-600">
          Submit a teaching resource request through the form below. Availability
          is validated before the request is saved to the resource request table.
        </p>
      </section>

      <section className="grid min-h-0 flex-1 items-start gap-5 xl:grid-cols-[1.12fr_0.88fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-[1.6rem] border-2 border-black bg-white p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] xl:h-full xl:overflow-auto"
        >
          <div className="mb-6 flex items-center gap-3">
            <ClipboardCheck size={24} />
            <h3 className="text-[1.8rem] leading-none font-handwriting">Resource Request Form</h3>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="classroom-type">Classroom Type</label>
              <select
                id="classroom-type"
                value={formState.classroomType}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    classroomType: event.target.value,
                  }))
                }
                className="h-12 rounded-[1rem] border-2 border-black px-4 text-base"
                required
              >
                <option value="">Select classroom type</option>
                <option value="Regular Class">Regular Class</option>
                <option value="Scientific Lab">Scientific Lab</option>
                <option value="Computer Lab">Computer Lab</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="resource-id">Resource</label>
              <select
                id="resource-id"
                value={formState.resourceId}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    resourceId: event.target.value,
                  }))
                }
                className="h-12 rounded-[1rem] border-2 border-black px-4 text-base"
                required
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
              <label htmlFor="quantity">Quantity</label>
              <input
                id="quantity"
                type="number"
                min={1}
                value={formState.quantity}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    quantity: Number(event.target.value),
                  }))
                }
                className="h-12 rounded-[1rem] border-2 border-black px-4 text-base"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="purpose">Purpose</label>
              <input
                id="purpose"
                value={formState.purpose}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    purpose: event.target.value,
                  }))
                }
                className="h-12 rounded-[1rem] border-2 border-black px-4 text-base"
                placeholder="Workshop, lecture, practical..."
                required
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                value={formState.notes}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
                className="min-h-32 rounded-[1rem] border-2 border-black px-4 py-3 text-base"
                placeholder="Add any timing, room, or setup notes."
              />
            </div>
          </div>

          {error ? (
            <div className="mt-5 rounded-xl border-2 border-red-400 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}
          {confirmation ? (
            <div className="mt-5 rounded-xl border-2 border-lime-500 bg-lime-50 px-4 py-3 text-sm font-medium text-lime-800">
              {confirmation}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 rounded-[1rem] border-2 border-black bg-[#c7f84b] px-7 py-3 text-lg font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:shadow-none"
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>

        <div className="rounded-[1.6rem] border-2 border-black bg-white p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] xl:h-full xl:overflow-auto">
          <h3 className="mb-4 text-[1.8rem] leading-none font-handwriting">Recent Request Records</h3>
          <div className="space-y-3">
            {recentRequests.map((request) => (
              <div
                key={request.id}
                className="rounded-[1.2rem] border-2 border-black bg-[#fffce8] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-lg font-bold">{request.resourceName}</div>
                  <span className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-bold">
                    {request.status}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-700">
                  {request.classroomType} | Qty {request.quantity}
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {request.statusMessage}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
