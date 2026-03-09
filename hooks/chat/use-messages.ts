"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/config";
import { createClient } from "@/lib/supabase/client";

export interface Message {
	id: string;
	channel_id?: string;
	channelId?: string;
	user_id?: string;
	userId?: string;
	content?: string;
	file_url?: string;
	fileUrl?: string;
	file_name?: string;
	fileName?: string;
	file_type?: string;
	fileType?: string;
	file_size?: number;
	fileSize?: number;
	duration?: number;
	is_edited?: boolean;
	isEdited?: boolean;
	deleted_at?: string | null;
	deletedAt?: string | null;
	created_at?: string;
	createdAt?: string;
	updated_at?: string;
	updatedAt?: string;
	parent_id?: string | null;
	parentId?: string | null;
	parent?: {
		id: string;
		content: string;
		userId?: string;
		user_id?: string;
		fileUrl?: string | null;
		file_url?: string | null;
		fileName?: string | null;
		file_name?: string | null;
		fileType?: string | null;
		file_type?: string | null;
		user?: {
			firstName: string | null;
			lastName: string | null;
			username: string | null;
			email: string;
		};
	} | null;
	users?: {
		firstName: string | null;
		lastName: string | null;
		username: string | null;
		imageUrl: string | null;
		email: string;
	};
	user?: {
		firstName: string | null;
		lastName: string | null;
		username: string | null;
		imageUrl: string | null;
		email: string;
	};
}

// Normalize message fields between camelCase (backend) and snake_case (Supabase Realtime)
// biome-ignore lint/suspicious/noExplicitAny: normalizes between camelCase and snake_case from different sources
function normalizeMessage(msg: any): Message {
	return {
		...msg,
		channel_id: msg.channel_id || msg.channelId,
		channelId: msg.channelId || msg.channel_id,
		user_id: msg.user_id || msg.userId,
		userId: msg.userId || msg.user_id,
		file_url: msg.file_url || msg.fileUrl,
		fileUrl: msg.fileUrl || msg.file_url,
		file_name: msg.file_name || msg.fileName,
		fileName: msg.fileName || msg.file_name,
		file_type: msg.file_type || msg.fileType,
		fileType: msg.fileType || msg.file_type,
		file_size: msg.file_size || msg.fileSize,
		fileSize: msg.fileSize || msg.file_size,
		duration: msg.duration ?? undefined,
		is_edited: msg.is_edited ?? msg.isEdited ?? false,
		isEdited: msg.isEdited ?? msg.is_edited ?? false,
		deleted_at: msg.deleted_at || msg.deletedAt || null,
		deletedAt: msg.deletedAt || msg.deleted_at || null,
		created_at: msg.created_at || msg.createdAt,
		createdAt: msg.createdAt || msg.created_at,
		updated_at: msg.updated_at || msg.updatedAt,
		updatedAt: msg.updatedAt || msg.updated_at,
		parent_id: msg.parent_id || msg.parentId || null,
		parentId: msg.parentId || msg.parent_id || null,
		parent: msg.parent || null,
		users: msg.users || msg.user,
		user: msg.user || msg.users,
	};
}

