import { readDb, writeDb } from "./db";
import {
  RequestPayload,
  RequestStatus,
  ResourceRecord,
  ResourceRequestRecord,
  UserRecord,
} from "./types";

const SESSION_KEY = "smart-classroom-session";
const REVIEW_WINDOW_MS = 20 * 1000;

function delay(ms = 250) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function cloneResources(resources: ResourceRecord[]) {
  return resources.map((resource) => ({ ...resource }));
}

function syncPendingRequests() {
  const db = readDb();
  let changed = false;
  const resources = cloneResources(db.resources);
  const resourceIndex = new Map(resources.map((resource) => [resource.id, resource]));

  const resourceRequests = db.resourceRequests.map((request) => {
    if (request.status !== "Pending") {
      return request;
    }

    const elapsed = Date.now() - new Date(request.requestedAt).getTime();
    if (elapsed < REVIEW_WINDOW_MS) {
      return request;
    }

    changed = true;
    const resource = resourceIndex.get(request.resourceId);
    const nextStatus: RequestStatus = request.quantity <= 3 ? "Approved" : "Rejected";

    if (nextStatus === "Rejected" && resource) {
      resource.availableQuantity += request.quantity;
      resource.lastUpdated = new Date().toISOString();
    }

    return {
      ...request,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
      statusMessage:
        nextStatus === "Approved"
          ? "Approved automatically after availability review."
          : "Rejected automatically after availability review.",
    };
  });

  if (changed) {
    writeDb({
      ...db,
      resources,
      resourceRequests,
    });
  }
}

function getSessionUserId() {
  return window.localStorage.getItem(SESSION_KEY);
}

function saveSessionUserId(userId: string) {
  window.localStorage.setItem(SESSION_KEY, userId);
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

export async function getCurrentSessionUser() {
  await delay(100);
  syncPendingRequests();

  const sessionUserId = getSessionUserId();
  if (!sessionUserId) {
    return null;
  }

  const db = readDb();
  return db.users.find((user) => user.id === sessionUserId) ?? null;
}

export async function authenticateUser(email: string, password: string) {
  await delay();

  const db = readDb();
  const user = db.users.find(
    (candidate) =>
      candidate.email.toLowerCase() === email.trim().toLowerCase() &&
      candidate.password === password,
  );

  if (!user) {
    throw new Error("Invalid email or password. Please try again.");
  }

  saveSessionUserId(user.id);
  return user;
}

export async function getResourceAvailability() {
  await delay(150);
  syncPendingRequests();
  return readDb().resources;
}

export async function getResourceRequests(userId?: string) {
  await delay(150);
  syncPendingRequests();

  return readDb()
    .resourceRequests
    .filter((request) => (userId ? request.userId === userId : true))
    .sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
    );
}

function validateQuantity(resource: ResourceRecord | undefined, quantity: number) {
  if (!resource) {
    throw new Error("The selected resource does not exist.");
  }

  if (quantity < 1) {
    throw new Error("Quantity must be at least 1.");
  }

  if (quantity > resource.availableQuantity) {
    throw new Error(
      `Only ${resource.availableQuantity} ${resource.name.toLowerCase()} unit(s) are currently available.`,
    );
  }
}

export async function createResourceRequest(
  user: UserRecord,
  payload: RequestPayload,
) {
  await delay();

  const db = readDb();
  const resources = cloneResources(db.resources);
  const resource = resources.find((item) => item.id === payload.resourceId);

  validateQuantity(resource, payload.quantity);

  if (!resource) {
    throw new Error("The selected resource does not exist.");
  }

  resource.availableQuantity -= payload.quantity;
  resource.lastUpdated = new Date().toISOString();

  const request: ResourceRequestRecord = {
    id: `request-${crypto.randomUUID()}`,
    userId: user.id,
    requesterName: user.name,
    classroomType: payload.classroomType,
    resourceId: resource.id,
    resourceName: resource.name,
    quantity: payload.quantity,
    purpose: payload.purpose.trim(),
    notes: payload.notes.trim(),
    requestedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "Pending",
    statusMessage: "Request submitted successfully and sent for review.",
  };

  writeDb({
    ...db,
    resources,
    resourceRequests: [request, ...db.resourceRequests],
  });

  return request;
}

export async function updateResourceRequest(
  requestId: string,
  user: UserRecord,
  payload: RequestPayload,
) {
  await delay();
  syncPendingRequests();

  const db = readDb();
  const resources = cloneResources(db.resources);
  const requests = [...db.resourceRequests];
  const requestIndex = requests.findIndex((request) => request.id === requestId);

  if (requestIndex === -1) {
    throw new Error("The request could not be found.");
  }

  const currentRequest = requests[requestIndex];

  if (currentRequest.userId !== user.id) {
    throw new Error("You can only modify your own requests.");
  }

  if (currentRequest.status !== "Pending") {
    throw new Error("Only pending requests can be modified.");
  }

  const currentResource = resources.find(
    (resource) => resource.id === currentRequest.resourceId,
  );

  if (currentResource) {
    currentResource.availableQuantity += currentRequest.quantity;
    currentResource.lastUpdated = new Date().toISOString();
  }

  const nextResource = resources.find((resource) => resource.id === payload.resourceId);
  validateQuantity(nextResource, payload.quantity);

  if (!nextResource) {
    throw new Error("The selected resource does not exist.");
  }

  nextResource.availableQuantity -= payload.quantity;
  nextResource.lastUpdated = new Date().toISOString();

  requests[requestIndex] = {
    ...currentRequest,
    classroomType: payload.classroomType,
    resourceId: nextResource.id,
    resourceName: nextResource.name,
    quantity: payload.quantity,
    purpose: payload.purpose.trim(),
    notes: payload.notes.trim(),
    updatedAt: new Date().toISOString(),
    statusMessage: "Request updated successfully and resubmitted for review.",
  };

  writeDb({
    ...db,
    resources,
    resourceRequests: requests,
  });

  return requests[requestIndex];
}

export async function cancelResourceRequest(requestId: string, user: UserRecord) {
  await delay();
  syncPendingRequests();

  const db = readDb();
  const resources = cloneResources(db.resources);
  const requests = [...db.resourceRequests];
  const requestIndex = requests.findIndex((request) => request.id === requestId);

  if (requestIndex === -1) {
    throw new Error("The request could not be found.");
  }

  const request = requests[requestIndex];

  if (request.userId !== user.id) {
    throw new Error("You can only cancel your own requests.");
  }

  if (request.status !== "Pending") {
    throw new Error("Only pending requests can be cancelled.");
  }

  const resource = resources.find((item) => item.id === request.resourceId);
  if (resource) {
    resource.availableQuantity += request.quantity;
    resource.lastUpdated = new Date().toISOString();
  }

  requests[requestIndex] = {
    ...request,
    status: "Cancelled",
    updatedAt: new Date().toISOString(),
    statusMessage: "Request cancelled by faculty member.",
  };

  writeDb({
    ...db,
    resources,
    resourceRequests: requests,
  });

  return requests[requestIndex];
}
