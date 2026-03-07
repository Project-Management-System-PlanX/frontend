"use client";

import { Loader2, Phone, Video } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					disabled={isPending}
					className="w-8 h-8 text-[#9a9a9a] hover:text-[#0B6E4F] hover:bg-[#0B6E4F]/10"
				>
					{isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48">
				<DropdownMenuItem onClick={() => handleStartMeeting("VIDEO")} className="cursor-pointer">
					<Video className="w-4 h-4 mr-2 text-[#0B6E4F]" />
					Start video call
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => handleStartMeeting("AUDIO")} className="cursor-pointer">
					<Phone className="w-4 h-4 mr-2 text-blue-500" />
					Start audio call
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
