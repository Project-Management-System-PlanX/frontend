"use client";

import {
	LiveKitRoom,
	RoomAudioRenderer,
	useLocalParticipant,
	useParticipants,
	useRoomContext,
	VideoTrack,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { type Participant, Track, type TrackPublication } from "livekit-client";
import {
	Link2,
	Loader2,
	Mic,
	MicOff,
	MonitorUp,
	MoreHorizontal,
	User,
	Video,
	VideoOff,
	X,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useLeaveMeeting } from "@/hooks/api/use-meetings";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useMeetingStore } from "@/stores/meeting-store";

// ─── Participant Video Tile (Apple Theme) ──────────────────────────────────
function ParticipantVideoTile({
	participant,
	isLarge,
	isPiP,
}: {
	participant: Participant;
	isLarge?: boolean;
	isPiP?: boolean;
}) {
	const cameraTrack = participant
		.getTrackPublications()
		.find((t: TrackPublication) => t.source === Track.Source.Camera && t.track && !t.isMuted);
	const isMuted = !participant
		.getTrackPublications()
		.find((t: TrackPublication) => t.source === Track.Source.Microphone && t.track && !t.isMuted);

	const name = participant.name || participant.identity || "Unknown";
	const initials = name
		.split(" ")
		.map((w: string) => w[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	const _colorClass = participant.isLocal ? "bg-[#8e8e93]" : "bg-[#25b55d]";
	const _glowClass = participant.isLocal
		? "shadow-[0_0_120px_rgba(142,142,147,0.3)]"
		: "shadow-[0_0_120px_rgba(37,181,93,0.3)]";

	if (isPiP) {
		return (
			<div className="w-full h-full relative bg-[#1c1c1e] group overflow-hidden">
				{cameraTrack?.track ? (
					<VideoTrack
						trackRef={{
							participant,
							publication: cameraTrack,
							source: Track.Source.Camera,
						}}
						style={{
							width: "100%",
							height: "100%",
							objectFit: "cover",
							transform: participant.isLocal ? "scaleX(-1)" : "none",
						}}
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2c2c2e] to-[#1c1c1e]">
						<User className="w-8 h-8 text-white/50" strokeWidth={1.5} />
					</div>
				)}
				{isMuted && (
					<div className="absolute top-2 left-2 bg-black/40 backdrop-blur-md rounded-full p-1.5 border border-white/10">
						<MicOff className="w-3 h-3 text-white" strokeWidth={2.5} />
					</div>
				)}
			</div>
		);
	}

	return (
		<div
			className={`relative w-full h-full bg-[#111111] overflow-hidden flex items-center justify-center`}
		>
			{cameraTrack?.track ? (
				<VideoTrack
					trackRef={{
						participant,
						publication: cameraTrack,
						source: Track.Source.Camera,
					}}
					style={{
						width: "100%",
						height: "100%",
						objectFit: "cover",
						transform: participant.isLocal ? "scaleX(-1)" : "none",
					}}
				/>
			) : (
				<div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#1c1c1e] to-[#111111]">
					<div
						className={`rounded-full flex items-center justify-center text-white font-medium \${
							isLarge ? "w-[120px] h-[120px] text-5xl" : "w-[80px] h-[80px] text-3xl"
						} \${colorClass} \${glowClass} transition-all duration-500`}
					>
						{initials}
					</div>
					<div className="mt-6 flex flex-col items-center gap-1 z-10 transition-opacity">
						<span className="text-white text-sm font-semibold tracking-wide drop-shadow-md">
							{name}
						</span>
						{!participant.isLocal && (
							<span className="text-[#8e8e93] text-[11px] font-medium uppercase tracking-wider">
								{isMuted ? "Muted" : "Active"}
							</span>
						)}
					</div>
				</div>
			)}
			{/* Speaking border effect */}
			{participant.isSpeaking && (
				<div className="absolute inset-0 border-[3px] border-[#25b55d] transition-all duration-200 pointer-events-none" />
			)}
		</div>
	);
}

// ─── Screen Share Tile ────────────────────────────────────────────────────────
function ScreenShareTile({ participant }: { participant: Participant }) {
	const screenTrack = participant
		.getTrackPublications()
		.find((t: TrackPublication) => t.source === Track.Source.ScreenShare && t.track);

	if (!screenTrack?.track) return null;

	return (
		<div className="relative bg-[#000] overflow-hidden w-full h-full flex items-center justify-center">
			<VideoTrack
				trackRef={{
					participant,
					publication: screenTrack,
					source: Track.Source.ScreenShare,
				}}
				style={{
					width: "100%",
					height: "100%",
					objectFit: "contain",
				}}
			/>
			<div className="absolute top-6 right-6 bg-black/40 backdrop-blur-xl rounded-full px-4 py-2 border border-white/10 shadow-lg">
				<span className="text-white text-xs font-semibold tracking-wide flex items-center gap-2">
					<MonitorUp className="w-4 h-4" />
					{participant.name || participant.identity}
				</span>
			</div>
		</div>
	);
}

// ─── Room Content (FaceTime Layout) ───────────────────────────────────────────
function RoomContent({ onLeave }: { onLeave: () => void }) {
	useRoomContext();
	const { localParticipant } = useLocalParticipant();
	const participants = useParticipants();
	const [isCamOn, setIsCamOn] = useState(true);
	const [isMicOn, setIsMicOn] = useState(true);
	const [_isScreenSharing, _setIsScreenSharing] = useState(false);

	// Find screen share track from any participant
	const screenShareParticipant = participants.find((p) =>
		p
			.getTrackPublications()
			.some((t: TrackPublication) => t.source === Track.Source.ScreenShare && t.track),
	);

	// Toggle camera
	const toggleCamera = useCallback(async () => {
		try {
			await localParticipant.setCameraEnabled(!isCamOn);
			setIsCamOn(!isCamOn);
		} catch (err) {
			console.error("Failed to toggle camera:", err);
		}
	}, [localParticipant, isCamOn]);

	// Toggle mic
	const toggleMic = useCallback(async () => {
		try {
			await localParticipant.setMicrophoneEnabled(!isMicOn);
			setIsMicOn(!isMicOn);
		} catch (err) {
			console.error("Failed to toggle microphone:", err);
		}
	}, [localParticipant, isMicOn]);

	// Filter out local participant if there are others in the room
	const remoteParticipants = participants.filter((p) => !p.isLocal);
	const isAlone = remoteParticipants.length === 0;

	const mainGridParticipants = isAlone ? [localParticipant] : remoteParticipants;
	const hasScreenShare = !!screenShareParticipant;

	// Grid calculations
	const totalMain = mainGridParticipants.length;
	const _getGridClass = () => {
		if (hasScreenShare) return "grid-cols-1";
		if (totalMain === 1) return "grid-cols-1";
		if (totalMain === 2) return "grid-cols-2 md:grid-cols-2";
		if (totalMain <= 4) return "grid-cols-2 grid-rows-2";
		return "grid-cols-3 grid-rows-2";
	};

	return (
		<div className="fixed inset-0 bg-black flex flex-col font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text','SF_Pro_Display',sans-serif] selection:bg-blue-500/30">
			{/* Top Pill / Status Bar */}
			<div className="absolute top-8 left-8 z-50 flex flex-col gap-2">
				<div className="bg-black/20 hover:bg-black/40 backdrop-blur-2xl px-4 py-2 rounded-full border border-white/10 shadow-2xl flex items-center gap-3 transition-colors cursor-pointer group">
					{isAlone ? (
						<>
							<Link2 className="w-4 h-4 text-white/70" strokeWidth={2.5} />
							<span className="text-white text-sm font-semibold tracking-wide">
								Waiting for Others
							</span>
						</>
					) : (
						<>
							<User className="w-4 h-4 text-white/70" strokeWidth={2.5} />
							<span className="text-white text-sm font-semibold tracking-wide">
								{remoteParticipants[0].identity}
								{remoteParticipants.length > 1 ? ` +\${remoteParticipants.length - 1}` : ""}
							</span>
						</>
					)}
					<span className="opacity-0 group-hover:opacity-100 transition-opacity text-white/50 text-xs ml-1 font-bold">
						›
					</span>
				</div>
			</div>

			{/* Main Content Area */}
			<div className="flex-1 w-full h-full relative">
				{hasScreenShare ? (
					<div className="w-full h-full">
						<ScreenShareTile participant={screenShareParticipant} />
					</div>
				) : (
					<div className={`w-full h-full grid \${getGridClass()} gap-0.5 bg-black`}>
						{mainGridParticipants.map((p) => (
							<ParticipantVideoTile key={p.identity} participant={p} isLarge={totalMain === 1} />
						))}
					</div>
				)}
			</div>

			{/* PiP Local Video */}
			{!isAlone && (
				<div className="absolute bottom-8 left-8 z-50 w-32 md:w-44 aspect-[3/4] rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl border-[0.5px] border-white/20 bg-black/50 backdrop-blur-xl transition-transform hover:scale-105 duration-300">
					<ParticipantVideoTile participant={localParticipant} isPiP />
				</div>
			)}

			{/* Floating Controls (Bottom Right) */}
			<div className="absolute bottom-8 right-8 z-50 flex items-center gap-3 md:gap-4 p-2 pl-4 rounded-full bg-white/10 backdrop-blur-3xl border border-white/10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
				<button
					type="button"
					onClick={toggleCamera}
					className={`w-12 h-12 md:w-[52px] md:h-[52px] rounded-full flex items-center justify-center transition-all duration-300 shadow-sm \${
						isCamOn
							? "bg-[#2c2c2e]/80 hover:bg-[#3a3a3c] text-white"
							: "bg-white text-black"
					}`}
					title={isCamOn ? "Turn off camera" : "Turn on camera"}
				>
					{isCamOn ? (
						<Video className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
					) : (
						<VideoOff className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
					)}
				</button>

				<button
					type="button"
					onClick={toggleMic}
					className={`w-12 h-12 md:w-[52px] md:h-[52px] rounded-full flex items-center justify-center transition-all duration-300 shadow-sm \${
						isMicOn
							? "bg-[#2c2c2e]/80 hover:bg-[#3a3a3c] text-white"
							: "bg-white text-black"
					}`}
					title={isMicOn ? "Mute microphone" : "Unmute microphone"}
				>
					{isMicOn ? (
						<Mic className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
					) : (
						<MicOff className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
					)}
				</button>

				<button
					type="button"
					className="w-12 h-12 md:w-[52px] md:h-[52px] rounded-full bg-[#2c2c2e]/80 hover:bg-[#3a3a3c] text-white flex items-center justify-center transition-all duration-300 shadow-sm"
					title="More options"
				>
					<MoreHorizontal className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
				</button>

				<div className="w-px h-8 bg-white/20 mx-1" />

				<button
					type="button"
					onClick={onLeave}
					className="w-12 h-12 md:w-[52px] md:h-[52px] rounded-full bg-[#ff3b30] hover:bg-[#ff453a] flex items-center justify-center transition-all duration-300 shadow-xl"
					title="End call"
				>
					<X className="w-6 h-6 md:w-7 md:h-7 text-white" strokeWidth={2.5} />
				</button>
			</div>
		</div>
	);
}

// ─── Main VideoRoom Component ─────────────────────────────────────────────────
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
	const [isLeaving, setIsLeaving] = useState(false);

	const handleDisconnect = useCallback(async () => {
		if (isLeaving) return;
		setIsLeaving(true);
		try {
			await leaveMeeting(meetingId);
		} catch (err) {
			console.error("Failed to leave meeting:", err);
		} finally {
			leaveCallStore();
			setIsLeaving(false);
		}
	}, [meetingId, leaveMeeting, leaveCallStore, isLeaving]);

	if (!livekitToken || !livekitUrl) {
		return (
			<div className="fixed inset-0 z-[90] bg-[#111111] flex items-center justify-center font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text','SF_Pro_Display',sans-serif]">
				<div className="flex flex-col items-center gap-6">
					<Loader2 className="w-10 h-10 text-white/50 animate-spin" />
					<span className="text-[#8e8e93] text-[15px] font-medium tracking-wide">
						Connecting...
					</span>
				</div>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 z-[100] bg-black">
			<LiveKitRoom
				token={livekitToken}
				serverUrl={livekitUrl}
				connect={true}
				onDisconnected={handleDisconnect}
				video={true}
				audio={true}
				style={{ width: "100%", height: "100%" }}
			>
				<RoomAudioRenderer />
				<RoomContent onLeave={handleDisconnect} />
			</LiveKitRoom>
		</div>
	);
}
