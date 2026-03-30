import {
  DatabaseShape,
  NotificationRecord,
  ResourceRecord,
  ResourceRequestRecord,
  UserRecord,
} from "./types";

const DB_KEY = "smart-classroom-db-v2";
const DB_EVENT = "smart-classroom-db-updated";

const now = () => new Date().toISOString();

const seededUsers: UserRecord[] = [
  {
    id: "user-faculty-1",
    name: "Dr. Maya Patel",
    email: "faculty@smartclass.edu",
    password: "faculty123",
    role: "faculty",
    department: "Computer Science",
  },
  {
    id: "user-admin-1",
    name: "Rohan Mehta",
    email: "admin@smartclass.edu",
    password: "admin123",
    role: "admin",
    department: "Academic Office",
  },
  {
    id: "user-manager-1",
    name: "Nisha Rao",
    email: "manager@smartclass.edu",
    password: "manager123",
    role: "manager",
    department: "Resource Operations",
  },
];

const seededResources: ResourceRecord[] = [
  {
    id: "resource-projector",
    name: "Projector",
    type: "Presentation",
    classroomType: "Regular Class",
    location: "Academic Block A",
    totalQuantity: 8,
    availableQuantity: 5,
    status: "Available",
    technicianNotes: "Lamp replaced this month.",
    lastUpdated: now(),
    updatedBy: "Nisha Rao",
  },
  {
    id: "resource-smartboard",
    name: "Smart Board",
    type: "Digital",
    classroomType: "Regular Class",
    location: "Academic Block B",
    totalQuantity: 6,
    availableQuantity: 3,
    status: "Available",
    technicianNotes: "Calibrated for seminar hall use.",
    lastUpdated: now(),
    updatedBy: "Nisha Rao",
  },
  {
    id: "resource-laptop",
    name: "Laptop",
    type: "Computing",
    classroomType: "Computer Lab",
    location: "Innovation Lab",
    totalQuantity: 25,
    availableQuantity: 11,
    status: "Available",
    technicianNotes: "Two units reserved for workshop support.",
    lastUpdated: now(),
    updatedBy: "Nisha Rao",
  },
  {
    id: "resource-microscope",
    name: "Microscope",
    type: "Laboratory",
    classroomType: "Scientific Lab",
    location: "Science Block",
    totalQuantity: 18,
    availableQuantity: 6,
    status: "Available",
    technicianNotes: "Handle with sealed lens kit.",
    lastUpdated: now(),
    updatedBy: "Nisha Rao",
  },
];

const seededRequests: ResourceRequestRecord[] = [
  {
    id: "request-seed-1",
    userId: "user-faculty-1",
    requesterName: "Dr. Maya Patel",
    classroomType: "Regular Class",
    resourceId: "resource-projector",
    resourceName: "Projector",
    quantity: 1,
    purpose: "AI lecture demo",
    notes: "Need HDMI support for presentation.",
    requestedAt: "2026-03-22T08:15:00.000Z",
    updatedAt: "2026-03-22T09:00:00.000Z",
    status: "Approved",
    statusMessage: "Approved by the academic office for tomorrow's lecture.",
    reviewedBy: "Rohan Mehta",
  },
  {
    id: "request-seed-2",
    userId: "user-faculty-1",
    requesterName: "Dr. Maya Patel",
    classroomType: "Scientific Lab",
    resourceId: "resource-microscope",
    resourceName: "Microscope",
    quantity: 7,
    purpose: "Cell structure practical",
    notes: "Need matching optical set.",
    requestedAt: "2026-03-21T05:45:00.000Z",
    updatedAt: "2026-03-21T06:10:00.000Z",
    status: "Rejected",
    statusMessage: "Rejected because the requested quantity exceeded lab allocation.",
    reviewedBy: "Rohan Mehta",
  },
  {
    id: "request-seed-3",
    userId: "user-faculty-1",
    requesterName: "Dr. Maya Patel",
    classroomType: "Computer Lab",
    resourceId: "resource-laptop",
    resourceName: "Laptop",
    quantity: 2,
    purpose: "Guest workshop",
    notes: "Can be moved to evening slot if needed.",
    requestedAt: "2026-03-29T09:45:00.000Z",
    updatedAt: "2026-03-29T09:45:00.000Z",
    status: "Pending",
    statusMessage: "Awaiting academic office review.",
  },
  {
    id: "request-seed-4",
    userId: "user-faculty-1",
    requesterName: "Dr. Maya Patel",
    classroomType: "Regular Class",
    resourceId: "resource-smartboard",
    resourceName: "Smart Board",
    quantity: 1,
    purpose: "Curriculum planning session",
    notes: "Need touch pen set.",
    requestedAt: "2026-03-30T08:30:00.000Z",
    updatedAt: "2026-03-30T08:30:00.000Z",
    status: "Pending",
    statusMessage: "Awaiting academic office review.",
  },
];

const seededNotifications: NotificationRecord[] = [
  {
    id: "notification-seed-1",
    userId: "user-faculty-1",
    requestId: "request-seed-1",
    resourceName: "Projector",
    classroomType: "Regular Class",
    status: "Approved",
    title: "Projector request approved",
    message: "Your request for 1 Projector has been approved by the academic office.",
    createdAt: "2026-03-22T09:00:00.000Z",
    read: false,
  },
  {
    id: "notification-seed-2",
    userId: "user-faculty-1",
    requestId: "request-seed-2",
    resourceName: "Microscope",
    classroomType: "Scientific Lab",
    status: "Rejected",
    title: "Microscope request rejected",
    message: "Your request was rejected because the requested quantity exceeded lab allocation.",
    createdAt: "2026-03-21T06:10:00.000Z",
    read: false,
  },
];

const defaultDb = (): DatabaseShape => ({
  users: seededUsers,
  resources: seededResources,
  resourceRequests: seededRequests,
  notifications: seededNotifications,
});

export function initializeDb() {
  if (typeof window === "undefined") {
    return;
  }

  if (!window.localStorage.getItem(DB_KEY)) {
    window.localStorage.setItem(DB_KEY, JSON.stringify(defaultDb()));
  }
}

export function readDb(): DatabaseShape {
  initializeDb();

  const raw = window.localStorage.getItem(DB_KEY);

  if (!raw) {
    const freshDb = defaultDb();
    window.localStorage.setItem(DB_KEY, JSON.stringify(freshDb));
    return freshDb;
  }

  return JSON.parse(raw) as DatabaseShape;
}

export function writeDb(db: DatabaseShape) {
  window.localStorage.setItem(DB_KEY, JSON.stringify(db));
  window.dispatchEvent(new CustomEvent(DB_EVENT));
}

export function subscribeToDbUpdates(listener: () => void) {
  window.addEventListener(DB_EVENT, listener);
  window.addEventListener("storage", listener);

  return () => {
    window.removeEventListener(DB_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
