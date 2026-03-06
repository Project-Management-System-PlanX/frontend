export type Role = "OWNER" | "ADMIN" | "MEMBER";
export type ChannelType = "PUBLIC" | "PRIVATE" | "DIRECT_MESSAGE";

export interface UserProfile {
	id: string;
	supabaseId: string;
	email: string;
	firstName: string;
	lastName: string;
	username: string;
	imageUrl?: string;
	createdAt: string;
	updatedAt: string;
}

export interface Workspace {
	id: string;
	name: string;
	slug: string;
	ownerId: string;
	avatar?: string | null;
	createdAt: string;
	updatedAt: string;
	members?: WorkspaceMember[];
	channels?: Channel[];
}

export interface Channel {
	id: string;
	workspaceId: string;
	name: string;
	type: ChannelType;
	description?: string;
	createdAt: string;
	updatedAt: string;
	members?: ChannelMember[];
	groups?: Group[];
}

export interface Group {
	id: string;
	channelId: string;
	name: string;
	description?: string;
	createdAt: string;
	updatedAt: string;
	members?: GroupMember[];
}

export interface WorkspaceMember {
	id: string;
	workspaceId: string;
	userId: string;
	role: Role;
	joinedAt: string;
}

export interface ChannelMember {
	id: string;
	channelId: string;
	userId: string;
	role: Role | string;
	joinedAt: string;
}

export interface GroupMember {
	id: string;
	groupId: string;
	userId: string;
	joinedAt: string;
}

// API Error
export interface ApiError {
	message: string;
	status: number;
}

// ─── Spaces & Tasks ───

export interface Space {
	id: string;
	workspaceId: string;
	name: string;
	description?: string;
	color: string;
	icon: string;
	prefix: string;
	taskCounter: number;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
	statuses?: TaskStatus[];
	tasks?: Task[];
}

export interface TaskStatus {
	id: string;
	spaceId: string;
	name: string;
	color: string;
	position: number;
	isDone: boolean;
}

export interface TaskLabel {
	id: string;
	taskId: string;
	name: string;
	color: string;
}

export interface TaskComment {
	id: string;
	taskId: string;
	userId: string;
	content: string;
	createdAt: string;
	updatedAt: string;
}

export interface Task {
	id: string;
	spaceId: string;
	statusId: string;
	title: string;
	description?: string;
	taskNumber: number;
	priority: string; // "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
	assigneeId?: string;
	reporterId: string;
	dueDate?: string;
	resolution: string; // "UNRESOLVED" | "DONE" | "WONT_DO" | "DUPLICATE"
	position: number;
	createdAt: string;
	updatedAt: string;
	space?: Space;
	status?: TaskStatus;
	labels?: TaskLabel[];
	comments?: TaskComment[];
}