export function useMessages(channelId: string | null) {
	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const supabaseRef = useRef(createClient());

	// Fetch messages from backend API
	const fetchMessages = useCallback(async () => {
		if (!channelId) {
			setMessages([]);
			setIsLoading(false);
			return;
		}

		try {
			const {
				data: { session },
			} = await supabaseRef.current.auth.getSession();
			const token = session?.access_token;

			// biome-ignore lint/suspicious/noExplicitAny: API returns untyped array
			const data = await fetchClient<any[]>(API_ENDPOINTS.MESSAGES_BY_CHANNEL(channelId), {
				token,
				method: "GET",
			});

			setMessages((data || []).map(normalizeMessage));
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Failed to load messages";
			setError(message);
		} finally {
			setIsLoading(false);
		}
	}, [channelId]);

	// Initial fetch + Supabase Realtime subscription
	useEffect(() => {
		if (!channelId) {
			setMessages([]);
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		fetchMessages();

		// Subscribe to Supabase Realtime for live updates from OTHER users
		const supabase = supabaseRef.current;
		const channel = supabase
			.channel(`room:${channelId}`)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "messages",
					filter: `channel_id=eq.${channelId}`,
				},
				// biome-ignore lint/suspicious/noExplicitAny: Supabase realtime payload type
				async (payload: any) => {
					console.log("Realtime event received:", payload);
					let userData: Record<string, unknown> | null = null;
					try {
						const res = await supabase
							.from("users")
							.select("firstName, lastName, username, imageUrl, email")
							.eq("supabaseId", payload.new.user_id)
							.single();
						userData = res.data;
						if (res.error) console.error("Error fetching user data:", res.error);
					} catch (e) {
						console.error("Exception fetching user data:", e);
					}

					// If this is a reply, resolve the parent message from local state or fetch it
					let parentData: Message["parent"] = null;
					const parentId = payload.new.parent_id;
					if (parentId) {
						// Try to find parent in current state first
						setMessages((prev) => {
							const found = prev.find((m) => m.id === parentId);
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
							}
							return prev; // don't mutate
						});
						// If not found locally, fetch from Supabase
						if (!parentData) {
							try {
								const res = await supabase
									.from("messages")
									.select("id, content, user_id, file_url, file_name, file_type")
									.eq("id", parentId)
									.single();
								if (res.data) {
									const parentUserRes = await supabase
										.from("users")
										.select("firstName, lastName, username, email")
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
						...(payload.new as Message),
						users: userData || undefined,
						parent: parentData,
					});
					console.log("Normalized new message:", newMessage);

					setMessages((prev) => {
						if (prev.some((msg) => msg.id === newMessage.id)) {
							console.log("Message already exists, ignoring.");
							return prev;
						}
						console.log("Adding new message to state.");
						return [...prev, newMessage];
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
				// biome-ignore lint/suspicious/noExplicitAny: Supabase realtime payload type
				(payload: any) => {
					const updated = normalizeMessage(payload.new as Message);
					setMessages((prev) =>
						prev.map((msg) => (msg.id === updated.id ? { ...msg, ...updated } : msg)),
					);
				},
			)
			.subscribe((status, err) => {
				console.log("Supabase Realtime Status:", status);
				if (err) console.error("Realtime Error:", err);
			});

		return () => {
			console.log("Cleaning up realtime channel...");
			supabase.removeChannel(channel);
		};
	}, [channelId, fetchMessages]);

	// Send message via backend API + immediately add to state
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

			// biome-ignore lint/suspicious/noExplicitAny: message body built dynamically
			const body: any = {
				channelId,
				content: content.trim() || null,
			};

			if (fileDetails) {
				body.fileUrl = fileDetails.url;
				body.fileName = fileDetails.name;
				body.fileType = fileDetails.type;
				body.fileSize = fileDetails.size;
				if (fileDetails.duration != null) {
					body.duration = fileDetails.duration;
				}
			}

			if (parentId) {
				body.parentId = parentId;
			}

			// biome-ignore lint/suspicious/noExplicitAny: API response type
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

			setMessages((prev) => {
				if (prev.some((msg) => msg.id === newMsg.id)) return prev;
				return [...prev, newMsg];
			});

			return result;
		},
		[channelId],
	);

	// Delete message via backend API + immediately update state
	const deleteMessage = useCallback(
		async (messageId: string) => {
			if (!channelId) return;

			const supabase = supabaseRef.current;
			const {
				data: { session },
			} = await supabase.auth.getSession();
			const token = session?.access_token;

			await fetchClient(API_ENDPOINTS.MESSAGE_DELETE(messageId), {
				token,
				method: "DELETE",
			});

			// Optimistically update the local state
			setMessages((prev) =>
				prev.map((msg) =>
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
		[channelId],
	);

	// Edit message via backend API + immediately update state
	const editMessage = useCallback(
		async (messageId: string, content: string) => {
			if (!channelId || !content.trim()) return;

			const supabase = supabaseRef.current;
			const {
				data: { session },
			} = await supabase.auth.getSession();
			const token = session?.access_token;

			const updatedMsgData = await fetchClient(API_ENDPOINTS.MESSAGE_UPDATE(messageId), {
				token,
				method: "PATCH",
				body: JSON.stringify({ content: content.trim() }),
			});

			const normalizedUpdate = normalizeMessage(updatedMsgData);

			// Optimistically update the local state
			setMessages((prev) =>
				prev.map((msg) =>
					msg.id === messageId
						? {
								...msg,
								...normalizedUpdate,
							}
						: msg,
				),
			);
			return normalizedUpdate;
		},
		[channelId],
	);

	return {
		messages,
		isLoading,
		error,
		sendMessage,
		deleteMessage,
		editMessage,
	};
}
