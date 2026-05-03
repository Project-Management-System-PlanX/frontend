"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { fetchClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/config";
import { createClient } from "@/lib/supabase/client";

import type { Message } from "./message-types";
import { messageKeys, normalizeMessage } from "./message-utils";
export { messageKeys, normalizeMessage };
export type { Message };

export function useMessages(channelId: string | null) {
	const queryClient = useQueryClient();
	const supabaseRef = useRef(createClient());

	const {
		data: messages = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: messageKeys.byChannel(channelId || "none"),
		queryFn: async () => {
			if (!channelId) return [];
			const supabase = supabaseRef.current;
			const {
				data: { session },
			} = await supabase.auth.getSession();
			const token = session?.access_token;

			const data = await fetchClient<any[]>(API_ENDPOINTS.MESSAGES_BY_CHANNEL(channelId), {
				token,
				method: "GET",
			});

			return (data || []).map(normalizeMessage);
		},
		enabled: !!channelId,
	});

	// Supabase Realtime subscription
	useEffect(() => {
		if (!channelId) return;

		const supabase = supabaseRef.current;
		const subscription = supabase
			.channel(`room:${channelId}`)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "messages",
					filter: `channel_id=eq.${channelId}`,
				},
				async (payload: any) => {
					let userData: Record<string, unknown> | null = null;
					try {
						const res = await supabase
							.from("users")
							.select("firstName, lastName, username, imageUrl, email")
							.eq("supabaseId", payload.new.user_id)
							.single();
						userData = res.data;
					} catch (e) {
						console.error("Error fetching user data:", e);
					}

					let parentData: Message["parent"] = null;
					const parentId = payload.new.parent_id;
					if (parentId) {
						const currentMsgs =
							queryClient.getQueryData<Message[]>(messageKeys.byChannel(channelId)) || [];
						const found = currentMsgs.find((m) => m.id === parentId);
						if (found) {
							parentData = {
								id: found.id,
								content: found.content || "",
								userId: found.userId || found.user_id,
								user_id: found.user_id || found.userId,
								fileUrl: found.fileUrl || found.file_url || null,
								file_url: found.file_url || found.fileUrl || null,
								fileName: found.fileName || found.file_name || null,
								file_name: found.file_name || found.fileName || null,
								fileType: found.fileType || found.file_type || null,
								file_type: found.file_type || found.fileType || null,
								user: found.users || found.user || undefined,
							};
						} else {
							try {
								const res = await supabase
									.from("messages")
									.select("id, content, user_id, file_url, file_name, file_type")
									.eq("id", parentId)
									.single();
								if (res.data) {
									const parentUserRes = await supabase
										.from("users")
										.select("firstName, lastName, username, email, imageUrl")
										.eq("supabaseId", res.data.user_id)
										.single();
									parentData = {
										id: res.data.id,
										content: res.data.content,
										userId: res.data.user_id,
										user_id: res.data.user_id,
										fileUrl: res.data.file_url,
										file_url: res.data.file_url,
										fileName: res.data.file_name,
										file_name: res.data.file_name,
										fileType: res.data.file_type,
										file_type: res.data.file_type,
										user: parentUserRes.data || undefined,
									};
								}
							} catch (e) {
								console.error("Error fetching parent message:", e);
							}
						}
					}

					const newMessage = normalizeMessage({
						...payload.new,
						users: userData || undefined,
						parent: parentData,
					});

					queryClient.setQueryData(messageKeys.byChannel(channelId), (old: Message[] = []) => {
						if (old.some((msg) => msg.id === newMessage.id)) return old;
						return [...old, newMessage];
					});
				},
			)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "messages",
					filter: `channel_id=eq.${channelId}`,
				},
				(payload: any) => {
					const updated = normalizeMessage(payload.new);
					queryClient.setQueryData(messageKeys.byChannel(channelId), (old: Message[] = []) =>
						old.map((msg) => (msg.id === updated.id ? { ...msg, ...updated } : msg)),
					);
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(subscription);
		};
	}, [channelId, queryClient]);

	const sendMessage = useCallback(
		async (
			content: string,
			_userId: string,
			fileDetails?: { url: string; name: string; type: string; size: number; duration?: number },
			parentId?: string,
		) => {
			if (!channelId || (!content.trim() && !fileDetails)) return;

			const supabase = supabaseRef.current;
			const {
				data: { session },
			} = await supabase.auth.getSession();
			const token = session?.access_token;
			const userEmail = session?.user?.email || "";
			const userMeta = session?.user?.user_metadata;

			const body: any = {
				channelId,
				content: content.trim() || null,
			};

			if (fileDetails) {
				body.fileUrl = fileDetails.url;
				body.fileName = fileDetails.name;
				body.fileType = fileDetails.type;
				body.fileSize = fileDetails.size;
				if (fileDetails.duration != null) body.duration = fileDetails.duration;
			}

			if (parentId) body.parentId = parentId;

			const result = await fetchClient<any>(API_ENDPOINTS.MESSAGES, {
				token,
				method: "POST",
				body: JSON.stringify(body),
			});

			const newMsg = normalizeMessage({
				...result,
				users: result.user || {
					firstName: userMeta?.first_name || userMeta?.full_name?.split(" ")[0] || null,
					lastName:
						userMeta?.last_name || userMeta?.full_name?.split(" ").slice(1).join(" ") || null,
					username: userMeta?.username || null,
					imageUrl: userMeta?.avatar_url || userMeta?.picture || null,
					email: userEmail,
				},
			});

			queryClient.setQueryData(messageKeys.byChannel(channelId), (old: Message[] = []) => {
				if (old.some((msg) => msg.id === newMsg.id)) return old;
				return [...old, newMsg];
			});

			return result;
		},
		[channelId, queryClient],
	);

	const deleteMessage = useCallback(
		async (messageId: string) => {
			if (!channelId) return;

			const {
				data: { session },
			} = await supabaseRef.current.auth.getSession();
			const token = session?.access_token;

			await fetchClient(API_ENDPOINTS.MESSAGE_DELETE(messageId), {
				token,
				method: "DELETE",
			});

			queryClient.setQueryData(messageKeys.byChannel(channelId), (old: Message[] = []) =>
				old.map((msg) =>
					msg.id === messageId
						? {
								...msg,
								content: "",
								deletedAt: new Date().toISOString(),
								deleted_at: new Date().toISOString(),
								file_url: undefined,
								fileUrl: undefined,
								file_name: undefined,
								fileName: undefined,
								file_type: undefined,
								fileType: undefined,
								file_size: undefined,
								fileSize: undefined,
								duration: undefined,
							}
						: msg,
				),
			);
		},
		[channelId, queryClient],
	);

	const editMessage = useCallback(
		async (messageId: string, content: string) => {
			if (!channelId || !content.trim()) return;

			const {
				data: { session },
			} = await supabaseRef.current.auth.getSession();
			const token = session?.access_token;

			const updatedMsgData = await fetchClient(API_ENDPOINTS.MESSAGE_UPDATE(messageId), {
				token,
				method: "PATCH",
				body: JSON.stringify({ content: content.trim() }),
			});

			const normalizedUpdate = normalizeMessage(updatedMsgData);

			queryClient.setQueryData(messageKeys.byChannel(channelId), (old: Message[] = []) =>
				old.map((msg) => (msg.id === messageId ? { ...msg, ...normalizedUpdate } : msg)),
			);
			return normalizedUpdate;
		},
		[channelId, queryClient],
	);

	const togglePinMessage = useCallback(
		async (messageId: string, isPinned: boolean) => {
			if (!channelId) return;

			const {
				data: { session },
			} = await supabaseRef.current.auth.getSession();
			const token = session?.access_token;

			const updatedMsgData = await fetchClient(API_ENDPOINTS.MESSAGE_PIN(messageId), {
				token,
				method: "PATCH",
				body: JSON.stringify({ isPinned }),
			});

			const normalizedUpdate = normalizeMessage(updatedMsgData);

			queryClient.setQueryData(messageKeys.byChannel(channelId), (old: Message[] = []) =>
				old.map((msg) => (msg.id === messageId ? { ...msg, ...normalizedUpdate } : msg)),
			);
			return normalizedUpdate;
		},
		[channelId, queryClient],
	);

	return {
		messages,
		isLoading,
		error: error ? (error instanceof Error ? error.message : String(error)) : null,
		sendMessage,
		deleteMessage,
		editMessage,
		togglePinMessage,
	};
}
