"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Building2, Check, Loader2, Users, X } from "lucide-react";
import { useState } from "react";

interface CreateWorkspaceDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onCreate: (name: string) => void;
}

type Step = "name" | "invite" | "complete";

export function CreateWorkspaceDialog({ isOpen, onClose, onCreate }: CreateWorkspaceDialogProps) {
	const [step, setStep] = useState<Step>("name");
	const [isLoading, setIsLoading] = useState(false);
	const [name, setName] = useState("");
	const [emails, setEmails] = useState(["", "", ""]);

	if (!isOpen) return null;

	const handleNext = () => {
		setIsLoading(true);
		// Simulate API call
		setTimeout(() => {
			setIsLoading(false);
			if (step === "name") setStep("invite");
			else if (step === "invite") {
				setStep("complete");
				onCreate(name);
			} else onClose();
		}, 600);
	};

	const handleEmailChange = (index: number, value: string) => {
		const newEmails = [...emails];
		newEmails[index] = value;
		setEmails(newEmails);
	};

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
			{/* Backdrop */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				onClick={onClose}
				className="absolute inset-0 bg-white/60 backdrop-blur-md"
			/>

			{/* Modal Content */}
			<motion.div
				initial={{ opacity: 0, scale: 0.95, y: 20 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.95, y: 20 }}
				transition={{ duration: 0.35, ease: "easeOut" }}
				className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl shadow-black/5 border border-[#D1F2EB] overflow-hidden"
			>
				{/* Close Button */}
				<button
					type="button"
					onClick={onClose}
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
										/>
										<p className="text-xs text-gray-400">This is the name your team will see</p>
									</div>

									<button
										type="button"
										onClick={handleNext}
										disabled={!name.trim() || isLoading}
										className="w-full flex items-center justify-center gap-2 bg-[#0B6E4F] text-white px-6 py-4 rounded-xl font-semibold hover:bg-[#013220] hover:shadow-lg hover:shadow-[#0B6E4F]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
									>
										{isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue"}
									</button>
								</div>
							</motion.div>
						)}

						{step === "invite" && (
							<motion.div
								key="step-invite"
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -20 }}
								className="space-y-8"
							>
								<div className="text-center space-y-4">
									<div className="w-16 h-16 mx-auto bg-[#D1F2EB] rounded-2xl flex items-center justify-center transform -rotate-3">
										<Users className="w-8 h-8 text-[#0B6E4F]" />
									</div>
									<div>
										<h2 className="text-2xl font-bold text-[#013220] tracking-tight">
											Invite your team
										</h2>
										<p className="text-gray-500 mt-2">Collaboration works better together</p>
									</div>
								</div>

								<div className="space-y-6">
									<div className="space-y-3">
										<p className="text-sm font-semibold text-[#013220]">
											Invite teammates by email
										</p>
										{emails.map((email, i) => (
											<motion.input
												// biome-ignore lint/suspicious/noArrayIndexKey: List is append-only
												key={i}
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: i * 0.1 }}
												type="email"
												value={email}
												onChange={(e) => handleEmailChange(i, e.target.value)}
												placeholder={`teammate${i + 1}@company.com`}
												className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#50C878] focus:ring-4 focus:ring-[#50C878]/10 outline-none transition-all text-[#013220] placeholder:text-gray-300 font-medium"
											/>
										))}
										<button
											type="button"
											onClick={() => setEmails([...emails, ""])}
											className="text-[#0B6E4F] text-sm font-semibold hover:text-[#013220] flex items-center gap-1 transition-colors pl-1"
										>
											+ Add another
										</button>
									</div>

									<div className="space-y-4 pt-2">
										<button
											type="button"
											onClick={handleNext}
											className="w-full flex items-center justify-center gap-2 bg-[#0B6E4F] text-white px-6 py-4 rounded-xl font-semibold hover:bg-[#013220] hover:shadow-lg hover:shadow-[#0B6E4F]/20 transition-all"
										>
											{isLoading ? (
												<Loader2 className="w-5 h-5 animate-spin" />
											) : (
												"Send Invites & Create"
											)}
										</button>
										<button
											type="button"
											onClick={handleNext}
											className="w-full text-center text-gray-400 text-sm hover:text-gray-600 transition-colors"
										>
											You can skip this and invite teammates later
										</button>
									</div>
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
									onClick={onClose}
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
