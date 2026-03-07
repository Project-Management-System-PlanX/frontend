"use client";

import { Loader2, Phone, PhoneOff, Video } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useJoinMeeting } from "@/hooks/api/use-meetings";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useMeetingStore } from "@/stores/meeting-store";

export function IncomingCallToast() {
	const { session } = useSupabaseAuth();
	const token = session?.access_token;
	const incomingCall = useMeetingStore((s) => s.incomingCall);
	const dismissIncomingCall = useMeetingStore((s) => s.dismissIncomingCall);
	const joinCall = useMeetingStore((s) => s.joinCall);
	const { mutateAsync: joinMeeting, isPending } = useJoinMeeting(token);
	const [declining, setDeclining] = useState(false);

	if (!incomingCall) return null;

	const handleAccept = async () => {
		try {
			const result = await joinMeeting({
				meetingId: incomingCall.meetingId,
				username: session?.user?.email || "User",
			});
			joinCall(incomingCall.meetingId, result.token, result.url);
		} catch (err) {
			console.error("Failed to join meeting:", err);
		}
	};

	const handleDecline = () => {
		setDeclining(true);
		dismissIncomingCall();
		setTimeout(() => setDeclining(false), 300);
	};

	return (
		<div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-top-2 fade-in duration-300">
			<div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 w-[340px]">
				{/* Pulsing ring effect */}
				<div className="flex items-center gap-4 mb-4">
					<div className="relative">
						<div className="w-12 h-12 rounded-full bg-[#0B6E4F] flex items-center justify-center">
							{incomingCall.type === "VIDEO" ? (
								<Video className="w-5 h-5 text-white" />
							) : (
								<Phone className="w-5 h-5 text-white" />
							)}
						</div>
						<div className="absolute inset-0 rounded-full bg-[#0B6E4F]/30 animate-ping" />
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-semibold text-slate-900 truncate">
							{incomingCall.createdByName}
						</p>
						<p className="text-xs text-slate-500">
							Incoming {incomingCall.type === "VIDEO" ? "video" : "audio"} call
						</p>
						{incomingCall.channelName && (
							<p className="text-xs text-slate-400 mt-0.5">in #{incomingCall.channelName}</p>
						)}
					</div>
				</div>

				<div className="flex items-center gap-3">
					<Button
						onClick={handleDecline}
						disabled={declining}
						className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl h-10"
					>
						<PhoneOff className="w-4 h-4 mr-1.5" />
						Decline
					</Button>
					<Button
						onClick={handleAccept}
						disabled={isPending}
						className="flex-1 bg-[#0B6E4F] hover:bg-[#095C42] text-white rounded-xl h-10"
					>
						{isPending ? (
							<Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
						) : (
							<Phone className="w-4 h-4 mr-1.5" />
						)}
						Accept
					</Button>
				</div>
			</div>
		</div>
	);
}
