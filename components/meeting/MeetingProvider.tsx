"use client";

import { useEffect, useRef } from "react";
import { IncomingCallToast } from "@/components/meeting/IncomingCallToast";
import { VideoRoom } from "@/components/meeting/VideoRoom";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { createClient } from "@/lib/supabase/client";
import type { MeetingNotification } from "@/lib/types/models";
import { useMeetingStore } from "@/stores/meeting-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

/**
 * MeetingProvider handles:
 * 1. Listening for incoming meeting notifications via Supabase Realtime broadcast
 * 2. Showing the incoming call toast
 * 3. Rendering the VideoRoom overlay when in a call
 */
export function MeetingProvider({ children }: { children: React.ReactNode }) {
	const { user } = useSupabaseAuth();
	const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
	const activeMeetingId = useMeetingStore((s) => s.activeMeetingId);
	const setIncomingCall = useMeetingStore((s) => s.setIncomingCall);
	const supabaseRef = useRef(createClient());

	useEffect(() => {
		if (!user || !activeWorkspaceId) return;

		const supabase = supabaseRef.current;

		// Subscribe to meeting notifications for this workspace
		const channel = supabase.channel(`meetings:${activeWorkspaceId}`, {
			config: { broadcast: { self: false } },
		});

		channel
			.on("broadcast", { event: "meeting:started" }, (payload) => {
				const notification = payload.payload as MeetingNotification;

				// Don't show notification for our own meetings
				if (notification.createdById === user.id) return;

				// Don't show if already in a call
				if (useMeetingStore.getState().activeMeetingId) return;

				setIncomingCall(notification);

				// Auto-dismiss after 30 seconds
				setTimeout(() => {
					const current = useMeetingStore.getState().incomingCall;
					if (current?.meetingId === notification.meetingId) {
						useMeetingStore.getState().dismissIncomingCall();
					}
				}, 30000);
			})
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [user, activeWorkspaceId, setIncomingCall]);

	const isCreator = false; // Will be set properly when joining

	return (
		<>
			{children}
			<IncomingCallToast />
			{activeMeetingId && <VideoRoom meetingId={activeMeetingId} isCreator={isCreator} />}
		</>
	);
}
