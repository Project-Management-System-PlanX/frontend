"use client";

import {
	ControlBar,
	GridLayout,
	LiveKitRoom,
	ParticipantTile,
	RoomAudioRenderer,
	useTracks,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import { Loader2, PhoneOff } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { useEndMeeting, useLeaveMeeting } from "@/hooks/api/use-meetings";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useMeetingStore } from "@/stores/meeting-store";

function VideoTracks() {
	const tracks = useTracks(
		[
			{ source: Track.Source.Camera, withPlaceholder: true },
			{ source: Track.Source.ScreenShare, withPlaceholder: false },
		],
		{ onlySubscribed: false },
	);

	return (
		<GridLayout tracks={tracks} style={{ height: "calc(100vh - 60px)" }}>
			<ParticipantTile />
		</GridLayout>
	);
}

interface VideoRoomProps {
	meetingId: string;
	isCreator?: boolean;
}

export function VideoRoom({ meetingId, isCreator }: VideoRoomProps) {
	const { session } = useSupabaseAuth();
	const token = session?.access_token;

	const livekitToken = useMeetingStore((s) => s.livekitToken);
	const livekitUrl = useMeetingStore((s) => s.livekitUrl);
	const leaveCallStore = useMeetingStore((s) => s.leaveCall);

	const { mutateAsync: leaveMeeting } = useLeaveMeeting(token);
	const { mutateAsync: endMeeting } = useEndMeeting(token);
	const [isLeaving, setIsLeaving] = useState(false);

	const handleDisconnect = useCallback(async () => {
		setIsLeaving(true);
		try {
			await leaveMeeting(meetingId);
		} catch (err) {
			console.error("Failed to leave meeting:", err);
		} finally {
			leaveCallStore();
			setIsLeaving(false);
		}
	}, [meetingId, leaveMeeting, leaveCallStore]);

	const handleEndMeeting = useCallback(async () => {
		setIsLeaving(true);
		try {
			await endMeeting(meetingId);
		} catch (err) {
			console.error("Failed to end meeting:", err);
		} finally {
			leaveCallStore();
			setIsLeaving(false);
		}
	}, [meetingId, endMeeting, leaveCallStore]);

	if (!livekitToken || !livekitUrl) {
		return (
			<div className="fixed inset-0 z-[90] bg-slate-900 flex items-center justify-center">
				<Loader2 className="w-8 h-8 text-white animate-spin" />
			</div>
		);
	}

	return (
		<div className="fixed inset-0 z-[90] bg-slate-900 flex flex-col">
			{/* Top bar */}
			<div className="h-[60px] px-4 flex items-center justify-between bg-slate-800/80 border-b border-slate-700">
				<span className="text-white font-medium text-sm">Meeting in progress</span>
				<div className="flex items-center gap-2">
					{isCreator && (
						<Button
							onClick={handleEndMeeting}
							disabled={isLeaving}
							variant="destructive"
							size="sm"
							className="rounded-lg"
						>
							{isLeaving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
							End for all
						</Button>
					)}
					<Button
						onClick={handleDisconnect}
						disabled={isLeaving}
						size="sm"
						className="bg-red-500 hover:bg-red-600 text-white rounded-lg"
					>
						<PhoneOff className="w-4 h-4 mr-1" />
						Leave
					</Button>
				</div>
			</div>

			{/* LiveKit Room */}
			<LiveKitRoom
				token={livekitToken}
				serverUrl={livekitUrl}
				connect={true}
				onDisconnected={handleDisconnect}
				data-lk-theme="default"
				style={{ flex: 1 }}
			>
				<VideoTracks />
				<RoomAudioRenderer />
				<ControlBar variation="minimal" />
			</LiveKitRoom>
		</div>
	);
}
