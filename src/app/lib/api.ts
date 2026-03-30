import { readDb, writeDb } from "./db";
import {
  InventoryUpdatePayload,
  NotificationRecord,
  NotificationStatus,
  ReportFilters,
  RequestPayload,
  RequestStatus,
  ResourceOperationalStatus,
  ResourceRecord,
  ResourceRequestRecord,
  UserRecord,
  UtilizationChartPoint,
  UtilizationReport,
} from "./types";

const SESSION_KEY = "smart-classroom-session-v2";

function delay(ms = 250) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function cloneResources(resources: ResourceRecord[]) {
  return resources.map((resource) => ({ ...resource }));
}

function cloneRequests(requests: ResourceRequestRecord[]) {
  return requests.map((request) => ({ ...request }));
}

function cloneNotifications(notifications: NotificationRecord[]) {
  return notifications.map((notification) => ({ ...notification }));
}

function getSessionUserId() {
  return window.localStorage.getItem(SESSION_KEY);
}

function saveSessionUserId(userId: string) {
  window.localStorage.setItem(SESSION_KEY, userId);
}

function createNotification(args: {
  userId: string;
  requestId: string;
  resourceName: string;
  classroomType: string;
  status: NotificationStatus;
  title: string;
  message: string;
}) {
  return {
    id: `notification-${crypto.randomUUID()}`,
    userId: args.userId,
    requestId: args.requestId,
    resourceName: args.resourceName,
    classroomType: args.classroomType,
    status: args.status,
    title: args.title,
    message: args.message,
    createdAt: new Date().toISOString(),
    read: false,
  };
}

function getResourceOrThrow(resources: ResourceRecord[], resourceId: string) {
  const resource = resources.find((item) => item.id === resourceId);

  if (!resource) {
    throw new Error("The selected resource does not exist.");
  }

  return resource;
}

function validateQuantity(resource: ResourceRecord, quantity: number) {
  if (quantity < 1) {
    throw new Error("Quantity must be at least 1.");
  }

  if (resource.status === "Unavailable") {
    throw new Error(`${resource.name} is currently marked as unavailable.`);
  }

  if (quantity > resource.availableQuantity) {
    throw new Error(
      `Only ${resource.availableQuantity} ${resource.name.toLowerCase()} unit(s) are currently available.`,
    );
  }
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

export async function getCurrentSessionUser() {
  await delay(100);

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
  await delay(120);
  return readDb().resources;
}

export async function getInventoryData() {
  await delay(120);

  return readDb().resources.sort((left, right) => {
    if (left.classroomType === right.classroomType) {
      return left.name.localeCompare(right.name);
    }

    return left.classroomType.localeCompare(right.classroomType);
  });
}

export async function getResourceRequests(userId?: string) {
  await delay(150);

  return readDb()
    .resourceRequests
    .filter((request) => (userId ? request.userId === userId : true))
    .sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
    );
}

export async function getPendingRequests() {
  await delay(150);

  return readDb()
    .resourceRequests
    .filter((request) => request.status === "Pending")
    .sort(
      (left, right) =>
        new Date(left.requestedAt).getTime() - new Date(right.requestedAt).getTime(),
    );
}

export async function getNotifications(userId: string) {
  await delay(120);

  return readDb()
    .notifications
    .filter((notification) => notification.userId === userId)
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );
}

export async function createResourceRequest(
  user: UserRecord,
  payload: RequestPayload,
) {
  await delay();

  const db = readDb();
  const resources = cloneResources(db.resources);
  const resource = getResourceOrThrow(resources, payload.resourceId);

  validateQuantity(resource, payload.quantity);

  resource.availableQuantity -= payload.quantity;
  resource.lastUpdated = new Date().toISOString();
  resource.updatedBy = user.name;

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

  const db = readDb();
  const resources = cloneResources(db.resources);
  const requests = cloneRequests(db.resourceRequests);
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
    currentResource.updatedBy = user.name;
  }

  const nextResource = getResourceOrThrow(resources, payload.resourceId);
  validateQuantity(nextResource, payload.quantity);

  nextResource.availableQuantity -= payload.quantity;
  nextResource.lastUpdated = new Date().toISOString();
  nextResource.updatedBy = user.name;

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

  const db = readDb();
  const resources = cloneResources(db.resources);
  const requests = cloneRequests(db.resourceRequests);
  const notifications = cloneNotifications(db.notifications);
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
    resource.updatedBy = user.name;
  }

  requests[requestIndex] = {
    ...request,
    status: "Cancelled",
    updatedAt: new Date().toISOString(),
    statusMessage: "Request cancelled by faculty member.",
  };

  notifications.unshift(
    createNotification({
      userId: user.id,
      requestId: request.id,
      resourceName: request.resourceName,
      classroomType: request.classroomType,
      status: "Cancelled",
      title: `${request.resourceName} request cancelled`,
      message: "Your pending request has been cancelled successfully.",
    }),
  );

  writeDb({
    ...db,
    resources,
    resourceRequests: requests,
    notifications,
  });

  return requests[requestIndex];
}

