"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Building2, Check, Loader2, Mail, User, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type OnboardingStep = "signup" | "otp" | "workspace" | "name" | "invite" | "complete";

interface OnboardingData {
	email: string;
	otp: string[];
	workspaceName: string;
	userName: string;
	inviteEmails: string[];
}

const stepInfo: Record<OnboardingStep, { title: string; subtitle: string; icon: React.ReactNode }> =
	{
		signup: {
			title: "Create your account",
			subtitle: "Start your journey with TeamUp",
			icon: <Mail className="w-6 h-6" />,
		},
		otp: {
			title: "Verify your email",
			subtitle: "Enter the code we sent to your inbox",
			icon: <Mail className="w-6 h-6" />,
		},
		workspace: {
			title: "Create your workspace",
			subtitle: "Give your team a home",
			icon: <Building2 className="w-6 h-6" />,
		},
		name: {
			title: "What's your name?",
			subtitle: "Let us know who you are",
			icon: <User className="w-6 h-6" />,
		},
		invite: {
			title: "Invite your team",
			subtitle: "Collaboration works better together",
			icon: <Users className="w-6 h-6" />,
		},
		complete: {
			title: "You're all set!",
			subtitle: "Welcome to TeamUp",
			icon: <Check className="w-6 h-6" />,
		},
	};

const steps: OnboardingStep[] = ["signup", "otp", "workspace", "name", "invite", "complete"];

