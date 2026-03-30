import { NavLink, Outlet, useNavigate } from "react-router";
import {
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  PackageSearch,
  Shield,
  Wrench,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "../providers/AuthProvider";

function getNavItems(role: string) {
  if (role === "admin") {
    return [
      { path: "/app/review", label: "Review Requests", icon: Shield },
      { path: "/app/availability", label: "Availability", icon: PackageSearch },
    ];
  }

  if (role === "manager") {
    return [
      { path: "/app/update-status", label: "Update Status", icon: Wrench },
      { path: "/app/availability", label: "Availability", icon: PackageSearch },
    ];
  }

  return [
    { path: "/app/request", label: "Request Resources", icon: BookOpen },
    { path: "/app/availability", label: "View Availability", icon: PackageSearch },
    { path: "/app/manage-requests", label: "Modify / Cancel", icon: LayoutDashboard },
    { path: "/app/request-status", label: "Track Status", icon: ClipboardList },
  ];
}

function getRoleDescription(role: string) {
  if (role === "admin") {
    return "Admin Dashboard";
  }

  if (role === "manager") {
    return "Resource Manager Dashboard";
  }

  return "Faculty Dashboard";
}

export function DashboardLayout() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  if (!currentUser) {
    return null;
  }

  const navItems = getNavItems(currentUser.role);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f8fafc_0%,#f7f7ef_55%,#ecfccb_100%)] p-2 md:p-3">
      <div className="mx-auto flex h-[calc(100vh-1rem)] w-full max-w-[1280px] overflow-hidden rounded-[2rem] border-2 border-black bg-[#fffdf8] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] md:h-[calc(100vh-1.5rem)]">
        <aside className="flex w-[320px] shrink-0 flex-col justify-between border-r-2 border-black bg-[#fff6df]">
          <div>
            <div className="border-b-2 border-black px-6 py-7">
              <div className="text-sm font-bold uppercase tracking-[0.2em] text-gray-600">
                {getRoleDescription(currentUser.role)}
              </div>
              <h1 className="mt-4 text-[2.1rem] leading-none font-handwriting">Resource Manager</h1>
              <p className="mt-5 text-base leading-7 text-gray-700">
                {currentUser.name}
                <br />
                {currentUser.department}
              </p>
            </div>

            <nav className="flex flex-col gap-4 px-4 py-5">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-3 rounded-[1.1rem] border-2 border-black px-5 py-3.5 text-[1.05rem] font-bold transition-all",
                      isActive
                        ? "bg-[#d8fb77] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        : "bg-white hover:bg-yellow-50 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                    )
                  }
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="border-t-2 border-black p-4">
            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/", { replace: true });
              }}
              className="flex w-full items-center justify-center gap-2 rounded-[1.1rem] border-2 border-black bg-[#f8c0c0] px-4 py-3 font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto p-3 md:p-4">
          <div className="h-full rounded-[1.7rem] border-2 border-black bg-[#fcfcfc] p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
