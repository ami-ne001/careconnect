import { useEffect, useState } from "react";
import { notificationsApi } from "@/api";
import type { NotificationResponse } from "@/types";
import { CheckCircle2, Bell } from "lucide-react";

export function Notifications() {
  const [items, setItems] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = items.filter((n) => !n.isRead).length;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await notificationsApi.getMyNotifications();
        if (!cancelled) {
          setItems(res.data ?? []);
        }
      } catch {
        if (!cancelled) {
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleMarkOne = async (id: number) => {
    const target = items.find((n) => n.id === id);
    if (!target || target.isRead) return;
    try {
      await notificationsApi.markAsRead(id);
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch {
      // ignore for now
    }
  };

  const handleMarkAll = async () => {
    if (unreadCount === 0) return;
    try {
      setMarkingAll(true);
      await notificationsApi.markAllAsRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore for now
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-[#0F172A] flex items-center gap-2">
            <Bell size={18} className="text-[#0EA5E9]" />
            Notifications
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            {loading
              ? "Loading your notifications..."
              : unreadCount === 0
                ? "You're all caught up."
                : `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}.`}
          </p>
        </div>
        <button
          type="button"
          onClick={handleMarkAll}
          disabled={unreadCount === 0 || markingAll}
          className={`h-9 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 border ${
            unreadCount === 0 || markingAll
              ? "border-[#E2E8F0] text-[#94A3B8] cursor-not-allowed bg-white"
              : "border-[#0EA5E9] text-[#0EA5E9] hover:bg-[#EFF6FF]"
          }`}
        >
          <CheckCircle2 size={14} />
          Mark all as read
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        {loading ? (
          <div className="px-5 py-10 text-sm text-[#64748B] text-center">
            Loading notifications...
          </div>
        ) : items.length === 0 ? (
          <div className="px-5 py-10 text-sm text-[#64748B] text-center">
            You don't have any notifications yet.
          </div>
        ) : (
          <ul className="divide-y divide-[#F1F5F9]">
            {items.map((n) => (
              <li
                key={n.id}
                className={`px-5 py-3 flex items-start gap-3 ${
                  !n.isRead ? "bg-[#F9FAFB]" : ""
                }`}
              >
                {!n.isRead ? (
                  <span className="mt-2 w-2 h-2 rounded-full bg-[#0EA5E9]" />
                ) : (
                  <CheckCircle2 size={14} className="mt-1 text-[#CBD5E1]" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className="text-sm font-medium text-[#0F172A] truncate">
                      {n.title}
                    </p>
                    <span className="text-[11px] text-[#94A3B8] whitespace-nowrap">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B]">
                    {n.message}
                  </p>
                </div>
                {!n.isRead && (
                  <button
                    type="button"
                    onClick={() => handleMarkOne(n.id)}
                    className="ml-2 text-[11px] text-[#0EA5E9] hover:underline"
                  >
                    Mark read
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

