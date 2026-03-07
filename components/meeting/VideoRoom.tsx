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
import { Loader2, Mic, MicOff, MonitorUp, PhoneOff, Users, Video, VideoOff } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useEndMeeting, useLeaveMeeting } from "@/hooks/api/use-meetings";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useMeetingStore } from "@/stores/meeting-store";

// ─── Participant Video Tile ───────────────────────────────────────────────────

function ParticipantVideoTile({
	participant,
	isLarge,
}: {
	participant: Participant;
	isLarge?: boolean;
}) {
	const cameraTrack = participant
		.getTrackPublications()
		.find((t: TrackPublication) => t.source === Track.Source.Camera && t.track && !t.isMuted);
	const isMuted = !participant
		.getTrackPublications()
		.find((t: TrackPublication) => t.source === Track.Source.Microphone && t.track && !t.isMuted);

	const initials = (participant.name || participant.identity || "U")
		.split(" ")
		.map((w) => w[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	return (
		<div
			className={`relative bg-slate-800 rounded-2xl overflow-hidden ${
				isLarge ? "w-full h-full" : "w-full h-full"
			}`}
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
					}}
				/>
			) : (
				<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
					<div
						className={`rounded-full bg-[#0B6E4F] flex items-center justify-center text-white font-bold ${
							isLarge ? "w-24 h-24 text-3xl" : "w-16 h-16 text-xl"
						}`}
					>
						{initials}
					</div>
				</div>
			)}

			{/* Participant info bar */}
			<div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
				<div className="flex items-center gap-2">
					{isMuted && (
						<div className="w-6 h-6 rounded-full bg-red-500/90 flex items-center justify-center">
							<MicOff className="w-3 h-3 text-white" />
						</div>
					)}
					<span className="text-white text-sm font-medium truncate">
						{participant.name || participant.identity}
						{participant.isLocal && " (You)"}
					</span>
				</div>
			</div>

			{/* Speaking indicator */}
			{participant.isSpeaking && (
				<div className="absolute inset-0 rounded-2xl border-2 border-[#0B6E4F] pointer-events-none" />
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
		<div className="relative bg-black rounded-2xl overflow-hidden w-full h-full">
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
			<div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5">
				<span className="text-white text-xs font-medium flex items-center gap-1.5">
					<MonitorUp className="w-3.5 h-3.5" />
					{participant.name || participant.identity} is presenting
				</span>
			</div>
		</div>
	);
}

// ─── Meeting Timer ────────────────────────────────────────────────────────────

function MeetingTimer() {
	const [elapsed, setElapsed] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
		return () => clearInterval(interval);
	}, []);

	const mins = Math.floor(elapsed / 60);
	const secs = elapsed % 60;
	return (
		<span className="text-slate-400 text-xs font-mono tabular-nums">
			{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
		</span>
	);
}

// ─── Room Content (inside LiveKitRoom) ────────────────────────────────────────

