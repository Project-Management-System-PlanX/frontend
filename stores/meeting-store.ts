import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { MeetingNotification } from "@/lib/types/models";

interface MeetingState {
	// Incoming call notification
	incomingCall: MeetingNotification | null;
	// Currently active meeting ID (user is in a call)
	activeMeetingId: string | null;
	// LiveKit token and URL for the active call
	livekitToken: string | null;
	livekitUrl: string | null;

	// Actions
	setIncomingCall: (call: MeetingNotification | null) => void;
	joinCall: (meetingId: string, token: string, url: string) => void;
	leaveCall: () => void;
	dismissIncomingCall: () => void;
}

export const useMeetingStore = create<MeetingState>()(
	devtools(
		(set) => ({
			incomingCall: null,
			activeMeetingId: null,
			livekitToken: null,
			livekitUrl: null,

			setIncomingCall: (call) => set({ incomingCall: call }, false, "setIncomingCall"),

			joinCall: (meetingId, token, url) =>
				set(
					{
						activeMeetingId: meetingId,
						livekitToken: token,
						livekitUrl: url,
						incomingCall: null,
					},
					false,
					"joinCall",
				),

			leaveCall: () =>
				set(
					{
						activeMeetingId: null,
						livekitToken: null,
						livekitUrl: null,
					},
					false,
					"leaveCall",
				),

			dismissIncomingCall: () => set({ incomingCall: null }, false, "dismissIncomingCall"),
		}),
		{ name: "MeetingStore" },
	),
);
