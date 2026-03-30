import { useEffect, useState } from "react";
import { Bell, RefreshCw } from "lucide-react";
import { getNotifications } from "../lib/api";
import { subscribeToDbUpdates } from "../lib/db";
import { NotificationRecord } from "../lib/types";
import { useAuth } from "../providers/AuthProvider";

const statusStyles = {
  Approved: "bg-lime-200",
  Rejected: "bg-red-200",
  Cancelled: "bg-gray-200",
  Info: "bg-yellow-200",
};

export function Notifications() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);

  async function loadNotifications() {
    if (!currentUser) {
      return;
    }

    const nextNotifications = await getNotifications(currentUser.id);
    setNotifications(nextNotifications);
  }

  useEffect(() => {
    loadNotifications();
    const unsubscribe = subscribeToDbUpdates(loadNotifications);
    return unsubscribe;
  }, [currentUser]);

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <Bell size={28} />
          <div>
            <h2 className="text-[2rem] leading-none font-handwriting">Request Notifications</h2>
            <p className="text-sm text-gray-600">
              Notifications are stored in the database whenever a request status changes.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={loadNotifications}
          className="inline-flex items-center gap-2 rounded-[1rem] border-2 border-black bg-[#d8fb77] px-4 py-2 font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
        >
          <RefreshCw size={16} />
          Refresh Notifications
        </button>
      </section>

      <section className="grid gap-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="rounded-[1.3rem] border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">{notification.title}</h3>
                <p className="text-sm text-gray-600">
                  {notification.resourceName} | {notification.classroomType}
                </p>
              </div>
              <span
                className={`rounded-full border-2 border-black px-3 py-1 text-sm font-bold ${
                  statusStyles[notification.status]
                }`}
              >
                {notification.status}
              </span>
            </div>
            <p className="mt-3 text-gray-700">{notification.message}</p>
            <div className="mt-3 text-sm text-gray-500">
              {new Date(notification.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
        {notifications.length === 0 ? (
          <div className="rounded-[1.3rem] border-2 border-dashed border-black/30 bg-gray-50 px-4 py-10 text-center text-sm text-gray-600">
            No notifications yet. Approval and rejection updates will appear here.
          </div>
        ) : null}
      </section>
    </div>
  );
}
