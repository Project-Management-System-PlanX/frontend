"use client";

import { Loader2, Phone, Video } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCreateMeeting, useJoinMeeting } from "@/hooks/api/use-meetings";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { createClient } from "@/lib/supabase/client";
import type { MeetingNotification, MeetingType } from "@/lib/types/models";
import { useAppStore } from "@/stores/app-store";
import { useMeetingStore } from "@/stores/meeting-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

interface StartMeetingButtonProps {
	channelId?: string;
	channelName?: string;
}

export function StartMeetingButton({ channelId, channelName }: StartMeetingButtonProps) {
	const { user: supabaseUser, session } = useSupabaseAuth();
	const appUser = useAppStore((s) => s.user);
	const token = session?.access_token;
	const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
	const joinCall = useMeetingStore((s) => s.joinCall);

	const { mutateAsync: createMeeting, isPending: isCreating } = useCreateMeeting(token);
	const { mutateAsync: joinMeeting, isPending: isJoining } = useJoinMeeting(token);
	const [isStarting, setIsStarting] = useState(false);

	const isPending = isCreating || isJoining || isStarting;

	const handleStartMeeting = async (type: MeetingType) => {
		if (!supabaseUser || !activeWorkspaceId) return;
		const displayName = appUser?.name || supabaseUser.email || "User";

		setIsStarting(true);
		try {
			// 1. Create the meeting
			const meeting = await createMeeting({
				title: channelName ? `Call in #${channelName}` : "Video Call",
				channelId,
				workspaceId: activeWorkspaceId,
				type,
			});

			// 2. Join the meeting
			const result = await joinMeeting({
				meetingId: meeting.id,
				username: displayName,
			});

			// 3. Broadcast to workspace members via Supabase Realtime
			const supabase = createClient();
			const notification: MeetingNotification = {
				meetingId: meeting.id,
				title: meeting.title,
				type,
				createdById: supabaseUser.id,
				createdByName: displayName,
				channelId,
				channelName,
				workspaceId: activeWorkspaceId,
			};

			await supabase.channel(`meetings:${activeWorkspaceId}`).send({
				type: "broadcast",
				event: "meeting:started",
				payload: notification,
			});

			// 4. Enter the call
			joinCall(meeting.id, result.token, result.url);
		} catch (err) {
			console.error("Failed to start meeting:", err);
		} finally {
			setIsStarting(false);
		}
	};

	return (
		<TooltipProvider delayDuration={0}>
			{/* Audio Call Button */}
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						disabled={isPending}
						onClick={() => handleStartMeeting("AUDIO")}
						className="w-8 h-8 rounded-full hover:bg-[#e5e5ea] text-[#007aff] bg-transparent focus:outline-none"
					>
						{isStarting ? (
							<Loader2 className="w-[18px] h-[18px] animate-spin" />
						) : (
							<Phone className="w-[18px] h-[18px]" strokeWidth={2} />
						)}
					</Button>
				</TooltipTrigger>
				<TooltipContent>Audio Call</TooltipContent>
			</Tooltip>

			{/* Video Call Button */}
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						disabled={isPending}
						onClick={() => handleStartMeeting("VIDEO")}
						className="w-8 h-8 rounded-full hover:bg-[#e5e5ea] text-[#007aff] bg-transparent focus:outline-none"
					>
						{isStarting ? (
							<Loader2 className="w-[20px] h-[20px] animate-spin" />
						) : (
							<Video className="w-[20px] h-[20px]" strokeWidth={2} />
						)}
					</Button>
				</TooltipTrigger>
				<TooltipContent>Video Call</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
