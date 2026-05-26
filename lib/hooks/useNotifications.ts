// lib/hooks/useNotifications.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";

export interface Notification {
    id: string;
    userId: string;
    type: string;
    title: string;
    body?: string;
    entityId?: string;
    entityType?: string;
    isRead: boolean;
    createdAt: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

export function useNotifications() {
    const { token, user } = useSupabaseAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch existing notifications from backend
    const fetchNotifications = useCallback(async () => {
        if (!token) return;
        try {
            const res = await fetch(`${BACKEND_URL}/notifications`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return;
            const data = await res.json();
            if (Array.isArray(data)) {
                setNotifications(data);
                setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
            }
        } catch { }
    }, [token]);

    // Mark one notification as read
    const markRead = useCallback(async (id: string) => {
        if (!token) return;
        try {
            await fetch(`${BACKEND_URL}/notifications/${id}/read`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch { }
    }, [token]);

    // Mark all notifications as read
    const markAllRead = useCallback(async () => {
        if (!token) return;
        try {
            await fetch(`${BACKEND_URL}/notifications/read-all`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch { }
    }, [token]);

    // Initial fetch when token is ready
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Supabase Realtime — listen for new notifications INSERTed for this user
    useEffect(() => {
        if (!user?.id) return;

        const channel = supabase
            .channel(`notifications:${user.id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    // Column is snake_case in the DB (mapped via Prisma @map)
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    // Map snake_case DB columns → camelCase frontend interface
                    const row = payload.new as Record<string, unknown>;
                    const newNotif: Notification = {
                        id: row.id as string,
                        userId: (row.user_id as string) ?? (row.userId as string),
                        type: row.type as string,
                        title: row.title as string,
                        body: (row.body as string) ?? undefined,
                        entityId: (row.entity_id as string) ?? (row.entityId as string) ?? undefined,
                        entityType: (row.entity_type as string) ?? (row.entityType as string) ?? undefined,
                        isRead: (row.is_read as boolean) ?? (row.isRead as boolean) ?? false,
                        createdAt: (row.created_at as string) ?? (row.createdAt as string),
                    };
                    setNotifications((prev) => [newNotif, ...prev]);
                    setUnreadCount((prev) => prev + 1);
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id]);

    return { notifications, unreadCount, markRead, markAllRead, refetch: fetchNotifications };
}