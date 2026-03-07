import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type CreateMeetingPayload, meetingService } from "@/lib/api/services/meetings";

export const meetingKeys = {
	all: ["meetings"] as const,
	active: (groupId?: string) => [...meetingKeys.all, "active", groupId] as const,
	history: () => [...meetingKeys.all, "history"] as const,
	detail: (id: string) => [...meetingKeys.all, "detail", id] as const,
};

export const useActiveMeetings = (groupId?: string, token?: string) => {
	return useQuery({
		queryKey: meetingKeys.active(groupId),
		queryFn: () => meetingService.getActive(groupId, token),
		enabled: !!token,
		refetchInterval: 10000, // Poll every 10s for active meetings
	});
};

export const useMeetingHistory = (token?: string) => {
	return useQuery({
		queryKey: meetingKeys.history(),
		queryFn: () => meetingService.getHistory(token),
		enabled: !!token,
	});
};

export const useMeeting = (meetingId: string, token?: string) => {
	return useQuery({
		queryKey: meetingKeys.detail(meetingId),
		queryFn: () => meetingService.getById(meetingId, token),
		enabled: !!meetingId && !!token,
	});
};

export const useCreateMeeting = (token?: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateMeetingPayload) => meetingService.create(data, token),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: meetingKeys.active() });
		},
	});
};

export const useJoinMeeting = (token?: string) => {
	return useMutation({
		mutationFn: ({ meetingId, username }: { meetingId: string; username?: string }) =>
			meetingService.join(meetingId, username, token),
	});
};

export const useLeaveMeeting = (token?: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (meetingId: string) => meetingService.leave(meetingId, token),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: meetingKeys.active() });
		},
	});
};

export const useEndMeeting = (token?: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (meetingId: string) => meetingService.end(meetingId, token),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: meetingKeys.active() });
		},
	});
};
