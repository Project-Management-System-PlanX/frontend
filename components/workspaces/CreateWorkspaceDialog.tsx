"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Building2, Check, Loader2, X } from "lucide-react";
import { useState } from "react";
import { workspaceService } from "@/lib/api/services";

interface CreateWorkspaceDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onCreateSuccess: () => void;
	token?: string;
}

type Step = "name" | "complete";

export function CreateWorkspaceDialog({
	isOpen,
	onClose,
	onCreateSuccess,
	token,
}: CreateWorkspaceDialogProps) {
	const [step, setStep] = useState<Step>("name");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [name, setName] = useState("");

	if (!isOpen) return null;

	const slug = name
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.trim();

	const handleCreate = async () => {
		if (!name.trim() || !token) return;
		setIsLoading(true);
		setError(null);

		try {
			await workspaceService.create(
				{
					name: name.trim(),
					slug,
				},
				token,
			);
			setStep("complete");
			onCreateSuccess();
		} catch (err: unknown) {
			if (err && typeof err === "object" && "message" in err) {
				setError(String((err as { message: string }).message));
			} else {
				setError("Failed to create workspace. Please try again.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
		setStep("name");
		setName("");
		setError(null);
		onClose();
	};

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
			{/* Backdrop */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				onClick={handleClose}
				className="absolute inset-0 bg-white/60 backdrop-blur-md"
			/>

			{/* Modal */}
			<motion.div
				initial={{ opacity: 0, scale: 0.95, y: 20 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.95, y: 20 }}
				transition={{ duration: 0.35, ease: "easeOut" }}
				className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl shadow-black/5 border border-[#D1F2EB] overflow-hidden"
			>
				<button
					type="button"
					onClick={handleClose}
					className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
				>
					<X className="w-4 h-4" />
				</button>

				<div className="p-8 sm:p-10">
					<AnimatePresence mode="wait">
						{step === "name" && (
							<motion.div
								key="step-name"
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -20 }}
								className="space-y-8"
							>
								<div className="text-center space-y-4">
									<div className="w-16 h-16 mx-auto bg-[#D1F2EB] rounded-2xl flex items-center justify-center transform rotate-3">
										<Building2 className="w-8 h-8 text-[#0B6E4F]" />
									</div>
									<div>
										<h2 className="text-2xl font-bold text-[#013220] tracking-tight">
											Create your workspace
										</h2>
										<p className="text-gray-500 mt-2">Give your team a home</p>
									</div>
								</div>

								<div className="space-y-4">
									{error && (
										<motion.div
											initial={{ opacity: 0, y: -10 }}
											animate={{ opacity: 1, y: 0 }}
											className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center"
										>
											{error}
										</motion.div>
									)}

									<div className="space-y-2">
										<label
											htmlFor="workspace-name"
											className="text-sm font-semibold text-[#013220]"
										>
											Workspace name
										</label>
										<input
											id="workspace-name"
											type="text"
											value={name}
											onChange={(e) => setName(e.target.value)}
											placeholder="Acme Inc."
											className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#50C878] focus:ring-4 focus:ring-[#50C878]/10 outline-none transition-all text-[#013220] placeholder:text-gray-300 font-medium"
											onKeyDown={(e) => {
												if (e.key === "Enter" && name.trim()) handleCreate();
											}}
										/>
										{name && (
											<p className="text-xs text-gray-400">
												Slug: <span className="font-mono text-gray-500">{slug}</span>
											</p>
										)}
									</div>

									<button
										type="button"
										onClick={handleCreate}
										disabled={!name.trim() || isLoading}
										className="w-full flex items-center justify-center gap-2 bg-[#0B6E4F] text-white px-6 py-4 rounded-xl font-semibold hover:bg-[#013220] hover:shadow-lg hover:shadow-[#0B6E4F]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
									>
										{isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Workspace"}
									</button>
								</div>
							</motion.div>
						)}

						{step === "complete" && (
							<motion.div
								key="step-complete"
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								className="text-center space-y-8 py-4"
							>
								<motion.div
									className="w-24 h-24 mx-auto bg-[#0B6E4F] rounded-full flex items-center justify-center shadow-xl shadow-[#0B6E4F]/30"
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ type: "spring", delay: 0.1 }}
								>
									<Check className="w-12 h-12 text-white" />
								</motion.div>
								<div className="space-y-2">
									<h2 className="text-2xl font-bold text-[#013220]">You're all set!</h2>
									<p className="text-gray-500">
										<span className="font-semibold text-[#0B6E4F]">{name}</span> has been created.
									</p>
								</div>
								<button
									type="button"
									onClick={handleClose}
									className="w-full flex items-center justify-center gap-2 bg-[#0B6E4F] text-white px-6 py-4 rounded-xl font-semibold hover:bg-[#013220] hover:shadow-lg hover:shadow-[#0B6E4F]/20 transition-all"
								>
									Go to Workspace <ArrowRight className="w-4 h-4" />
								</button>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</motion.div>
		</div>
	);
}
