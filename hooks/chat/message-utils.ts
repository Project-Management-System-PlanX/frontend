import type { Message } from "./message-types";

// Normalize message fields between camelCase (backend) and snake_case (Supabase Realtime)
export function normalizeMessage(msg: any): Message {
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
		is_pinned: msg.is_pinned ?? msg.isPinned ?? false,
		isPinned: msg.isPinned ?? msg.is_pinned ?? false,
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

export const messageKeys = {
	all: ["messages"] as const,
	byChannel: (channelId: string) => [...messageKeys.all, "channel", channelId] as const,
};
