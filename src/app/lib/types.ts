export type UserRole = "faculty" | "admin" | "manager";

export type RequestStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Cancelled";

export type ResourceOperationalStatus = "Available" | "Unavailable";

export type NotificationStatus = "Approved" | "Rejected" | "Cancelled" | "Info";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
}

export interface ResourceRecord {
  id: string;
  name: string;
  type: string;
  classroomType: string;
  location: string;
  totalQuantity: number;
  availableQuantity: number;
  status: ResourceOperationalStatus;
  technicianNotes: string;
  lastUpdated: string;
  updatedBy: string;
}

export interface ResourceRequestRecord {
  id: string;
  userId: string;
  requesterName: string;
  classroomType: string;
  resourceId: string;
  resourceName: string;
  quantity: number;
  purpose: string;
  notes: string;
  requestedAt: string;
  updatedAt: string;
  status: RequestStatus;
  statusMessage: string;
  reviewedBy?: string;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  requestId: string;
  resourceName: string;
  classroomType: string;
  status: NotificationStatus;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface DatabaseShape {
  users: UserRecord[];
  resources: ResourceRecord[];
  resourceRequests: ResourceRequestRecord[];
  notifications: NotificationRecord[];
}

export interface RequestPayload {
  classroomType: string;
  resourceId: string;
  quantity: number;
  purpose: string;
  notes: string;
}

export interface InventoryUpdatePayload {
  totalQuantity: number;
  availableQuantity: number;
  status: ResourceOperationalStatus;
  location: string;
  classroomType: string;
  technicianNotes: string;
}

export interface ReportFilters {
  startDate: string;
  endDate: string;
  resourceName: string;
  location: string;
}

export interface UtilizationChartPoint {
  name: string;
  value: number;
}

export interface UtilizationTableRow {
  id: string;
  faculty: string;
  classroomType: string;
  location: string;
  resourceName: string;
  quantity: number;
  status: RequestStatus;
  requestedAt: string;
}

export interface UtilizationReport {
  totals: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    cancelled: number;
  };
  byResource: UtilizationChartPoint[];
  byLocation: UtilizationChartPoint[];
  rows: UtilizationTableRow[];
  availableResources: string[];
  locations: string[];
}
