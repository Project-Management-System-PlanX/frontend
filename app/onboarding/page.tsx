"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
	ArrowLeft,
	ArrowRight,
	Building2,
	Check,
	Loader2,
	Lock,
	Mail,
	Sparkles,
	User,
	Users,
	Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { memo, useCallback, useMemo, useState } from "react";

type OnboardingStep = "signup" | "otp" | "workspace" | "name" | "invite" | "complete";

interface OnboardingData {
	email: string;
	otp: string[];
	workspaceName: string;
	userName: string;
	inviteEmails: string[];
}

// Animation variants for better performance (defined outside component)
const fadeSlideRight: Variants = {
	initial: { opacity: 0, x: 30 },
	animate: { opacity: 1, x: 0 },
	exit: { opacity: 0, x: -30 },
};

const scaleIn: Variants = {
	initial: { opacity: 0, scale: 0.8 },
	animate: { opacity: 1, scale: 1 },
	exit: { opacity: 0, scale: 0.8 },
};

const staggerContainer: Variants = {
	animate: {
		transition: {
			staggerChildren: 0.1,
		},
	},
};

const staggerItem: Variants = {
	initial: { opacity: 0, y: 20 },
	animate: { opacity: 1, y: 0 },
};

// Step configuration moved outside component
const steps: OnboardingStep[] = ["signup", "otp", "workspace", "name", "invite", "complete"];

const stepInfo = {
	signup: {
		title: "Create your account",
		subtitle: "Start your journey with TeamUp",
		icon: Mail,
	},
	otp: {
		title: "Verify your email",
		subtitle: "Enter the code we sent to your inbox",
		icon: Mail,
	},
	workspace: {
		title: "Create your workspace",
		subtitle: "Give your team a home",
		icon: Building2,
	},
	name: {
		title: "What's your name?",
		subtitle: "Let us know who you are",
		icon: User,
	},
	invite: {
		title: "Invite your team",
		subtitle: "Collaboration works better together",
		icon: Users,
	},
	complete: {
		title: "You're all set!",
		subtitle: "Welcome to TeamUp",
		icon: Check,
	},
} as const;

const leftPanelContent = {
	signup: {
		headline: "The Intelligence Layer for Modern Management",
		description:
			"Real-time insights, tone analysis, and team alignment across your favorite tools.",
		highlight: "Join 1000+ organizations",
		icon: Zap,
		gradient: "from-[#50C878] via-[#0B6E4F] to-[#013220]",
		features: ["Real-time Analytics", "AI-Powered Insights", "Team Collaboration"],
	},
	otp: {
		headline: "Security First, Always",
		description:
			"We take your data security seriously. Email verification ensures only you can access your account.",
		highlight: "256-bit encryption",
		stat: "99.9%",
		statLabel: "Uptime guarantee",
		icon: Lock,
		gradient: "from-[#0B6E4F] via-[#50C878] to-[#013220]",
		features: ["End-to-end Encryption", "Two-Factor Auth", "SOC 2 Compliant"],
	},
	workspace: {
		headline: "Your Team's Digital Headquarters",
		description:
			"Create a centralized hub where your team can collaborate, communicate, and achieve more together.",
		highlight: "Unlimited team members",
		stat: "50%",
		statLabel: "Faster decisions",
		icon: Building2,
		gradient: "from-[#50C878] via-[#0B6E4F] to-[#D1F2EB]",
		features: ["Custom Workflows", "Shared Dashboards", "Role Management"],
	},
	name: {
		headline: "Personalized Experience Awaits",
		description:
			"TeamUp learns your preferences and adapts to how you work, making every interaction more intuitive.",
		highlight: "AI-powered insights",
		stat: "3x",
		statLabel: "Productivity boost",
		icon: Sparkles,
		gradient: "from-[#013220] via-[#0B6E4F] to-[#50C878]",
		features: ["Smart Suggestions", "Adaptive UI", "Personal Dashboard"],
	},
	invite: {
		headline: "Better Together",
		description:
			"Teams using TeamUp report higher engagement, clearer communication, and faster project completion.",
		highlight: "Seamless collaboration",
		stat: "40%",
		statLabel: "Less meetings needed",
		icon: Users,
		gradient: "from-[#D1F2EB] via-[#50C878] to-[#0B6E4F]",
		features: ["Easy Invites", "Team Channels", "Shared Goals"],
	},
	complete: {
		headline: "Ready to Transform Your Team",
		description:
			"You're all set to experience the future of team management. Let's make great things happen.",
		highlight: "Welcome aboard!",
		icon: Check,
		gradient: "from-[#50C878] via-[#0B6E4F] to-[#013220]",
		features: ["Dashboard Access", "Quick Start Guide", "24/7 Support"],
	},
} as const;

