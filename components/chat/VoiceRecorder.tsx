"use client";

import { Mic, Pause, Play, Send, Square, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface VoiceRecorderProps {
	onSend: (audioBlob: Blob, durationSeconds: number) => void;
	onCancel: () => void;
}

export function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
	const [isRecording, setIsRecording] = useState(false);
	const [hasRecorded, setHasRecorded] = useState(false);
	const [elapsed, setElapsed] = useState(0);
	const [isSending, setIsSending] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [playbackTime, setPlaybackTime] = useState(0);

	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const chunksRef = useRef<Blob[]>([]);
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const audioBlobRef = useRef<Blob | null>(null);
	const previewAudioRef = useRef<HTMLAudioElement | null>(null);
	const previewUrlRef = useRef<string | null>(null);
	const elapsedRef = useRef(0);
	const onSendRef = useRef(onSend);
	const onCancelRef = useRef(onCancel);

	// Keep callback refs current
	useEffect(() => {
		onSendRef.current = onSend;
	}, [onSend]);
	useEffect(() => {
		onCancelRef.current = onCancel;
	}, [onCancel]);

	// Keep elapsed ref in sync
	useEffect(() => {
		elapsedRef.current = elapsed;
	}, [elapsed]);

	// Waveform
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const audioCtxRef = useRef<AudioContext | null>(null);
	const animFrameRef = useRef<number | null>(null);

	const formatTime = (seconds: number) => {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m}:${s.toString().padStart(2, "0")}`;
	};

	// Start recording on mount, cleanup on unmount
	useEffect(() => {
		let cancelled = false;

		const stopWaveform = () => {
			if (animFrameRef.current) {
				cancelAnimationFrame(animFrameRef.current);
				animFrameRef.current = null;
			}
		};

		const stopTimer = () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
				timerRef.current = null;
			}
		};

		const stopMicStream = () => {
			if (streamRef.current) {
				for (const track of streamRef.current.getTracks()) {
					track.stop();
				}
				streamRef.current = null;
			}
		};

		const closeAudioCtx = () => {
			if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
				audioCtxRef.current.close().catch(() => {});
				audioCtxRef.current = null;
			}
		};

		const drawWaveform = () => {
			const analyser = analyserRef.current;
			const canvas = canvasRef.current;
			if (!analyser || !canvas) return;

			const ctx = canvas.getContext("2d");
			if (!ctx) return;

			const bufferLength = analyser.frequencyBinCount;
			const dataArray = new Uint8Array(bufferLength);

			const draw = () => {
				animFrameRef.current = requestAnimationFrame(draw);
				analyser.getByteTimeDomainData(dataArray);

				ctx.fillStyle = "#f8fafc";
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.lineWidth = 2;
				ctx.strokeStyle = "#0B6E4F";
				ctx.beginPath();

				const sliceWidth = canvas.width / bufferLength;
				let x = 0;
				for (let i = 0; i < bufferLength; i++) {
					const v = dataArray[i] / 128.0;
					const y = (v * canvas.height) / 2;
					if (i === 0) ctx.moveTo(x, y);
					else ctx.lineTo(x, y);
					x += sliceWidth;
				}
				ctx.lineTo(canvas.width, canvas.height / 2);
				ctx.stroke();
			};
			draw();
		};

		const start = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
				if (cancelled) {
					for (const track of stream.getTracks()) track.stop();
					return;
				}
				streamRef.current = stream;

				// Audio analyser for waveform
				const audioContext = new AudioContext();
				audioCtxRef.current = audioContext;
				const source = audioContext.createMediaStreamSource(stream);
				const analyser = audioContext.createAnalyser();
				analyser.fftSize = 2048;
				source.connect(analyser);
				analyserRef.current = analyser;

				const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
					? "audio/webm;codecs=opus"
					: "audio/webm";

				const recorder = new MediaRecorder(stream, { mimeType });
				mediaRecorderRef.current = recorder;
				chunksRef.current = [];
				audioBlobRef.current = null;

				recorder.ondataavailable = (e) => {
					if (e.data.size > 0) {
						chunksRef.current.push(e.data);
					}
				};

				recorder.onstop = () => {
					const blob = new Blob(chunksRef.current, { type: "audio/webm" });
					audioBlobRef.current = blob;

					// Create preview audio URL
					if (previewUrlRef.current) {
						URL.revokeObjectURL(previewUrlRef.current);
					}
					const url = URL.createObjectURL(blob);
					previewUrlRef.current = url;

					const audio = new Audio(url);
					previewAudioRef.current = audio;

					const onEnded = () => {
						setIsPlaying(false);
						setPlaybackTime(0);
					};
					const onTimeUpdate = () => {
						setPlaybackTime(Math.floor(audio.currentTime));
					};
					audio.addEventListener("ended", onEnded);
					audio.addEventListener("timeupdate", onTimeUpdate);

					setHasRecorded(true);
					setIsRecording(false);
					stopWaveform();
					stopTimer();
					closeAudioCtx();
				};

				recorder.start(100);
				setIsRecording(true);
				setElapsed(0);
				elapsedRef.current = 0;

				timerRef.current = setInterval(() => {
					setElapsed((prev) => {
						const next = prev + 1;
						elapsedRef.current = next;
						return next;
					});
				}, 1000);

				drawWaveform();
			} catch (err) {
				console.error("Failed to access microphone:", err);
				if (!cancelled) onCancelRef.current();
			}
		};

		start();

		return () => {
			cancelled = true;
			stopTimer();
			stopWaveform();
			const recorder = mediaRecorderRef.current;
			if (recorder && recorder.state !== "inactive") {
				try {
					recorder.stop();
				} catch (_) {
					/* noop */
				}
			}
			stopMicStream();
			closeAudioCtx();
			// Cleanup preview audio
			if (previewAudioRef.current) {
				previewAudioRef.current.pause();
				previewAudioRef.current = null;
			}
			if (previewUrlRef.current) {
				URL.revokeObjectURL(previewUrlRef.current);
				previewUrlRef.current = null;
			}
		};
	}, []);

	const handleStop = () => {
		const recorder = mediaRecorderRef.current;
		if (!recorder || recorder.state === "inactive") return;

		// Stop recording — triggers onstop handler which sets hasRecorded=true
		recorder.stop();

		// Stop mic stream so browser recording indicator goes away
		if (streamRef.current) {
			for (const track of streamRef.current.getTracks()) {
				track.stop();
			}
			streamRef.current = null;
		}
	};

	const handleSend = () => {
		const blob = audioBlobRef.current;
		if (!blob || isSending) return;

		// Stop any preview playback before sending
		if (previewAudioRef.current) {
			previewAudioRef.current.pause();
		}

		setIsSending(true);
		onSendRef.current(blob, elapsedRef.current);
	};

	const handlePlayPause = () => {
		const audio = previewAudioRef.current;
		if (!audio) return;

		if (isPlaying) {
			audio.pause();
			setIsPlaying(false);
		} else {
			audio.play().catch(console.error);
			setIsPlaying(true);
		}
	};

	const handleCancel = () => {
		// Stop timer & waveform
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
		if (animFrameRef.current) {
			cancelAnimationFrame(animFrameRef.current);
			animFrameRef.current = null;
		}
		// Stop recorder
		const recorder = mediaRecorderRef.current;
		if (recorder && recorder.state !== "inactive") {
			try {
				recorder.stop();
			} catch (_) {
				/* noop */
			}
		}
		// Stop mic
		if (streamRef.current) {
			for (const track of streamRef.current.getTracks()) {
				track.stop();
			}
			streamRef.current = null;
		}
		// Close audio context
		if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
			audioCtxRef.current.close().catch(() => {});
			audioCtxRef.current = null;
		}
		// Cleanup preview audio
		if (previewAudioRef.current) {
			previewAudioRef.current.pause();
			previewAudioRef.current = null;
		}
		if (previewUrlRef.current) {
			URL.revokeObjectURL(previewUrlRef.current);
			previewUrlRef.current = null;
		}
		onCancelRef.current();
	};

	return (
		<div className="flex items-center gap-2 w-full py-1">
			{/* Cancel / Delete */}
			<button
				type="button"
				onClick={handleCancel}
				className="w-8 h-8 flex items-center justify-center rounded-full text-red-500 hover:bg-red-50 transition-colors shrink-0"
				title="Cancel recording"
			>
				<Trash2 className="w-4 h-4" />
			</button>

			{/* Recording indicator & waveform */}
			<div className="flex-1 flex items-center gap-3 min-w-0">
				{isRecording && (
					<div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
				)}

				{isRecording && (
					<canvas
						ref={canvasRef}
						width={200}
						height={32}
						className="flex-1 max-w-[200px] rounded bg-slate-50"
					/>
				)}

				{hasRecorded && !isRecording && (
					<button
						type="button"
						onClick={handlePlayPause}
						className="w-8 h-8 flex items-center justify-center rounded-full bg-[#0B6E4F] text-white hover:bg-[#0B6E4F]/90 transition-colors shrink-0"
						title={isPlaying ? "Pause preview" : "Play preview"}
					>
						{isPlaying ? (
							<Pause className="w-3.5 h-3.5 fill-current" />
						) : (
							<Play className="w-3.5 h-3.5 fill-current ml-0.5" />
						)}
					</button>
				)}

				{hasRecorded && !isRecording && (
					<span className="text-xs text-green-700 font-medium">
						{isPlaying ? formatTime(playbackTime) : formatTime(elapsed)}
					</span>
				)}

				<span className="text-sm font-mono text-slate-600 tabular-nums shrink-0">
					{isRecording ? formatTime(elapsed) : hasRecorded ? `/ ${formatTime(elapsed)}` : ""}
				</span>
			</div>

			{/* Stop (while recording) */}
			{isRecording && (
				<button
					type="button"
					onClick={handleStop}
					className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shrink-0"
					title="Stop recording"
				>
					<Square className="w-3.5 h-3.5 fill-current" />
				</button>
			)}

			{/* Send (after stopped) */}
			{hasRecorded && !isRecording && (
				<button
					type="button"
					onClick={handleSend}
					disabled={isSending}
					className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#0B6E4F] text-white hover:bg-[#0B6E4F]/90 transition-colors shrink-0 disabled:opacity-50"
					title="Send voice message"
				>
					<Send className="w-4 h-4" />
				</button>
			)}

			{/* Idle state — waiting for mic access */}
			{!isRecording && !hasRecorded && (
				<div className="flex items-center gap-2 text-slate-400">
					<Mic className="w-4 h-4 animate-pulse" />
					<span className="text-xs">Starting mic...</span>
				</div>
			)}
		</div>
	);
}
