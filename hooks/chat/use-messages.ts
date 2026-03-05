import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Message {
	id: string;
	channel_id: string;
	user_id: string;
	content?: string;
	file_url?: string;
	file_name?: string;
	file_type?: string;
	file_size?: number;
	is_edited: boolean;
	created_at: string;
	updated_at: string;
	users?: {
		firstName: string | null;
		lastName: string | null;
		username: string | null;
		imageUrl: string | null;
		email: string;
	};
}

export function useMessages(channelId: string | null) {
	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const supabase = createClient();

	useEffect(() => {
		if (!channelId) {
			setMessages([]);
			setIsLoading(false);
			return;
		}

		let isMounted = true;
		setIsLoading(true);

		// 1. Fetch initial message history
		const fetchMessages = async () => {
			try {
				const { data, error: fetchError } = await supabase
					.from("messages")
					.select(`
						*,
						users (
							firstName,
							lastName,
							username,
							imageUrl,
							email
						)
					`)
					.eq("channel_id", channelId)
					.order("created_at", { ascending: true });

				if (fetchError) throw fetchError;

				if (isMounted) {
					setMessages((data as Message[]) || []);
				}
			} catch (err: unknown) {
				const message = err instanceof Error ? err.message : "Failed to load messages";
				if (isMounted) setError(message);
			} finally {
				if (isMounted) setIsLoading(false);
			}
		};

		fetchMessages();

		// 2. Subscribe to Realtime (websockets) for new messages
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
				async (payload) => {
					// When a new message arrives, we also need the user details.
					// Since Realtime only sends the raw table row, we fetch the sender profile:
					const { data: userData } = await supabase
						.from("users")
						.select("firstName, lastName, username, imageUrl, email")
						.eq("supabaseId", payload.new.user_id)
						.single();

					const newMessage: Message = {
						...(payload.new as Message),
						users: userData || undefined,
					};

					setMessages((prev) => {
						// Prevent duplicates (Realtime can sometimes duplicate if local optimistic UI is used)
						if (prev.some((msg) => msg.id === newMessage.id)) return prev;
						return [...prev, newMessage];
					});
				},
			)
			.subscribe();

		return () => {
			isMounted = false;
			supabase.removeChannel(channel);
		};
	}, [channelId, supabase]);

	// 3. Function to send a new message
	const sendMessage = async (
		content: string,
		userId: string,
		fileDetails?: { url: string; name: string; type: string; size: number },
	) => {
		if (!channelId || (!content.trim() && !fileDetails)) return;

		// Optimistic update could go here, but for simplicity we'll let Realtime handle the insert event
		const now = new Date().toISOString();

		const insertData: {
			id: string;
			channel_id: string;
			user_id: string;
			content: string | null;
			updated_at: string;
			file_url?: string;
			file_name?: string;
			file_type?: string;
			file_size?: number;
		} = {
			id: crypto.randomUUID(), // Explicitly provide ID since default(uuid()) might be missing in DB schema
			channel_id: channelId,
			user_id: userId,
			content: content.trim() || null,
			updated_at: now, // Explicitly provide updated_at since it violates not-null constraint
		};

		if (fileDetails) {
			insertData.file_url = fileDetails.url;
			insertData.file_name = fileDetails.name;
			insertData.file_type = fileDetails.type;
			insertData.file_size = fileDetails.size;
		}

		// Insert without typed type constraint checking because we altered schema directly
		const { error: insertError } = await supabase.from("messages").insert(insertData);

		if (insertError) {
			console.error("Error sending message:", insertError);
			throw insertError;
		}
	};

	return {
		messages,
		isLoading,
		error,
		sendMessage,
	};
}
