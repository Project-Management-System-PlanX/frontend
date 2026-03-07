import type { JoinMeetingResponse, Meeting, MeetingType } from "../../types/models";
import { fetchClient } from "../client";
import { API_ENDPOINTS } from "../config";

export interface CreateMeetingPayload {
	title: string;
	groupId?: string;
	channelId?: string;
	workspaceId?: string;
	type?: MeetingType;
}

export interface JoinMeetingPayload {
	username?: string;
}

const _MEETING_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Meeting service endpoints go through the Next.js rewrite to /api/meetings/*
export const meetingService = {
	create: async (data: CreateMeetingPayload, token?: string) => {
		const res = await fetchClient<{ success: boolean; data: Meeting }>(
			API_ENDPOINTS.MEETINGS_CREATE,
			{
				token,
				method: "POST",
				body: JSON.stringify(data),
			},
		);
		return res.data;
	},

	join: async (meetingId: string, username?: string, token?: string) => {
		const res = await fetchClient<{ success: boolean; data: JoinMeetingResponse }>(
			API_ENDPOINTS.MEETINGS_JOIN(meetingId),
			{
				token,
				method: "POST",
				body: JSON.stringify({ username }),
			},
		);
		return res.data;
	},

	leave: async (meetingId: string, token?: string) => {
		await fetchClient<{ success: boolean }>(API_ENDPOINTS.MEETINGS_LEAVE(meetingId), {
			token,
			method: "POST",
		});
	},

	end: async (meetingId: string, token?: string) => {
		await fetchClient<{ success: boolean }>(API_ENDPOINTS.MEETINGS_END(meetingId), {
			token,
			method: "POST",
		});
	},

	getActive: async (groupId?: string, token?: string) => {
		const queryParams = groupId ? { groupId } : undefined;
		const res = await fetchClient<{ success: boolean; data: Meeting[] }>(
			API_ENDPOINTS.MEETINGS_ACTIVE,
			{
				token,
				method: "GET",
				queryParams,
			},
		);
		return res.data;
	},

	getHistory: async (token?: string) => {
		const res = await fetchClient<{ success: boolean; data: Meeting[] }>(
			API_ENDPOINTS.MEETINGS_HISTORY,
			{
				token,
				method: "GET",
			},
		);
		return res.data;
	},

	getById: async (meetingId: string, token?: string) => {
		const res = await fetchClient<{ success: boolean; data: Meeting }>(
			API_ENDPOINTS.MEETINGS_BY_ID(meetingId),
			{
				token,
				method: "GET",
			},
		);
		return res.data;
	},
};