export default function OnboardingPage() {
	const [currentStep, setCurrentStep] = useState<OnboardingStep>("signup");
	const [isLoading, setIsLoading] = useState(false);
	const [data, setData] = useState<OnboardingData>({
		email: "",
		otp: ["", "", "", "", "", ""],
		workspaceName: "",
		userName: "",
		inviteEmails: ["", "", ""],
	});

	const currentStepIndex = steps.indexOf(currentStep);
	const progress = (currentStepIndex / (steps.length - 1)) * 100;

	const handleNext = () => {
		setIsLoading(true);
		setTimeout(() => {
			setIsLoading(false);
			const nextIndex = currentStepIndex + 1;
			if (nextIndex < steps.length) {
				setCurrentStep(steps[nextIndex]);
			}
		}, 500);
	};

	const handleBack = () => {
		const prevIndex = currentStepIndex - 1;
		if (prevIndex >= 0) {
			setCurrentStep(steps[prevIndex]);
		}
	};

	const handleOtpChange = (index: number, value: string) => {
		if (value.length <= 1) {
			const newOtp = [...data.otp];
			newOtp[index] = value;
			setData({ ...data, otp: newOtp });

			// Auto-focus next input
			if (value && index < 5) {
				const nextInput = document.getElementById(`otp-${index + 1}`);
				nextInput?.focus();
			}
		}
	};

	const handleInviteEmailChange = (index: number, value: string) => {
		const newEmails = [...data.inviteEmails];
		newEmails[index] = value;
		setData({ ...data, inviteEmails: newEmails });
	};

	const canProceed = () => {
		switch (currentStep) {
			case "signup":
				return data.email.includes("@") && data.email.includes(".");
			case "otp":
				return data.otp.every((digit) => digit !== "");
			case "workspace":
				return data.workspaceName.length >= 2;
			case "name":
				return data.userName.length >= 2;
			case "invite":
				return true; // Optional step
			default:
				return true;
		}
	};

	const renderStepContent = () => {
		switch (currentStep) {
			case "signup":
				return (
					<div className="space-y-6">
						<div className="space-y-2">
							<p className="text-sm font-medium text-[#111A4A]" style={{ fontFamily: "Figtree" }}>
								Email address
							</p>
							<input
								type="email"
								value={data.email}
								onChange={(e) => setData({ ...data, email: e.target.value })}
								placeholder="you@company.com"
								className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#156d95] focus:ring-2 focus:ring-[#156d95]/20 outline-none transition-all text-[#111A4A]"
								style={{ fontFamily: "Figtree" }}
							/>
						</div>

						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-gray-200" />
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="px-4 bg-white text-gray-500" style={{ fontFamily: "Figtree" }}>
									or continue with
								</span>
							</div>
						</div>

						<button
							type="button"
							className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
						>
							<svg className="w-5 h-5" viewBox="0 0 24 24" role="img" aria-label="Google Logo">
								<title>Google Logo</title>
								<path
									fill="#4285F4"
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								/>
								<path
									fill="#34A853"
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								/>
								<path
									fill="#FBBC05"
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								/>
								<path
									fill="#EA4335"
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								/>
							</svg>
							<span className="text-[#111A4A] font-medium" style={{ fontFamily: "Figtree" }}>
								Continue with Google
							</span>
						</button>
					</div>
				);

			case "otp":
				return (
					<div className="space-y-6">
						<p className="text-center text-gray-600" style={{ fontFamily: "Figtree" }}>
							We sent a 6-digit code to{" "}
							<span className="font-medium text-[#111A4A]">{data.email}</span>
						</p>
						<div className="flex justify-center gap-3">
							{data.otp.map((digit, index) => (
								<input
									// biome-ignore lint/suspicious/noArrayIndexKey: index is stable for OTP inputs
									key={index}
									id={`otp-${index}`}
									type="text"
									maxLength={1}
									value={digit}
									onChange={(e) => handleOtpChange(index, e.target.value)}
									className="w-12 h-14 text-center text-xl font-semibold rounded-xl border border-gray-200 focus:border-[#156d95] focus:ring-2 focus:ring-[#156d95]/20 outline-none transition-all text-[#111A4A]"
									style={{ fontFamily: "Figtree" }}
								/>
							))}
						</div>
						<button
							type="button"
							className="w-full text-center text-[#156d95] text-sm hover:underline"
							style={{ fontFamily: "Figtree" }}
						>
							Didn't receive the code? Resend
						</button>
					</div>
				);

			case "workspace":
				return (
					<div className="space-y-6">
						<div className="space-y-2">
							<p className="text-sm font-medium text-[#111A4A]" style={{ fontFamily: "Figtree" }}>
								Workspace name
							</p>
							<input
								type="text"
								value={data.workspaceName}
								onChange={(e) => setData({ ...data, workspaceName: e.target.value })}
								placeholder="Acme Inc."
								className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#156d95] focus:ring-2 focus:ring-[#156d95]/20 outline-none transition-all text-[#111A4A]"
								style={{ fontFamily: "Figtree" }}
							/>
							<p className="text-sm text-gray-500" style={{ fontFamily: "Figtree" }}>
								This is the name your team will see
							</p>
						</div>
					</div>
				);

			case "name":
				return (
					<div className="space-y-6">
						<div className="space-y-2">
							<p className="text-sm font-medium text-[#111A4A]" style={{ fontFamily: "Figtree" }}>
								Your full name
							</p>
							<input
								type="text"
								value={data.userName}
								onChange={(e) => setData({ ...data, userName: e.target.value })}
								placeholder="John Doe"
								className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#156d95] focus:ring-2 focus:ring-[#156d95]/20 outline-none transition-all text-[#111A4A]"
								style={{ fontFamily: "Figtree" }}
							/>
						</div>
					</div>
				);

			case "invite":
				return (
					<div className="space-y-6">
						<div className="space-y-3">
							<p className="text-sm font-medium text-[#111A4A]" style={{ fontFamily: "Figtree" }}>
								Invite teammates by email
							</p>
							{data.inviteEmails.map((email, index) => (
								<input
									// biome-ignore lint/suspicious/noArrayIndexKey: key is index for simple string list
									key={index}
									type="email"
									value={email}
									onChange={(e) => handleInviteEmailChange(index, e.target.value)}
									placeholder={`teammate${index + 1}@company.com`}
									className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#156d95] focus:ring-2 focus:ring-[#156d95]/20 outline-none transition-all text-[#111A4A]"
									style={{ fontFamily: "Figtree" }}
								/>
							))}
							<button
								type="button"
								onClick={() => setData({ ...data, inviteEmails: [...data.inviteEmails, ""] })}
								className="text-[#156d95] text-sm font-medium hover:underline"
								style={{ fontFamily: "Figtree" }}
							>
								+ Add another
							</button>
						</div>
						<p className="text-sm text-gray-500 text-center" style={{ fontFamily: "Figtree" }}>
							You can skip this and invite teammates later
						</p>
					</div>
				);

			case "complete":
				return (
					<div className="text-center space-y-6">
						<div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
							<Check className="w-10 h-10 text-green-600" />
						</div>
						<div>
							<h3
								className="text-xl font-semibold text-[#111A4A] mb-2"
								style={{ fontFamily: "Figtree" }}
							>
								Welcome, {data.userName}!
							</h3>
							<p className="text-gray-600" style={{ fontFamily: "Figtree" }}>
								Your workspace <span className="font-medium">{data.workspaceName}</span> is ready.
							</p>
						</div>
						<Link
							href="/"
							className="inline-flex items-center justify-center gap-2 w-full bg-[#156d95] text-white px-6 py-3.5 rounded-xl font-medium hover:bg-[#156d95]/90 transition-colors"
							style={{ fontFamily: "Figtree" }}
						>
							Go to Dashboard
							<ArrowRight className="w-4 h-4" />
						</Link>
					</div>
				);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex">
			{/* Left Panel - Branding */}
			<div className="hidden lg:flex lg:w-1/2 bg-[#111A4A] p-12 flex-col justify-between relative overflow-hidden">
				<div className="absolute inset-0 opacity-10">
					<div className="absolute top-20 left-20 w-96 h-96 bg-[#156d95] rounded-full blur-3xl" />
					<div className="absolute bottom-20 right-20 w-80 h-80 bg-[#167E6C] rounded-full blur-3xl" />
				</div>

				<div className="relative z-10">
					<Link
						href="/"
						className="text-3xl font-bold text-white"
						style={{ fontFamily: "Figtree", fontWeight: 800 }}
					>
						TeamUp
					</Link>
				</div>

				<div className="relative z-10 space-y-8">
					<h1
						className="text-4xl font-bold text-white leading-tight"
						style={{ fontFamily: "Figtree" }}
					>
						The Intelligence Layer for Modern Communication
					</h1>
					<p className="text-lg text-white/70" style={{ fontFamily: "Figtree" }}>
						Real-time insights, tone analysis, and team alignment across your favorite tools.
					</p>
					<div className="flex items-center gap-4">
						<div className="flex -space-x-3">
							{[1, 2, 3, 4].map((i) => (
								<div
									key={i}
									className="w-10 h-10 rounded-full bg-gradient-to-br from-[#156d95] to-[#167E6C] border-2 border-[#111A4A]"
								/>
							))}
						</div>
						<p className="text-white/70 text-sm" style={{ fontFamily: "Figtree" }}>
							Join 1000+ organizations
						</p>
					</div>
				</div>

				<div className="relative z-10 text-white/50 text-sm" style={{ fontFamily: "Figtree" }}>
					© 2024 TeamUp. All rights reserved.
				</div>
			</div>

			{/* Right Panel - Form */}
			<div className="flex-1 flex flex-col">
				{/* Header */}
				<div className="p-6 flex items-center justify-between">
					<Link
						href="/"
						className="lg:hidden text-2xl font-bold text-[#111A4A]"
						style={{ fontFamily: "Figtree", fontWeight: 800 }}
					>
						TeamUp
					</Link>
					{currentStepIndex > 0 && currentStep !== "complete" && (
						<button
							type="button"
							onClick={handleBack}
							className="flex items-center gap-2 text-gray-600 hover:text-[#111A4A] transition-colors"
							style={{ fontFamily: "Figtree" }}
						>
							<ArrowLeft className="w-4 h-4" />
							Back
						</button>
					)}
					<div className="flex-1" />
					{currentStep !== "complete" && (
						<span className="text-sm text-gray-500" style={{ fontFamily: "Figtree" }}>
							Step {currentStepIndex + 1} of {steps.length - 1}
						</span>
					)}
				</div>

				{/* Progress Bar */}
				{currentStep !== "complete" && (
					<div className="px-6">
						<div className="h-1 bg-gray-100 rounded-full overflow-hidden">
							<motion.div
								className="h-full bg-[#156d95]"
								initial={{ width: 0 }}
								animate={{ width: `${progress}%` }}
								transition={{ duration: 0.3 }}
							/>
						</div>
					</div>
				)}

				{/* Content */}
				<div className="flex-1 flex items-center justify-center p-6">
					<div className="w-full max-w-md">
						<AnimatePresence mode="wait">
							<motion.div
								key={currentStep}
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -20 }}
								transition={{ duration: 0.3 }}
								className="space-y-8"
							>
								{/* Step Header */}
								{currentStep !== "complete" && (
									<div className="text-center space-y-2">
										<div className="w-14 h-14 mx-auto bg-[#156d95]/10 rounded-2xl flex items-center justify-center text-[#156d95] mb-4">
											{stepInfo[currentStep].icon}
										</div>
										<h2
											className="text-2xl font-bold text-[#111A4A]"
											style={{ fontFamily: "Figtree" }}
										>
											{stepInfo[currentStep].title}
										</h2>
										<p className="text-gray-600" style={{ fontFamily: "Figtree" }}>
											{stepInfo[currentStep].subtitle}
										</p>
									</div>
								)}

								{/* Step Content */}
								{renderStepContent()}

								{/* Continue Button */}
								{currentStep !== "complete" && (
									<button
										type="button"
										onClick={handleNext}
										disabled={!canProceed() || isLoading}
										className="w-full flex items-center justify-center gap-2 bg-[#156d95] text-white px-6 py-3.5 rounded-xl font-medium hover:bg-[#156d95]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
										style={{ fontFamily: "Figtree" }}
									>
										{isLoading ? (
											<Loader2 className="w-5 h-5 animate-spin" />
										) : (
											<>
												{currentStep === "invite" ? "Complete Setup" : "Continue"}
												<ArrowRight className="w-4 h-4" />
											</>
										)}
									</button>
								)}
							</motion.div>
						</AnimatePresence>
					</div>
				</div>
			</div>
		</div>
	);
}
