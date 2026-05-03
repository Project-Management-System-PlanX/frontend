import type { Task, TaskComment, TaskLabel } from "../../types/models";
import { apiClient } from "../client";
import { API_ENDPOINTS } from "../config";

export interface CreateTaskPayload {
	spaceId: string;
	statusId: string;
	title: string;
	description?: string;
	priority?: string;
	workType?: string;
	assigneeId?: string;
	dueDate?: string;
	startDate?: string;
	position?: number;
	parentId?: string;
	teamId?: string;
	flagged?: boolean;
}

export interface UpdateTaskPayload {
	title?: string;
	description?: string;
	statusId?: string;
	priority?: string;
	workType?: string;
	assigneeId?: string | null;
	dueDate?: string | null;
	startDate?: string | null;
	resolution?: string;
	position?: number;
	parentId?: string | null;
	teamId?: string;
	flagged?: boolean;
	restrictTo?: string;
}

export interface MoveTaskPayload {
	statusId: string;
	position: number;
	parentId?: string | null;
}

export interface BulkPositionPayload {
	updates: Array<{
		id: string;
		statusId: string;
		position: number;
	}>;
}

export interface ActivityLogEntry {
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

export const taskService = {
	// ─── CRUD ───

	create: async (data: CreateTaskPayload, token?: string) =>
		apiClient.post<Task>(API_ENDPOINTS.TASKS, data, { token }),

	getBySpace: async (spaceId: string, token?: string) =>
		apiClient.get<Task[]>(API_ENDPOINTS.TASKS_BY_SPACE(spaceId), { token }),

	getById: async (id: string, token?: string) =>
		apiClient.get<Task>(API_ENDPOINTS.TASK_BY_ID(id), { token }),

	update: async (id: string, data: UpdateTaskPayload, token?: string) =>
		apiClient.patch<Task>(API_ENDPOINTS.TASK_BY_ID(id), data, { token }),

	delete: async (id: string, token?: string) =>
		apiClient.delete<{ deleted: boolean }>(API_ENDPOINTS.TASK_BY_ID(id), { token }),

	// ─── Drag-and-Drop ───

	move: async (id: string, data: MoveTaskPayload, token?: string) =>
		apiClient.patch<Task>(API_ENDPOINTS.TASK_MOVE(id), data, { token }),

	bulkUpdatePositions: async (data: BulkPositionPayload, token?: string) =>
		apiClient.post<{ updated: number }>(API_ENDPOINTS.TASKS_BULK, data, { token }),

	// ─── Queries ───

	getAssignedToMe: async (workspaceId: string, token?: string) =>
		apiClient.get<Task[]>(API_ENDPOINTS.TASKS_ASSIGNED_TO_ME, {
			token,
			queryParams: { workspaceId },
		}),

	getWorkedOn: async (workspaceId: string, token?: string) =>
		apiClient.get<Task[]>(API_ENDPOINTS.TASKS_WORKED_ON, {
			token,
			queryParams: { workspaceId },
		}),

	// ─── Comments ───

	getComments: async (taskId: string, token?: string) =>
		apiClient.get<TaskComment[]>(API_ENDPOINTS.TASK_COMMENTS(taskId), { token }),

	addComment: async (taskId: string, content: string, token?: string) =>
		apiClient.post<TaskComment>(API_ENDPOINTS.TASK_COMMENTS(taskId), { content }, { token }),

	deleteComment: async (taskId: string, commentId: string, token?: string) =>
		apiClient.delete<{ deleted: boolean }>(API_ENDPOINTS.TASK_COMMENT(taskId, commentId), {
			token,
		}),

	// ─── Labels ───

	addLabel: async (taskId: string, name: string, color: string, token?: string) =>
		apiClient.post<TaskLabel>(`/tasks/${taskId}/labels`, { name, color }, { token }),

	removeLabel: async (taskId: string, labelId: string, token?: string) =>
		apiClient.delete<{ deleted: boolean }>(`/tasks/${taskId}/labels/${labelId}`, { token }),

	// ─── Activities ───

	getActivities: async (taskId: string, token?: string) =>
		apiClient.get<ActivityLogEntry[]>(`/tasks/${taskId}/activities`, { token }),
};
