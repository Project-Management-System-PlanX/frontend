"use client";

import { ArrowLeft, ArrowRight, Globe2, Hash, Lock, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface CreateChannelDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onChannelCreated?: (channel: { name: string; visibility: "public" | "private" }) => void;
	workspaceName?: string;
}

export function CreateChannelDialog({
	open,
	onOpenChange,
	onChannelCreated,
	workspaceName = "Team UP",
}: CreateChannelDialogProps) {
	const [step, setStep] = useState(1);
	const [channelName, setChannelName] = useState("");
	const [visibility, setVisibility] = useState<"public" | "private">("public");
	const [slideDirection, setSlideDirection] = useState<"forward" | "backward">("forward");
	const inputRef = useRef<HTMLInputElement>(null);

	const maxLength = 80;

	useEffect(() => {
		if (open && step === 1) {
			setTimeout(() => inputRef.current?.focus(), 100);
		}
	}, [open, step]);

	const handleClose = () => {
		onOpenChange(false);
		setTimeout(() => {
			setStep(1);
			setChannelName("");
			setVisibility("public");
			setSlideDirection("forward");
		}, 200);
	};

	const handleNext = () => {
		if (channelName.trim()) {
			setSlideDirection("forward");
			setStep(2);
		}
	};

	const handleBack = () => {
		setSlideDirection("backward");
		setStep(1);
		setTimeout(() => inputRef.current?.focus(), 100);
	};

	const handleCreate = () => {
		if (channelName.trim()) {
			onChannelCreated?.({
				name: channelName.trim().toLowerCase().replace(/\s+/g, "-"),
				visibility,
			});
			handleClose();
		}
	};

	const handleNameChange = (value: string) => {
		const sanitized = value.toLowerCase().replace(/[^a-z0-9-_]/g, "-");
		if (sanitized.length <= maxLength) {
			setChannelName(sanitized);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="sm:max-w-[480px] p-0 gap-0 bg-white/95 backdrop-blur-3xl border border-white/60 rounded-[24px] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.12)] [&>button]:hidden"
				style={{
					fontFamily: "'-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Inter', sans-serif",
				}}
			>
				<DialogTitle className="sr-only">Create a channel</DialogTitle>

				{/* ──── Header ──── */}
				<div className="relative px-8 pt-8 pb-0">
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-[#2D6A4F] to-[#1A3D2B] flex items-center justify-center shadow-md shadow-green-500/20">
								<Hash className="w-5 h-5 text-white" />
							</div>
							<div>
								<h2 className="text-[17px] font-bold text-gray-900 tracking-tight leading-tight">
									Create a channel
								</h2>
								{step === 2 && channelName && (
									<p className="text-gray-400 text-[12px] mt-0.5 flex items-center gap-1">
										<Hash className="w-3 h-3" />
										{channelName}
									</p>
								)}
							</div>
						</div>
						<button
							type="button"
							onClick={handleClose}
							className="text-gray-300 hover:text-gray-500 transition-colors p-2 rounded-full hover:bg-gray-100 -mr-2 -mt-2"
						>
							<X className="w-4 h-4" />
						</button>
					</div>

					{/* Step indicators */}
					<div className="flex items-center gap-2 mt-6">
						<div
							className={cn(
								"h-[3px] rounded-full transition-all duration-300 flex-1",
								step >= 1 ? "bg-[#2D6A4F]" : "bg-gray-100",
							)}
						/>
						<div
							className={cn(
								"h-[3px] rounded-full transition-all duration-300 flex-1",
								step >= 2 ? "bg-[#2D6A4F]" : "bg-gray-100",
							)}
						/>
					</div>
				</div>

				{/* ──── Body ──── */}
				<div className="px-8 py-7 min-h-[140px] overflow-hidden">
					<div
						key={step}
						className={cn(
							"animate-[slideIn_0.25s_ease-out]",
							slideDirection === "backward" && "animate-[slideInBack_0.25s_ease-out]",
						)}
					>
						{step === 1 ? (
							/* ──── Step 1: Channel Name ──── */
							<div>
								<label
									htmlFor="channel-name"
									className="text-[13px] font-semibold text-gray-700 mb-3 block"
								>
									Name
								</label>
								<div className="relative">
									<div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl focus-within:bg-white focus-within:border-[#2D6A4F] focus-within:ring-4 focus-within:ring-[#2D6A4F]/10 transition-all duration-200 group">
										<span className="pl-4 text-gray-300 group-focus-within:text-[#2D6A4F] transition-colors">
											<Hash className="w-4 h-4" />
										</span>
										<input
											id="channel-name"
											ref={inputRef}
											type="text"
											value={channelName}
											onChange={(e) => handleNameChange(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === "Enter" && channelName.trim()) {
													handleNext();
												}
											}}
											placeholder="e.g. plan-budget"
											className="flex-1 bg-transparent border-none text-gray-900 placeholder:text-gray-300 text-[14px] py-3.5 px-2.5 outline-none font-medium"
										/>
										<span
											className={cn(
												"pr-4 text-[11px] tabular-nums font-semibold transition-colors",
												channelName.length > 70 ? "text-[#FF9500]" : "text-gray-300",
											)}
										>
											{maxLength - channelName.length}
										</span>
									</div>
								</div>

								{channelName && (
									<p className="text-[12px] text-gray-400 mt-3">
										Channel names can&apos;t contain spaces or uppercase letters. Use hyphens
										instead.
									</p>
								)}
							</div>
						) : (
							/* ──── Step 2: Visibility ──── */
							<div>
								<span className="text-[13px] font-semibold text-gray-700 mb-4 block">
									Visibility
								</span>
								<div className="space-y-3">
									{/* Public option */}
									<button
										type="button"
										onClick={() => setVisibility("public")}
										className={cn(
											"w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left",
											visibility === "public"
												? "border-[#2D6A4F] bg-[#2D6A4F]/5"
												: "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
										)}
									>
										<div
											className={cn(
												"w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
												visibility === "public"
													? "bg-[#2D6A4F] text-white shadow-md shadow-green-500/20"
													: "bg-gray-100 text-gray-400",
											)}
										>
											<Globe2 className="w-5 h-5" />
										</div>
										<div className="flex-1 min-w-0">
											<p
												className={cn(
													"text-[14px] font-semibold transition-colors",
													visibility === "public" ? "text-[#2D6A4F]" : "text-gray-700",
												)}
											>
												Public
											</p>
											<p className="text-[12px] text-gray-400 mt-0.5">
												Anyone in <span className="font-medium text-gray-500">{workspaceName}</span>{" "}
												can find and join
											</p>
										</div>
										<div
											className={cn(
												"w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
												visibility === "public" ? "border-[#2D6A4F]" : "border-gray-300",
											)}
										>
											{visibility === "public" && (
												<div className="w-2.5 h-2.5 bg-[#2D6A4F] rounded-full animate-[scaleIn_0.15s_ease-out]" />
											)}
										</div>
									</button>

									{/* Private option */}
									<button
										type="button"
										onClick={() => setVisibility("private")}
										className={cn(
											"w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left",
											visibility === "private"
												? "border-[#2D6A4F] bg-[#2D6A4F]/5"
												: "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
										)}
									>
										<div
											className={cn(
												"w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
												visibility === "private"
													? "bg-[#2D6A4F] text-white shadow-md shadow-green-500/20"
													: "bg-gray-100 text-gray-400",
											)}
										>
											<Lock className="w-5 h-5" />
										</div>
										<div className="flex-1 min-w-0">
											<p
												className={cn(
													"text-[14px] font-semibold transition-colors",
													visibility === "private" ? "text-[#2D6A4F]" : "text-gray-700",
												)}
											>
												Private
											</p>
											<p className="text-[12px] text-gray-400 mt-0.5">
												Can only be viewed or joined by invitation
											</p>
										</div>
										<div
											className={cn(
												"w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
												visibility === "private" ? "border-[#2D6A4F]" : "border-gray-300",
											)}
										>
											{visibility === "private" && (
												<div className="w-2.5 h-2.5 bg-[#2D6A4F] rounded-full animate-[scaleIn_0.15s_ease-out]" />
											)}
										</div>
									</button>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* ──── Footer ──── */}
				<div className="flex items-center justify-between px-8 py-5 border-t border-gray-100 bg-gray-50/30">
					<span className="text-[12px] font-medium text-gray-400">Step {step} of 2</span>
					<div className="flex items-center gap-2.5">
						{step === 2 && (
							<button
								type="button"
								onClick={handleBack}
								className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-xl transition-all"
							>
								<ArrowLeft className="w-3.5 h-3.5" />
								Back
							</button>
						)}
						{step === 1 ? (
							<button
								type="button"
								onClick={handleNext}
								disabled={!channelName.trim()}
								className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 text-[13px] font-semibold rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-30 disabled:shadow-none disabled:cursor-not-allowed"
							>
								Next
								<ArrowRight className="w-3.5 h-3.5" />
							</button>
						) : (
							<button
								type="button"
								onClick={handleCreate}
								className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 text-[13px] font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
							>
								<Sparkles className="w-3.5 h-3.5" />
								Create Channel
							</button>
						)}
					</div>
				</div>
			</DialogContent>

			{/* Custom animations */}
			<style jsx global>{`
				@keyframes fadeIn {
					from { opacity: 0; }
					to { opacity: 1; }
				}
				@keyframes slideIn {
					from { opacity: 0; transform: translateX(20px); }
					to { opacity: 1; transform: translateX(0); }
				}
				@keyframes slideInBack {
					from { opacity: 0; transform: translateX(-20px); }
					to { opacity: 1; transform: translateX(0); }
				}
				@keyframes scaleIn {
					from { transform: scale(0); }
					to { transform: scale(1); }
				}
			`}</style>
		</Dialog>
	);
}