export async function reviewResourceRequest(
  requestId: string,
  action: "Approved" | "Rejected",
  reviewer: UserRecord,
) {
  await delay();

  const db = readDb();
  const resources = cloneResources(db.resources);
  const requests = cloneRequests(db.resourceRequests);
  const notifications = cloneNotifications(db.notifications);
  const requestIndex = requests.findIndex((request) => request.id === requestId);

  if (requestIndex === -1) {
    throw new Error("The request could not be found.");
  }

  const request = requests[requestIndex];

  if (request.status !== "Pending") {
    throw new Error("Only pending requests can be reviewed.");
  }

  const resource = resources.find((item) => item.id === request.resourceId);

  if (action === "Rejected" && resource) {
    resource.availableQuantity += request.quantity;
    resource.lastUpdated = new Date().toISOString();
    resource.updatedBy = reviewer.name;
  }

  requests[requestIndex] = {
    ...request,
    status: action,
    updatedAt: new Date().toISOString(),
    reviewedBy: reviewer.name,
    statusMessage:
      action === "Approved"
        ? `Approved by ${reviewer.name}.`
        : `Rejected by ${reviewer.name}.`,
  };

  notifications.unshift(
    createNotification({
      userId: request.userId,
      requestId: request.id,
      resourceName: request.resourceName,
      classroomType: request.classroomType,
      status: action,
      title: `${request.resourceName} request ${action.toLowerCase()}`,
      message:
        action === "Approved"
          ? `Your request for ${request.quantity} ${request.resourceName} has been approved.`
          : `Your request for ${request.quantity} ${request.resourceName} has been rejected.`,
    }),
  );

  writeDb({
    ...db,
    resources,
    resourceRequests: requests,
    notifications,
  });

  return requests[requestIndex];
}

export async function updateResourceInventory(
  resourceId: string,
  payload: InventoryUpdatePayload,
  manager: UserRecord,
) {
  await delay();

  const db = readDb();
  const resources = cloneResources(db.resources);
  const resourceIndex = resources.findIndex((resource) => resource.id === resourceId);

  if (resourceIndex === -1) {
    throw new Error("Resource not found.");
  }

  if (payload.totalQuantity < 0) {
    throw new Error("Total quantity cannot be negative.");
  }

  if (payload.availableQuantity < 0) {
    throw new Error("Available quantity cannot be negative.");
  }

  if (payload.availableQuantity > payload.totalQuantity) {
    throw new Error("Available quantity cannot exceed total quantity.");
  }

  const nextStatus: ResourceOperationalStatus =
    payload.status === "Unavailable" || payload.totalQuantity === 0
      ? "Unavailable"
      : "Available";

  resources[resourceIndex] = {
    ...resources[resourceIndex],
    totalQuantity: payload.totalQuantity,
    availableQuantity:
      nextStatus === "Unavailable" ? 0 : payload.availableQuantity,
    status: nextStatus,
    location: payload.location.trim(),
    classroomType: payload.classroomType,
    technicianNotes: payload.technicianNotes.trim(),
    lastUpdated: new Date().toISOString(),
    updatedBy: manager.name,
  };

  writeDb({
    ...db,
    resources,
  });

  return resources[resourceIndex];
}

function matchesDateFilter(
  value: string,
  startDate: string,
  endDate: string,
) {
  const timestamp = new Date(value).getTime();

  if (startDate) {
    const start = new Date(`${startDate}T00:00:00`).getTime();
    if (timestamp < start) {
      return false;
    }
  }

  if (endDate) {
    const end = new Date(`${endDate}T23:59:59`).getTime();
    if (timestamp > end) {
      return false;
    }
  }

  return true;
}

function countBy<T>(items: T[], getKey: (item: T) => string) {
  const counts = new Map<string, number>();

  items.forEach((item) => {
    const key = getKey(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map<UtilizationChartPoint>(([name, value]) => ({ name, value }))
    .sort((left, right) => right.value - left.value);
}

export async function getUtilizationReport(
  filters: ReportFilters,
) {
  await delay(180);

  const db = readDb();
  const resourceMap = new Map(db.resources.map((resource) => [resource.id, resource]));

  const rows = db.resourceRequests
    .filter((request) => matchesDateFilter(request.requestedAt, filters.startDate, filters.endDate))
    .filter((request) =>
      filters.resourceName ? request.resourceName === filters.resourceName : true,
    )
    .filter((request) => {
      if (!filters.location) {
        return true;
      }

      return resourceMap.get(request.resourceId)?.location === filters.location;
    })
    .map((request) => ({
      id: request.id,
      faculty: request.requesterName,
      classroomType: request.classroomType,
      location: resourceMap.get(request.resourceId)?.location ?? "Unknown",
      resourceName: request.resourceName,
      quantity: request.quantity,
      status: request.status,
      requestedAt: request.requestedAt,
    }))
    .sort(
      (left, right) =>
        new Date(right.requestedAt).getTime() - new Date(left.requestedAt).getTime(),
    );

  const report: UtilizationReport = {
    totals: {
      total: rows.length,
      approved: rows.filter((row) => row.status === "Approved").length,
      pending: rows.filter((row) => row.status === "Pending").length,
      rejected: rows.filter((row) => row.status === "Rejected").length,
      cancelled: rows.filter((row) => row.status === "Cancelled").length,
    },
    byResource: countBy(rows, (row) => row.resourceName),
    byLocation: countBy(rows, (row) => row.location),
    rows,
    availableResources: db.resources.map((resource) => resource.name).sort(),
    locations: Array.from(new Set(db.resources.map((resource) => resource.location))).sort(),
  };

  return report;
}
