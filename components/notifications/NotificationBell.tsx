// components/notifications/NotificationBell.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCheck, CheckSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export function NotificationBell({ theme = "light" }: { theme?: "light" | "dark" }) {
    const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const isDark = theme === "dark";

    return (
        <div ref={ref} className="relative z-[9999]">
            {/* Bell Button */}
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className={cn(
                    "relative flex items-center justify-center p-2 rounded-lg transition-colors",
                    isDark
                        ? open
                            ? "bg-white/15 text-white"
                            : "text-white/60 hover:bg-white/10 hover:text-white"
                        : open
                            ? "bg-gray-900/10 text-gray-900"
                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-100",
                )}
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#e85d04] text-white text-[10px] font-bold flex items-center justify-center border-2 border-transparent">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                            <span className="font-semibold text-gray-900 text-[14px]">Notifications</span>
                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    onClick={markAllRead}
                                    className="flex items-center gap-1 text-[12px] text-blue-500 hover:text-blue-700 font-medium"
                                >
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-50">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                                    <Bell className="w-8 h-8 opacity-30" />
                                    <span className="text-[13px]">No notifications yet</span>
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => !n.isRead && markRead(n.id)}
                                        className={cn(
                                            "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors",
                                            n.isRead
                                                ? "bg-white hover:bg-slate-50"
                                                : "bg-blue-50/60 hover:bg-blue-50",
                                        )}
                                    >
                                        {/* Icon */}
                                        <div className="w-8 h-8 rounded-full bg-[#e85d04]/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <CheckSquare className="w-4 h-4 text-[#e85d04]" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                "text-[13px] text-gray-800 leading-snug",
                                                !n.isRead && "font-semibold",
                                            )}>
                                                {n.title}
                                            </p>
                                            {n.body && (
                                                <p className="text-[12px] text-gray-500 truncate mt-0.5">
                                                    {n.body}
                                                </p>
                                            )}
                                            <p className="text-[11px] text-gray-400 mt-1">
                                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>

                                        {/* Unread dot */}
                                        {!n.isRead && (
                                            <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}