function RoomContent({
	meetingId,
	isCreator,
	onLeave,
}: {
	meetingId: string;
	isCreator?: boolean;
	onLeave: () => void;
}) {
	const room = useRoomContext();
	const { localParticipant } = useLocalParticipant();
	const participants = useParticipants();
	const [isCamOn, setIsCamOn] = useState(true);
	const [isMicOn, setIsMicOn] = useState(true);
	const [isScreenSharing, setIsScreenSharing] = useState(false);
	const [showParticipants, setShowParticipants] = useState(false);

	// Find screen share track from any participant
	const screenShareParticipant = participants.find((p) =>
		p
			.getTrackPublications()
			.some((t: TrackPublication) => t.source === Track.Source.ScreenShare && t.track),
	);

	const remoteParticipants = participants.filter((p) => !p.isLocal);

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

	// Toggle screen share
	const toggleScreenShare = useCallback(async () => {
		try {
			await localParticipant.setScreenShareEnabled(!isScreenSharing);
			setIsScreenSharing(!isScreenSharing);
		} catch (err) {
			console.error("Failed to toggle screen share:", err);
		}
	}, [localParticipant, isScreenSharing]);

	// Grid layout logic
	const totalParticipants = participants.length;
	const hasScreenShare = !!screenShareParticipant;

	const getGridClass = () => {
		if (hasScreenShare) {
			return "grid-cols-1"; // full screen for screen share, sidebar for participants
		}
		if (totalParticipants === 1) return "grid-cols-1";
		if (totalParticipants === 2) return "grid-cols-2";
		if (totalParticipants <= 4) return "grid-cols-2 grid-rows-2";
		if (totalParticipants <= 6) return "grid-cols-3 grid-rows-2";
		return "grid-cols-4 grid-rows-3";
	};

	return (
		<div className="flex flex-col h-full">
			{/* ─── Top Bar ─── */}
			<div className="h-14 px-5 flex items-center justify-between bg-slate-900/90 backdrop-blur-sm border-b border-slate-700/50 shrink-0">
				<div className="flex items-center gap-3">
					<div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
					<span className="text-white font-semibold text-sm">Meeting</span>
					<span className="text-slate-500 text-sm">|</span>
					<MeetingTimer />
				</div>
				<div className="flex items-center gap-2">
					<span className="text-slate-400 text-xs flex items-center gap-1">
						<Users className="w-3.5 h-3.5" />
						{totalParticipants}
					</span>
				</div>
			</div>

			{/* ─── Main Content ─── */}
			<div className="flex-1 flex overflow-hidden">
				{/* Video Grid */}
				<div className="flex-1 p-3">
					{hasScreenShare ? (
						// Screen share layout
						<div className="h-full flex gap-3">
							<div className="flex-1">
								<ScreenShareTile participant={screenShareParticipant} />
							</div>
							<div className="w-[240px] flex flex-col gap-2 overflow-y-auto">
								{participants.map((p) => (
									<div key={p.identity} className="h-[140px] shrink-0">
										<ParticipantVideoTile participant={p} />
									</div>
								))}
							</div>
						</div>
					) : (
						// Normal grid layout
						<div className={`grid ${getGridClass()} gap-3 h-full auto-rows-fr`}>
							{participants.map((p) => (
								<ParticipantVideoTile
									key={p.identity}
									participant={p}
									isLarge={totalParticipants === 1}
								/>
							))}
						</div>
					)}
				</div>

				{/* Participants sidebar */}
				{showParticipants && (
					<div className="w-[280px] bg-slate-800/50 border-l border-slate-700/50 flex flex-col shrink-0">
						<div className="p-4 border-b border-slate-700/50">
							<h3 className="text-white font-semibold text-sm">
								Participants ({totalParticipants})
							</h3>
						</div>
						<div className="flex-1 overflow-y-auto p-3 space-y-1">
							{participants.map((p) => {
								const micOn = p
									.getTrackPublications()
									.some(
										(t: TrackPublication) =>
											t.source === Track.Source.Microphone && t.track && !t.isMuted,
									);
								return (
									<div
										key={p.identity}
										className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-700/30"
									>
										<div className="w-8 h-8 rounded-full bg-[#0B6E4F] flex items-center justify-center text-white text-xs font-bold">
											{(p.name || p.identity || "U").charAt(0).toUpperCase()}
										</div>
										<span className="text-white text-sm flex-1 truncate">
											{p.name || p.identity}
											{p.isLocal && <span className="text-slate-400 text-xs ml-1">(You)</span>}
										</span>
										{micOn ? (
											<Mic className="w-4 h-4 text-slate-400" />
										) : (
											<MicOff className="w-4 h-4 text-red-400" />
										)}
									</div>
								);
							})}
						</div>
					</div>
				)}
			</div>

			{/* ─── Bottom Control Bar (Google Meet style) ─── */}
			<div className="h-20 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700/50 flex items-center justify-center px-6 shrink-0">
				<div className="flex items-center gap-3">
					{/* Mic Toggle */}
					<button
						type="button"
						onClick={toggleMic}
						className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
							isMicOn
								? "bg-slate-700 hover:bg-slate-600 text-white"
								: "bg-red-500 hover:bg-red-600 text-white"
						}`}
						title={isMicOn ? "Mute microphone" : "Unmute microphone"}
					>
						{isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
					</button>

					{/* Camera Toggle */}
					<button
						type="button"
						onClick={toggleCamera}
						className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
							isCamOn
								? "bg-slate-700 hover:bg-slate-600 text-white"
								: "bg-red-500 hover:bg-red-600 text-white"
						}`}
						title={isCamOn ? "Turn off camera" : "Turn on camera"}
					>
						{isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
					</button>

					{/* Screen Share */}
					<button
						type="button"
						onClick={toggleScreenShare}
						className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
							isScreenSharing
								? "bg-[#0B6E4F] hover:bg-[#095C42] text-white"
								: "bg-slate-700 hover:bg-slate-600 text-white"
						}`}
						title={isScreenSharing ? "Stop sharing" : "Share your screen"}
					>
						<MonitorUp className="w-5 h-5" />
					</button>

					{/* Participants Toggle */}
					<button
						type="button"
						onClick={() => setShowParticipants(!showParticipants)}
						className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
							showParticipants
								? "bg-[#0B6E4F] hover:bg-[#095C42] text-white"
								: "bg-slate-700 hover:bg-slate-600 text-white"
						}`}
						title="Participants"
					>
						<Users className="w-5 h-5" />
					</button>

					{/* Spacer */}
					<div className="w-px h-8 bg-slate-700 mx-2" />

					{/* End for All (creator only) */}
					{isCreator && (
						<button
							type="button"
							onClick={onLeave}
							className="h-12 px-5 rounded-full bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium flex items-center gap-2 transition-all duration-200"
						>
							End for all
						</button>
					)}

					{/* Leave Call */}
					<button
						type="button"
						onClick={onLeave}
						className="h-12 px-6 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-semibold flex items-center gap-2 transition-all duration-200"
						title="Leave call"
					>
						<PhoneOff className="w-5 h-5" />
						Leave
					</button>
				</div>
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
	const { mutateAsync: endMeeting } = useEndMeeting(token);
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
			<div className="fixed inset-0 z-[90] bg-slate-900 flex items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<Loader2 className="w-10 h-10 text-[#0B6E4F] animate-spin" />
					<span className="text-slate-400 text-sm">Connecting to meeting...</span>
				</div>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 z-[90] bg-slate-900">
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
				<RoomContent meetingId={meetingId} isCreator={isCreator} onLeave={handleDisconnect} />
			</LiveKitRoom>
		</div>
	);
}
