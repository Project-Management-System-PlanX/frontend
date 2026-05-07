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
	userId: string; // This is the supabaseId
	role: Role;
	joinedAt: string;
	user?: {
		supabaseId: string;
		email: string;
		firstName: string | null;
		lastName: string | null;
		username: string | null;
		imageUrl?: string | null;
	};
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
	description?: string | null;
	taskNumber: number;
	priority: string; // "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
	workType: string; // "TASK" | "STORY" | "BUG" | "EPIC" | "SUBTASK"
	assigneeId?: string | null;
	reporterId: string;
	dueDate?: string | null;
	startDate?: string | null;
	resolution: string; // "UNRESOLVED" | "DONE" | "WONT_DO" | "DUPLICATE"
	position: number;
	coverColor?: string | null;
	parentId?: string | null;
	teamId?: string | null;
	flagged: boolean;
	restrictTo?: string | null;
	createdAt: string;
	updatedAt: string;
	space?: Space;
	status?: TaskStatus;
	labels?: TaskLabel[];
	comments?: TaskComment[];
	attachments?: TaskAttachment[];
	assignees?: { userId: string; user: UserProfile }[];
	parent?: { id: string; title: string; taskNumber: number };
	team?: { id: string; name: string };
	children?: { id: string; title: string; taskNumber: number; statusId: string }[];
}

export interface TaskAttachment {
	id: string;
	taskId: string;
	fileName: string;
	fileUrl: string;
	fileType?: string;
	fileSize?: number;
	createdAt: string;
}

export interface TaskLink {
	id: string;
	fromTaskId: string;
	toTaskId: string;
	linkType: string;
}

// ─── Meetings ───

export type MeetingType = "VIDEO" | "AUDIO";
export type MeetingStatus = "ACTIVE" | "ENDED";

export interface Meeting {
	id: string;
	roomId: string;
	title: string;
	type: MeetingType;
	status: MeetingStatus;
	groupId?: string | null;
	channelId?: string | null;
	workspaceId?: string | null;
	createdById: string;
	startedAt: string;
	endedAt?: string | null;
	duration?: number | null;
	createdAt: string;
	participantCount?: number;
}

export interface MeetingParticipant {
	id: string;
	meetingId: string;
	userId: string;
	joinedAt: string;
	leftAt?: string | null;
	duration?: number | null;
}

export interface JoinMeetingResponse {
	token: string;
	url: string;
	meeting: Meeting;
}

export interface MeetingNotification {
	meetingId: string;
	title: string;
	type: MeetingType;
	createdById: string;
	createdByName: string;
	channelId?: string;
	channelName?: string;
	workspaceId?: string;
}

// ─── Checklists ───

export interface Checklist {
	id: string;
	taskId: string;
	title: string;
	position: number;
	createdAt: string;
	items: ChecklistItem[];
}

export interface ChecklistItem {
	id: string;
	checklistId: string;
	content: string;
	isComplete: boolean;
	position: number;
	assigneeId?: string;
	dueDate?: string;
}

// ─── Activity Log ───

export interface ActivityLog {
	id: string;
	taskId: string;
	userId: string;
	action: string;
	field?: string;
	oldValue?: string;
	newValue?: string;
	metadata?: Record<string, unknown>;
	createdAt: string;
}

// ─── Boards ───

export interface Board {
	id: string;
	spaceId: string;
	name: string;
	createdAt: string;
	updatedAt: string;
	columns: BoardColumnModel[];
}

export interface BoardColumnModel {
	id: string;
	boardId: string;
	statusId: string;
	position: number;
}
