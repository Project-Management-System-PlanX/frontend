"use client";

import { useCallback, useEffect, useRef } from "react";
import { fetchClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/config";
import { createClient } from "@/lib/supabase/client";
import { useUnreadStore } from "@/stores/unread-store";

/**
 * Hook for managing unread message counts with realtime updates.
 *
 * - Fetches initial unread counts from backend
 * - Subscribes to Supabase realtime for new messages
 * - Increments counts when messages arrive in non-active channels
 * - Marks channels as read when opened
 */
export function useUnread(
	workspaceId: string | null,
	userId: string | null,
	token: string | null,
	activeChannelId: string | null,
) {
	const { setCounts, incrementCount, resetCount, setLastReadMessageId } = useUnreadStore();
	const supabaseRef = useRef(createClient());
	const activeChannelRef = useRef(activeChannelId);

	// Keep ref in sync with the active channel
	useEffect(() => {
		activeChannelRef.current = activeChannelId;
	}, [activeChannelId]);

	// Fetch initial unread counts
	useEffect(() => {
		if (!workspaceId || !token) return;

		const fetchCounts = async () => {
			try {
				const data = await fetchClient<
					{ channelId: string; count: number; lastReadMessageId: string | null }[]
				>(API_ENDPOINTS.UNREAD_COUNTS(workspaceId), {
					token,
					method: "GET",
				});
				setCounts(data || []);
			} catch (err) {
				console.error("Failed to fetch unread counts:", err);
			}
		};

		fetchCounts();
	}, [workspaceId, token, setCounts]);

	// Subscribe to new messages for unread tracking
	useEffect(() => {
		if (!userId || !workspaceId) return;

		const supabase = supabaseRef.current;

		const subscription = supabase
			.channel("unread-tracking")
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "messages",
				},
				(payload: any) => {
					const msgUserId = payload.new.user_id;
					const channelId = payload.new.channel_id;

					// Don't count own messages
					if (msgUserId === userId) return;

					// Don't count if user is currently viewing that channel
					if (activeChannelRef.current === channelId) return;

					// Increment unread for this channel
					incrementCount(channelId);
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(subscription);
		};
	}, [userId, workspaceId, incrementCount]);

	// Mark channel as read
	const markChannelAsRead = useCallback(
		async (channelId: string, lastMessageId?: string) => {
			if (!token) return;

			// Optimistically reset count
			resetCount(channelId);
			if (lastMessageId) {
				setLastReadMessageId(channelId, lastMessageId);
			}

			try {
				await fetchClient(API_ENDPOINTS.MARK_READ, {
					token,
					method: "POST",
					body: JSON.stringify({
						channelId,
						messageId: lastMessageId,
					}),
				});
			} catch (err) {
				console.error("Failed to mark channel as read:", err);
			}
		},
		[token, resetCount, setLastReadMessageId],
	);

	// Get read state for a channel (for scroll-to-unread)
	const getReadState = useCallback(
		async (channelId: string) => {
			if (!token) return null;

			try {
				const data = await fetchClient<{
					lastReadAt: string | null;
					lastReadMessageId: string | null;
				} | null>(API_ENDPOINTS.READ_STATE(channelId), {
					token,
					method: "GET",
				});
				return data;
			} catch {
				return null;
			}
		},
		[token],
	);

	return {
		markChannelAsRead,
		getReadState,
	};
}
