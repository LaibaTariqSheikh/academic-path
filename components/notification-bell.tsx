"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { apiUrl } from "@/lib/api";

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function NotificationBell({ userId }: { userId: number }) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(apiUrl(`/api/notifications/${userId}`));
      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Notification bell fetch error:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, [userId]);

  const unreadCount = useMemo(
    () => items.filter((item) => !item.is_read).length,
    [items]
  );

  const markAsRead = async (notificationId: number) => {
    try {
      await fetch(apiUrl(`/api/notifications/read/${notificationId}`), {
        method: "PUT",
      });
      fetchNotifications();
    } catch (error) {
      console.error("Mark notification read error:", error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative rounded-xl border border-neutral-300 bg-white p-2.5 text-neutral-900 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-white dark:bg-white dark:text-black">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-85 max-w-[90vw] rounded-2xl border border-neutral-300 bg-white p-4 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <button
              onClick={() => setOpen(false)}
              className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            >
              Close
            </button>
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              No notifications yet.
            </p>
          ) : (
            <div className="max-h-96 space-y-3 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-xl border p-3 ${
                    item.is_read
                      ? "border-neutral-300 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950"
                      : "border-black bg-white dark:border-white dark:bg-neutral-950"
                  }`}
                >
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    {item.message}
                  </p>
                  {!item.is_read && (
                    <button
                      onClick={() => markAsRead(item.id)}
                      className="mt-3 rounded-lg bg-neutral-900 px-3 py-2 text-xs text-white dark:bg-neutral-100 dark:text-neutral-900"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}