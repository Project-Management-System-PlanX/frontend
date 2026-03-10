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
	is_pinned?: boolean;
	isPinned?: boolean;
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
