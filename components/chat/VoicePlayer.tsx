"use client";

import { Mic, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface VoicePlayerProps {
	src: string;
	duration?: number;
	isOwnMessage?: boolean;
}

export function VoicePlayer({
	src,
	duration: initialDuration,
	isOwnMessage = false,
}: VoicePlayerProps) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(initialDuration || 0);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const progressRef = useRef<HTMLDivElement>(null);

	const formatTime = (seconds: number) => {
		const s = Math.round(seconds);
		const m = Math.floor(s / 60);
		const remainder = s % 60;
		return `${m}:${remainder.toString().padStart(2, "0")}`;
	};

	useEffect(() => {
		const audio = new Audio(src);
		audioRef.current = audio;

		const onLoadedMetadata = () => {
			if (Number.isFinite(audio.duration)) {
				setDuration(audio.duration);
			}
		};

		const onTimeUpdate = () => {
			setCurrentTime(audio.currentTime);
		};

		const onEnded = () => {
			setIsPlaying(false);
			setCurrentTime(0);
		};

		audio.addEventListener("loadedmetadata", onLoadedMetadata);
		audio.addEventListener("timeupdate", onTimeUpdate);
		audio.addEventListener("ended", onEnded);

		return () => {
			audio.pause();
			audio.removeEventListener("loadedmetadata", onLoadedMetadata);
			audio.removeEventListener("timeupdate", onTimeUpdate);
			audio.removeEventListener("ended", onEnded);
			audioRef.current = null;
		};
	}, [src]);

	const togglePlay = useCallback(
		(e?: React.MouseEvent) => {
			if (e) {
				e.stopPropagation();
				e.preventDefault();
			}
			const audio = audioRef.current;
			if (!audio) return;

			if (isPlaying) {
				audio.pause();
				setIsPlaying(false);
			} else {
				audio.play().catch(console.error);
				setIsPlaying(true);
			}
		},
		[isPlaying],
	);

	const handleSeek = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			e.stopPropagation();
			const audio = audioRef.current;
			const bar = progressRef.current;
			if (!audio || !bar || !duration) return;

			const rect = bar.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const pct = Math.max(0, Math.min(1, x / rect.width));
			audio.currentTime = pct * duration;
			setCurrentTime(audio.currentTime);
		},
		[duration],
	);

	const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

	return (
		<div
			className={`flex items-center gap-3 p-3 rounded-[14px] border max-w-[320px] transition-colors ${
				isOwnMessage ? "bg-white/10 border-white/20" : "bg-black/5 border-black/10"
			}`}
		>
			{/* Mic icon */}
			<div className={`w-5 h-5 shrink-0 ${isOwnMessage ? "text-white" : "text-black/50"}`}>
				<Mic className="w-5 h-5" />
			</div>

			{/* Play / Pause button */}
			<button
				type="button"
				onClick={togglePlay}
				onPointerDown={(e) => e.stopPropagation()}
				className={`w-[36px] h-[36px] flex items-center justify-center rounded-full transition-colors shrink-0 outline-none shadow-sm ${
					isOwnMessage
						? "bg-white text-[#007aff] hover:bg-white/90"
						: "bg-[#007aff] text-white hover:bg-[#007aff]/90"
				}`}
			>
				{isPlaying ? (
					<Pause className="w-[18px] h-[18px] fill-current border-0" />
				) : (
					<Play className="w-[18px] h-[18px] ml-0.5 fill-current border-0" />
				)}
			</button>

			{/* Progress bar + time */}
			<div className="flex-1 min-w-0 pr-1">
				{/* biome-ignore lint/a11y/useKeyWithClickEvents: seek interaction is mouse-only */}
				<div
					ref={progressRef}
					role="slider"
					tabIndex={0}
					aria-label="Audio progress"
					aria-valuenow={Math.round(currentTime)}
					aria-valuemin={0}
					aria-valuemax={Math.round(duration)}
					className={`h-[5px] rounded-full cursor-pointer relative overflow-hidden ${
						isOwnMessage ? "bg-white/30" : "bg-black/10"
					}`}
					onClick={handleSeek}
					onPointerDown={(e) => e.stopPropagation()}
				>
					<div
						className={`absolute inset-y-0 left-0 rounded-full transition-all duration-100 ${
							isOwnMessage ? "bg-white" : "bg-[#007aff]"
						}`}
						style={{ width: `${progress}%` }}
					/>
				</div>
				<div className="flex justify-between mt-1.5">
					<span
						className={`text-[10px] font-semibold font-mono tabular-nums leading-none tracking-wider ${
							isOwnMessage ? "text-white/80" : "text-black/50"
						}`}
					>
						{formatTime(currentTime)}
					</span>
					<span
						className={`text-[10px] font-semibold font-mono tabular-nums leading-none tracking-wider ${
							isOwnMessage ? "text-white/80" : "text-black/50"
						}`}
					>
						{formatTime(duration)}
					</span>
				</div>
			</div>
		</div>
	);
}
