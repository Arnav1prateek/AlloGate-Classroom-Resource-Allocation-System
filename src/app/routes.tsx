import type { ReactElement } from "react";
import { Navigate, createBrowserRouter } from "react-router";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { Inventory } from "./pages/Inventory";
import { Login } from "./pages/Login";
import { ManageRequests } from "./pages/ManageRequests";
import { Notifications } from "./pages/Notifications";
import { RequestResources } from "./pages/RequestResources";
import { RequestStatus } from "./pages/RequestStatus";
import { Reports } from "./pages/Reports";
import { ResourceAvailability } from "./pages/ResourceAvailability";
import { ReviewRequests } from "./pages/ReviewRequests";
import { UpdateStatus } from "./pages/UpdateStatus";
import { useAuth } from "./providers/AuthProvider";
import type { UserRole } from "./lib/types";

function getRoleLandingPath(role: UserRole) {
  if (role === "admin") {
    return "/app/review";
  }

  if (role === "manager") {
    return "/app/update-status";
  }

  return "/app/request";
}

function ProtectedRoute({
  allowedRoles,
}: {
  allowedRoles: UserRole[];
}) {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to={getRoleLandingPath(currentUser.role)} replace />;
  }

  return <DashboardLayout />;
}

function RoleGuard({
  allowedRoles,
  children,
}: {
  allowedRoles: UserRole[];
  children: ReactElement;
}) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to={getRoleLandingPath(currentUser.role)} replace />;
  }

  return children;
}

function RoleRedirect() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to={getRoleLandingPath(currentUser.role)} replace />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/app",
    element: <ProtectedRoute allowedRoles={["faculty", "admin", "manager"]} />,
    children: [
      {
        index: true,
        element: <RoleRedirect />,
      },
      {
        path: "request",
        element: (
          <RoleGuard allowedRoles={["faculty"]}>
            <RequestResources />
          </RoleGuard>
        ),
      },
      {
        path: "availability",
        element: (
          <RoleGuard allowedRoles={["faculty", "admin", "manager"]}>
            <ResourceAvailability />
          </RoleGuard>
        ),
      },
      {
        path: "manage-requests",
        element: (
          <RoleGuard allowedRoles={["faculty"]}>
            <ManageRequests />
          </RoleGuard>
        ),
      },
      {
        path: "request-status",
        element: (
          <RoleGuard allowedRoles={["faculty"]}>
            <RequestStatus />
          </RoleGuard>
        ),
      },
      {
        path: "review",
        element: (
          <RoleGuard allowedRoles={["admin"]}>
            <ReviewRequests />
          </RoleGuard>
        ),
      },
      {
        path: "update-status",
        element: (
          <RoleGuard allowedRoles={["manager"]}>
            <UpdateStatus />
          </RoleGuard>
        ),
      },
      {
        path: "inventory",
        element: (
          <RoleGuard allowedRoles={["admin", "manager"]}>
            <Inventory />
          </RoleGuard>
        ),
      },
      {
        path: "notifications",
        element: (
          <RoleGuard allowedRoles={["faculty"]}>
            <Notifications />
          </RoleGuard>
        ),
      },
      {
        path: "reports",
        element: (
          <RoleGuard allowedRoles={["admin"]}>
            <Reports />
          </RoleGuard>
        ),
      },
    ],
  },
]);
