export type UserRole = "faculty" | "admin" | "manager";

export type RequestStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Cancelled";

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
  lastUpdated: string;
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
}

export interface DatabaseShape {
  users: UserRecord[];
  resources: ResourceRecord[];
  resourceRequests: ResourceRequestRecord[];
}

export interface RequestPayload {
  classroomType: string;
  resourceId: string;
  quantity: number;
  purpose: string;
  notes: string;
}
