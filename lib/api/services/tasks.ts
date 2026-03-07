import type { Task, TaskAttachment, TaskComment } from "../../types/models";
import { apiClient } from "../client";
import { API_ENDPOINTS } from "../config";

export interface CreateTaskPayload {
	spaceId: string;
	title: string;
	description?: string;
	priority?: string;
	workType?: string;
	assigneeId?: string;
	dueDate?: string;
	startDate?: string;
	position?: number;
	statusId?: string;
	parentId?: string;
	teamId?: string;
	flagged?: boolean;
	restrictTo?: string;
	labels?: string[];
}

export interface UpdateTaskPayload {
	title?: string;
	description?: string;
	priority?: string;
	workType?: string;
	assigneeId?: string;
	dueDate?: string | null;
	startDate?: string | null;
	position?: number;
	statusId?: string;
	resolution?: string;
	labels?: string[];
	parentId?: string | null;
	teamId?: string | null;
	flagged?: boolean;
	restrictTo?: string | null;
}

export interface MoveTaskPayload {
	statusId: string;
	position: number;
}

export interface CreateTaskCommentPayload {
	content: string;
}

export interface CreateTaskAttachmentPayload {
	fileName: string;
	fileUrl: string;
	fileType?: string;
	fileSize?: number;
}

export const tasksService = {
	create: async (data: CreateTaskPayload, token?: string) =>
		apiClient.post<Task>(API_ENDPOINTS.TASKS, data, { token }),

	listBySpace: async (
		spaceId: string,
		filters?: { status?: string; assignee?: string; priority?: string },
		token?: string,
	) =>
		apiClient.get<Task[]>(API_ENDPOINTS.TASKS_BY_SPACE(spaceId), {
			token,
			queryParams: filters,
		}),

	listAssignedToMe: async (token?: string) =>
		apiClient.get<Task[]>(API_ENDPOINTS.TASKS_ASSIGNED_TO_ME, { token }),

	listWorkedOn: async (token?: string) =>
		apiClient.get<Task[]>(API_ENDPOINTS.TASKS_WORKED_ON, { token }),

	getById: async (id: string, token?: string) =>
		apiClient.get<Task>(API_ENDPOINTS.TASK_BY_ID(id), { token }),

	update: async (id: string, data: UpdateTaskPayload, token?: string) =>
		apiClient.patch<Task>(API_ENDPOINTS.TASK_BY_ID(id), data, { token }),

	move: async (id: string, data: MoveTaskPayload, token?: string) =>
		apiClient.patch<Task>(API_ENDPOINTS.TASK_MOVE(id), data, { token }),

	delete: async (id: string, token?: string) =>
		apiClient.delete<Task>(API_ENDPOINTS.TASK_BY_ID(id), { token }),

	// Comments
	createComment: async (taskId: string, data: CreateTaskCommentPayload, token?: string) =>
		apiClient.post<TaskComment>(API_ENDPOINTS.TASK_COMMENTS(taskId), data, { token }),

	listComments: async (taskId: string, token?: string) =>
		apiClient.get<TaskComment[]>(API_ENDPOINTS.TASK_COMMENTS(taskId), { token }),

	deleteComment: async (taskId: string, commentId: string, token?: string) =>
		apiClient.delete<TaskComment>(API_ENDPOINTS.TASK_COMMENT(taskId, commentId), { token }),

	// Attachments
	createAttachment: async (taskId: string, data: CreateTaskAttachmentPayload, token?: string) =>
		apiClient.post<TaskAttachment>(API_ENDPOINTS.TASK_ATTACHMENTS(taskId), data, { token }),

	listAttachments: async (taskId: string, token?: string) =>
		apiClient.get<TaskAttachment[]>(API_ENDPOINTS.TASK_ATTACHMENTS(taskId), { token }),

	deleteAttachment: async (taskId: string, attachmentId: string, token?: string) =>
		apiClient.delete<TaskAttachment>(API_ENDPOINTS.TASK_ATTACHMENT(taskId, attachmentId), {
			token,
		}),
};
