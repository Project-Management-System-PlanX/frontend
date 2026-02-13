"use client";

import { ArrowLeft, ArrowRight, Globe2, Hash, Lock, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
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

	// Focus input when dialog opens
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
				className="sm:max-w-[500px] p-0 gap-0 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl [&>button]:hidden"
				style={{ fontFamily: "var(--font-figtree), Figtree" }}
			>
				<DialogTitle className="sr-only">Create a channel</DialogTitle>

				{/* ──── Header ──── */}
				<div className="relative px-7 pt-7 pb-0">
					{/* Decorative accent bar */}
					<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0B6E4F] via-[#0B6E4F]/60 to-emerald-300" />

					<div className="flex items-start justify-between">
						<div>
							<div className="flex items-center gap-2.5">
								<div className="w-9 h-9 rounded-xl bg-[#0B6E4F]/10 flex items-center justify-center">
									<Hash className="w-4.5 h-4.5 text-[#0B6E4F]" />
								</div>
								<div>
									<h2 className="text-lg font-bold text-slate-900 leading-tight">
										Create a channel
									</h2>
									{step === 2 && channelName && (
										<p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1 animate-[fadeIn_0.2s_ease-out]">
											<Hash className="w-3 h-3" />
											{channelName}
										</p>
									)}
								</div>
							</div>
						</div>
						<button
							type="button"
							onClick={handleClose}
							className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 -mr-1 -mt-1"
						>
							<X className="w-5 h-5" />
						</button>
					</div>

					{/* Step indicators */}
					<div className="flex items-center gap-2 mt-5">
						<div
							className={cn(
								"h-1 rounded-full transition-all duration-300 flex-1",
								step >= 1 ? "bg-[#0B6E4F]" : "bg-slate-100",
							)}
						/>
						<div
							className={cn(
								"h-1 rounded-full transition-all duration-300 flex-1",
								step >= 2 ? "bg-[#0B6E4F]" : "bg-slate-100",
							)}
						/>
					</div>
				</div>

				{/* ──── Body ──── */}
				<div className="px-7 py-6 min-h-[120px] overflow-hidden">
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
									className="text-sm font-semibold text-slate-700 mb-3 block"
								>
									Name
								</label>
								<div className="relative">
									<div className="flex items-center bg-white border-2 border-slate-200 rounded-xl focus-within:border-[#0B6E4F] transition-all duration-200 group">
										<span className="pl-4 text-slate-300 group-focus-within:text-[#0B6E4F] transition-colors">
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
											className="flex-1 bg-transparent border-none text-slate-900 placeholder:text-slate-300 text-sm py-3 px-2 outline-none"
										/>
										<span
											className={cn(
												"pr-4 text-xs tabular-nums font-medium transition-colors",
												channelName.length > 70 ? "text-amber-500" : "text-slate-300",
											)}
										>
											{maxLength - channelName.length}
										</span>
									</div>
								</div>

								{channelName && (
									<p className="text-xs text-slate-400 mt-3 animate-[fadeIn_0.2s_ease-out]">
										Channels names can&apos;t contain spaces or uppercase letters. Use hyphens
										instead.
									</p>
								)}
							</div>
						) : (
							/* ──── Step 2: Visibility ──── */
							<div>
								<span className="text-sm font-semibold text-slate-700 mb-4 block">Visibility</span>
								<div className="space-y-3">
									{/* Public option */}
									<button
										type="button"
										onClick={() => setVisibility("public")}
										className={cn(
											"w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left",
											visibility === "public"
												? "border-[#0B6E4F] bg-[#0B6E4F]/5"
												: "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
										)}
									>
										<div
											className={cn(
												"w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
												visibility === "public"
													? "bg-[#0B6E4F] text-white"
													: "bg-slate-100 text-slate-400",
											)}
										>
											<Globe2 className="w-5 h-5" />
										</div>
										<div className="flex-1 min-w-0">
											<p
												className={cn(
													"text-sm font-semibold transition-colors",
													visibility === "public" ? "text-[#0B6E4F]" : "text-slate-700",
												)}
											>
												Public
											</p>
											<p className="text-xs text-slate-400 mt-0.5">
												Anyone in{" "}
												<span className="font-medium text-slate-500">{workspaceName}</span> can find
												and join
											</p>
										</div>
										<div
											className={cn(
												"w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
												visibility === "public" ? "border-[#0B6E4F]" : "border-slate-300",
											)}
										>
											{visibility === "public" && (
												<div className="w-2.5 h-2.5 bg-[#0B6E4F] rounded-full animate-[scaleIn_0.15s_ease-out]" />
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
												? "border-[#0B6E4F] bg-[#0B6E4F]/5"
												: "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
										)}
									>
										<div
											className={cn(
												"w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
												visibility === "private"
													? "bg-[#0B6E4F] text-white"
													: "bg-slate-100 text-slate-400",
											)}
										>
											<Lock className="w-5 h-5" />
										</div>
										<div className="flex-1 min-w-0">
											<p
												className={cn(
													"text-sm font-semibold transition-colors",
													visibility === "private" ? "text-[#0B6E4F]" : "text-slate-700",
												)}
											>
												Private
											</p>
											<p className="text-xs text-slate-400 mt-0.5">
												Can only be viewed or joined by invitation
											</p>
										</div>
										<div
											className={cn(
												"w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
												visibility === "private" ? "border-[#0B6E4F]" : "border-slate-300",
											)}
										>
											{visibility === "private" && (
												<div className="w-2.5 h-2.5 bg-[#0B6E4F] rounded-full animate-[scaleIn_0.15s_ease-out]" />
											)}
										</div>
									</button>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* ──── Footer ──── */}
				<div className="flex items-center justify-between px-7 py-5 border-t border-slate-100 bg-slate-50/50">
					<div className="flex items-center gap-2">
						<span className="text-xs font-medium text-slate-400">Step {step} of 2</span>
					</div>
					<div className="flex items-center gap-2.5">
						{step === 2 && (
							<Button
								variant="ghost"
								onClick={handleBack}
								className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 px-4 gap-1.5 text-sm font-medium"
							>
								<ArrowLeft className="w-3.5 h-3.5" />
								Back
							</Button>
						)}
						{step === 1 ? (
							<Button
								onClick={handleNext}
								disabled={!channelName.trim()}
								className="bg-[#0B6E4F] hover:bg-[#095C42] text-white px-5 gap-1.5 text-sm font-medium rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-30 disabled:shadow-none"
							>
								Next
								<ArrowRight className="w-3.5 h-3.5" />
							</Button>
						) : (
							<Button
								onClick={handleCreate}
								className="bg-[#0B6E4F] hover:bg-[#095C42] text-white px-6 gap-1.5 text-sm font-medium rounded-xl shadow-sm hover:shadow-md transition-all"
							>
								<Sparkles className="w-3.5 h-3.5" />
								Create Channel
							</Button>
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
