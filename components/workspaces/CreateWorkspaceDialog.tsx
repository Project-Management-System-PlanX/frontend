"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Loader2, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { workspaceService } from "@/lib/api/services";
import type { Workspace } from "@/lib/types/models";

interface CreateWorkspaceDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onCreateSuccess: (workspace?: Workspace) => void;
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
	const router = useRouter();

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
			const activeWorkspace = await workspaceService.create(
				{
					name: name.trim(),
					slug,
				},
				token,
			);
			setStep("complete");
			onCreateSuccess(activeWorkspace);
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

	const handleClose = (shouldNavigate?: boolean) => {
		setStep("name");
		setName("");
		setError(null);
		onClose();
		if (shouldNavigate) {
			router.push("/dashboard");
		}
	};

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
			{/* Backdrop */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				onClick={() => handleClose()}
				className="absolute inset-0 bg-black/20 backdrop-blur-sm"
			/>

			{/* Modal */}
			<motion.div
				initial={{ opacity: 0, scale: 0.96, y: 10 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.96, y: 10 }}
				transition={{ type: "spring", stiffness: 400, damping: 30 }}
				className="relative w-full max-w-[440px] bg-white/95 backdrop-blur-3xl rounded-[24px] shadow-[0_24px_80px_rgba(0,0,0,0.12)] border border-white/60 overflow-hidden"
				style={{
					fontFamily: "'-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Inter', sans-serif",
				}}
			>
				<button
					type="button"
					onClick={() => handleClose()}
					className="absolute top-5 right-5 p-2 text-gray-300 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-all z-10"
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
								transition={{ duration: 0.2 }}
								className="space-y-7"
							>
								<div className="text-center space-y-4">
									<div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#007AFF] to-[#5856D6] rounded-[20px] flex items-center justify-center shadow-lg shadow-blue-500/20">
										<Sparkles className="w-8 h-8 text-white" />
									</div>
									<div>
										<h2 className="text-[22px] font-bold text-gray-900 tracking-tight">
											Create your workspace
										</h2>
										<p className="text-[14px] text-gray-500 mt-1.5">
											Give your team a home to collaborate
										</p>
									</div>
								</div>

								<div className="space-y-4">
									{error && (
										<motion.div
											initial={{ opacity: 0, y: -10 }}
											animate={{ opacity: 1, y: 0 }}
											className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-[13px] text-red-600 text-center font-medium"
										>
											{error}
										</motion.div>
									)}

									<div className="space-y-2">
										<label
											htmlFor="workspace-name"
											className="text-[13px] font-semibold text-gray-700"
										>
											Workspace name
										</label>
										<input
											id="workspace-name"
											type="text"
											value={name}
											onChange={(e) => setName(e.target.value)}
											placeholder="Acme Inc."
											className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#007AFF] focus:ring-4 focus:ring-[#007AFF]/10 outline-none transition-all text-[15px] text-gray-900 placeholder:text-gray-300 font-medium"
											onKeyDown={(e) => {
												if (e.key === "Enter" && name.trim()) handleCreate();
											}}
										/>
										{name && (
											<p className="text-[12px] text-gray-400">
												URL:{" "}
												<span className="font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
													{slug}.teamup.app
												</span>
											</p>
										)}
									</div>

									<button
										type="button"
										onClick={handleCreate}
										disabled={!name.trim() || isLoading}
										className="w-full flex items-center justify-center gap-2.5 bg-gray-900 text-white px-6 py-3.5 rounded-xl text-[14px] font-semibold hover:bg-gray-800 shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-2"
									>
										{isLoading ? (
											<Loader2 className="w-5 h-5 animate-spin" />
										) : (
											<>
												Create Workspace
												<ArrowRight className="w-4 h-4" />
											</>
										)}
									</button>
								</div>
							</motion.div>
						)}

						{step === "complete" && (
							<motion.div
								key="step-complete"
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ type: "spring", stiffness: 300, damping: 25 }}
								className="text-center space-y-7 py-4"
							>
								<motion.div
									className="w-20 h-20 mx-auto bg-gradient-to-br from-[#34C759] to-[#30D158] rounded-full flex items-center justify-center shadow-xl shadow-green-500/20"
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ type: "spring", delay: 0.1 }}
								>
									<Check className="w-10 h-10 text-white" strokeWidth={3} />
								</motion.div>
								<div className="space-y-2">
									<h2 className="text-[22px] font-bold text-gray-900 tracking-tight">
										You&apos;re all set!
									</h2>
									<p className="text-[14px] text-gray-500">
										<span className="font-semibold text-[#007AFF]">{name}</span> has been created
										successfully.
									</p>
								</div>
								<button
									type="button"
									onClick={() => handleClose(true)}
									className="w-full flex items-center justify-center gap-2.5 bg-gray-900 text-white px-6 py-3.5 rounded-xl text-[14px] font-semibold hover:bg-gray-800 shadow-md transition-all"
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