// Memoized Left Panel Component for better performance
const LeftPanel = memo(function LeftPanel({
	currentStep,
	currentStepIndex,
}: {
	currentStep: OnboardingStep;
	currentStepIndex: number;
}) {
	const content = leftPanelContent[currentStep];
	const _IconComponent = content.icon;

	return (
		<div className="hidden lg:flex lg:w-1/2 h-screen bg-[#D1F2EB] flex-col relative overflow-hidden">
			{/* Top section: Logo + Text content */}
			<div className="relative z-10 flex flex-col px-12 pt-6 shrink-0">
				{/* Logo */}
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<Link
						href="/"
						className="text-3xl font-bold text-[#013220] inline-flex items-center gap-2"
						style={{ fontFamily: "Figtree", fontWeight: 800 }}
					>
						<motion.div
							className="w-10 h-10 rounded-xl bg-[#50C878] flex items-center justify-center"
							animate={{ rotate: [0, 5, -5, 0] }}
							transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
						>
							<span className="text-white font-bold text-lg">T</span>
						</motion.div>
						TeamUp
					</Link>
				</motion.div>

				{/* Dynamic Content */}
				<div className="mt-8">
					<AnimatePresence mode="wait">
						<motion.div
							key={currentStep}
							variants={staggerContainer}
							initial="initial"
							animate="animate"
							exit="exit"
							className="space-y-6"
						>
							{/* Step Label */}
							<motion.div variants={staggerItem} className="flex items-center gap-2">
								<span
									className="text-[#0B6E4F] text-xs uppercase tracking-wider font-mono"
									style={{
										fontFamily: "var(--font-geist-mono), 'Geist Mono', ui-monospace, monospace",
									}}
								>
									Step {currentStepIndex + 1} of {steps.length - 1}
								</span>
							</motion.div>

							{/* Main Headline */}
							<motion.h1
								variants={staggerItem}
								className="text-4xl font-bold leading-snug text-[#013220] max-w-"
								style={{
									fontFamily: "var(--font-figtree), Figtree",
									fontWeight: "900",
								}}
							>
								{content.headline}
							</motion.h1>

							{/* Description */}
							<motion.p
								variants={staggerItem}
								className="text-lg leading-7 text-[#0B6E4F] mb-10"
								style={{ fontFamily: "var(--font-figtree), Figtree" }}
							>
								{content.description}
							</motion.p>
						</motion.div>
					</AnimatePresence>
				</div>
			</div>

			{/* Dashboard Image - fills remaining space, flush to bottom and right */}
			<motion.div
				initial={{ opacity: 0, x: 100 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
				className="relative z-10 mt-auto pl-4 -mr-0 flex-1 min-h-0 ml-8"
			>
				<motion.div
					animate={{
						boxShadow: [
							"0 0 20px rgba(22, 126, 108, 0.4), 0 0 40px rgba(22, 126, 108, 0.3), 0 0 60px rgba(22, 126, 108, 0.2)",
							"0 0 40px rgba(22, 126, 108, 0.8), 0 0 80px rgba(22, 126, 108, 0.6), 0 0 120px rgba(22, 126, 108, 0.4)",
							"0 0 20px rgba(22, 126, 108, 0.4), 0 0 40px rgba(22, 126, 108, 0.3), 0 0 60px rgba(22, 126, 108, 0.2)",
						],
					}}
					transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
					className="rounded-tl-2xl overflow-hidden shadow-2xl shadow-black/10 ring-2 ring-[#50C878] h-full w-full relative"
				>
					<Image
						src="/thumbnail.png"
						alt="Dashboard preview"
						fill
						priority
						className="object-cover object-top"
						style={{ objectPosition: "2% top" }}
					/>
				</motion.div>
			</motion.div>
		</div>
	);
});

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

	const handleNext = useCallback(() => {
		setIsLoading(true);
		setTimeout(() => {
			setIsLoading(false);
			const nextIndex = currentStepIndex + 1;
			if (nextIndex < steps.length) {
				setCurrentStep(steps[nextIndex]);
			}
		}, 500);
	}, [currentStepIndex]);

	const handleBack = useCallback(() => {
		const prevIndex = currentStepIndex - 1;
		if (prevIndex >= 0) {
			setCurrentStep(steps[prevIndex]);
		}
	}, [currentStepIndex]);

	const handleOtpChange = useCallback((index: number, value: string) => {
		if (value.length <= 1) {
			setData((prev) => {
				const newOtp = [...prev.otp];
				newOtp[index] = value;
				return { ...prev, otp: newOtp };
			});
			if (value && index < 5) {
				const nextInput = document.getElementById(`otp-${index + 1}`);
				nextInput?.focus();
			}
		}
	}, []);

	const handleInviteEmailChange = useCallback((index: number, value: string) => {
		setData((prev) => {
			const newEmails = [...prev.inviteEmails];
			newEmails[index] = value;
			return { ...prev, inviteEmails: newEmails };
		});
	}, []);

	const canProceed = useMemo(() => {
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
				return true;
			default:
				return true;
		}
	}, [currentStep, data]);

	const StepIcon = stepInfo[currentStep].icon;

	return (
		<div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 flex">
			{/* Left Panel */}
			<LeftPanel currentStep={currentStep} currentStepIndex={currentStepIndex} />

			{/* Right Panel - Form */}
			<div className="flex-1 flex flex-col">
				{/* Header */}
				<motion.div
					className="p-6 flex items-center justify-between"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
				>
					<Link
						href="/"
						className="lg:hidden text-2xl font-bold text-[#013220]"
						style={{ fontFamily: "Figtree", fontWeight: 800 }}
					>
						TeamUp
					</Link>
					{currentStepIndex > 0 && currentStep !== "complete" && (
						<motion.button
							type="button"
							onClick={handleBack}
							className="flex items-center gap-2 text-gray-600 hover:text-[#013220] transition-colors"
							style={{ fontFamily: "Figtree" }}
							whileHover={{ x: -4 }}
							whileTap={{ scale: 0.95 }}
						>
							<ArrowLeft className="w-4 h-4" />
							Back
						</motion.button>
					)}
					<div className="flex-1" />
					{currentStep !== "complete" && (
						<span className="text-sm text-gray-500" style={{ fontFamily: "Figtree" }}>
							Step {currentStepIndex + 1} of {steps.length - 1}
						</span>
					)}
				</motion.div>

				{/* Progress Bar */}
				{currentStep !== "complete" && (
					<div className="px-6">
						<div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
							<motion.div
								className="h-full bg-[#0B6E4F] rounded-full"
								initial={{ width: 0 }}
								animate={{ width: `${progress}%` }}
								transition={{ duration: 0.5, ease: "easeOut" }}
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
								variants={fadeSlideRight}
								initial="initial"
								animate="animate"
								exit="exit"
								transition={{ duration: 0.3 }}
								className="space-y-8"
							>
								{/* Step Header */}
								{currentStep !== "complete" && (
									<motion.div className="text-center space-y-3" variants={scaleIn}>
										<motion.div
											className="w-16 h-16 mx-auto bg-[#D1F2EB] rounded-2xl flex items-center justify-center"
											whileHover={{ scale: 1.1, rotate: 5 }}
										>
											<StepIcon className="w-7 h-7 text-[#50C878]" />
										</motion.div>
										<h2
											className="text-2xl font-bold text-[#013220]"
											style={{ fontFamily: "Figtree" }}
										>
											{stepInfo[currentStep].title}
										</h2>
										<p className="text-gray-600" style={{ fontFamily: "Figtree" }}>
											{stepInfo[currentStep].subtitle}
										</p>
									</motion.div>
								)}

								{/* Form Content */}
								{currentStep === "signup" && (
									<div className="space-y-6">
										<div className="space-y-2">
											<p
												className="text-sm font-medium text-[#013220]"
												style={{ fontFamily: "Figtree" }}
											>
												Email address
											</p>
											<input
												type="email"
												value={data.email}
												onChange={(e) => setData({ ...data, email: e.target.value })}
												placeholder="you@company.com"
												className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#50C878] focus:ring-2 focus:ring-[#50C878]/20 outline-none transition-all text-[#013220]"
												style={{ fontFamily: "Figtree" }}
											/>
										</div>

										<div className="relative">
											<div className="absolute inset-0 flex items-center">
												<div className="w-full border-t border-gray-200" />
											</div>
											<div className="relative flex justify-center text-sm">
												<span
													className="px-4 bg-white text-gray-500"
													style={{ fontFamily: "Figtree" }}
												>
													or continue with
												</span>
											</div>
										</div>

										<motion.button
											type="button"
											className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
											whileHover={{ scale: 1.01 }}
											whileTap={{ scale: 0.99 }}
										>
											<svg
												className="w-5 h-5"
												viewBox="0 0 24 24"
												role="img"
												aria-label="Google Logo"
											>
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
											<span
												className="text-[#013220] font-medium"
												style={{ fontFamily: "Figtree" }}
											>
												Continue with Google
											</span>
										</motion.button>
									</div>
								)}

								{currentStep === "otp" && (
									<div className="space-y-6">
										<p className="text-center text-gray-600" style={{ fontFamily: "Figtree" }}>
											We sent a 6-digit code to{" "}
											<span className="font-medium text-[#013220]">{data.email}</span>
										</p>
										<div className="flex justify-center gap-3">
											{data.otp.map((digit, index) => (
												<motion.input
													// biome-ignore lint/suspicious/noArrayIndexKey: OTP inputs have stable positions
													key={`otp-input-${index}`}
													id={`otp-${index}`}
													type="text"
													maxLength={1}
													value={digit}
													onChange={(e) => handleOtpChange(index, e.target.value)}
													className="w-12 h-14 text-center text-xl font-semibold rounded-xl border border-gray-200 focus:border-[#50C878] focus:ring-2 focus:ring-[#50C878]/20 outline-none transition-all text-[#013220]"
													style={{ fontFamily: "Figtree" }}
													whileFocus={{ scale: 1.05 }}
												/>
											))}
										</div>
										<button
											type="button"
											className="w-full text-center text-[#50C878] text-sm hover:underline"
											style={{ fontFamily: "Figtree" }}
										>
											Didn't receive the code? Resend
										</button>
									</div>
								)}

								{currentStep === "workspace" && (
									<div className="space-y-6">
										<div className="space-y-2">
											<p
												className="text-sm font-medium text-[#013220]"
												style={{ fontFamily: "Figtree" }}
											>
												Workspace name
											</p>
											<input
												type="text"
												value={data.workspaceName}
												onChange={(e) => setData({ ...data, workspaceName: e.target.value })}
												placeholder="Acme Inc."
												className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#50C878] focus:ring-2 focus:ring-[#50C878]/20 outline-none transition-all text-[#013220]"
												style={{ fontFamily: "Figtree" }}
											/>
											<p className="text-sm text-gray-500" style={{ fontFamily: "Figtree" }}>
												This is the name your team will see
											</p>
										</div>
									</div>
								)}

								{currentStep === "name" && (
									<div className="space-y-6">
										<div className="space-y-2">
											<p
												className="text-sm font-medium text-[#013220]"
												style={{ fontFamily: "Figtree" }}
											>
												Your full name
											</p>
											<input
												type="text"
												value={data.userName}
												onChange={(e) => setData({ ...data, userName: e.target.value })}
												placeholder="John Doe"
												className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#50C878] focus:ring-2 focus:ring-[#50C878]/20 outline-none transition-all text-[#013220]"
												style={{ fontFamily: "Figtree" }}
											/>
										</div>
									</div>
								)}

								{currentStep === "invite" && (
									<div className="space-y-6">
										<div className="space-y-3">
											<p
												className="text-sm font-medium text-[#013220]"
												style={{ fontFamily: "Figtree" }}
											>
												Invite teammates by email
											</p>
											{data.inviteEmails.map((email, index) => (
												<motion.input
													// biome-ignore lint/suspicious/noArrayIndexKey: invite inputs are added sequentially
													key={`invite-${index}`}
													type="email"
													value={email}
													onChange={(e) => handleInviteEmailChange(index, e.target.value)}
													placeholder={`teammate${index + 1}@company.com`}
													className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#50C878] focus:ring-2 focus:ring-[#50C878]/20 outline-none transition-all text-[#013220]"
													style={{ fontFamily: "Figtree" }}
													initial={{ opacity: 0, y: 10 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{ delay: index * 0.1 }}
												/>
											))}
											<motion.button
												type="button"
												onClick={() =>
													setData({ ...data, inviteEmails: [...data.inviteEmails, ""] })
												}
												className="text-[#50C878] text-sm font-medium hover:underline"
												style={{ fontFamily: "Figtree" }}
												whileHover={{ scale: 1.02 }}
											>
												+ Add another
											</motion.button>
										</div>
										<p
											className="text-sm text-gray-500 text-center"
											style={{ fontFamily: "Figtree" }}
										>
											You can skip this and invite teammates later
										</p>
									</div>
								)}

								{currentStep === "complete" && (
									<motion.div
										className="text-center space-y-6"
										variants={scaleIn}
										initial="initial"
										animate="animate"
									>
										<motion.div
											className="w-24 h-24 mx-auto bg-gradient-to-br bg-[#50C878] rounded-full flex items-center justify-center shadow-lg shadow-lg"
											initial={{ scale: 0 }}
											animate={{ scale: 1 }}
											transition={{ type: "spring", delay: 0.2 }}
										>
											<Check className="w-12 h-12 text-white" />
										</motion.div>
										<div>
											<h3
												className="text-2xl font-bold text-[#013220] mb-2"
												style={{ fontFamily: "Figtree" }}
											>
												Welcome, {data.userName}!
											</h3>
											<p className="text-gray-600" style={{ fontFamily: "Figtree" }}>
												Your workspace{" "}
												<span className="font-semibold text-[#50C878]">{data.workspaceName}</span>{" "}
												is ready.
											</p>
										</div>
										<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
											<Link
												href="/workspaces"
												className="inline-flex items-center justify-center gap-2 w-full bg-[#0B6E4F] text-white px-6 py-4 rounded-xl font-medium hover:shadow-lg hover:shadow-lg transition-all"
												style={{ fontFamily: "Figtree" }}
											>
												Go to Workspaces
												<ArrowRight className="w-4 h-4" />
											</Link>
										</motion.div>
									</motion.div>
								)}

								{/* Continue Button */}
								{currentStep !== "complete" && (
									<motion.button
										type="button"
										onClick={handleNext}
										disabled={!canProceed || isLoading}
										className="w-full flex items-center justify-center gap-2 bg-[#0B6E4F] text-white px-6 py-4 rounded-xl font-medium hover:bg-[#013220] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
										style={{ fontFamily: "Figtree" }}
										whileHover={canProceed ? { scale: 1.01 } : {}}
										whileTap={canProceed ? { scale: 0.99 } : {}}
									>
										{isLoading ? (
											<Loader2 className="w-5 h-5 animate-spin" />
										) : (
											<>
												{currentStep === "invite" ? "Complete Setup" : "Continue"}
												<ArrowRight className="w-4 h-4" />
											</>
										)}
									</motion.button>
								)}
							</motion.div>
						</AnimatePresence>
					</div>
				</div>
			</div>
		</div>
	);
}
