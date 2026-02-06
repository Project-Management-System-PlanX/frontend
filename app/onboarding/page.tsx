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
		gradient: "from-[#156d95] via-[#1a7ba8] to-[#167E6C]",
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
		gradient: "from-[#167E6C] via-[#1a8f7a] to-[#156d95]",
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
		gradient: "from-[#6366f1] via-[#8b5cf6] to-[#a855f7]",
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
		gradient: "from-[#f59e0b] via-[#f97316] to-[#ef4444]",
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
		gradient: "from-[#ec4899] via-[#d946ef] to-[#a855f7]",
		features: ["Easy Invites", "Team Channels", "Shared Goals"],
	},
	complete: {
		headline: "Ready to Transform Your Team",
		description:
			"You're all set to experience the future of team management. Let's make great things happen.",
		highlight: "Welcome aboard!",
		icon: Check,
		gradient: "from-[#10b981] via-[#14b8a6] to-[#06b6d4]",
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
	const IconComponent = content.icon;

	return (
		<div className="hidden lg:flex lg:w-1/2 bg-[#0a0f2e] p-12 flex-col justify-between relative overflow-hidden">
			{/* Animated Gradient Orbs */}
			<div className="absolute inset-0 overflow-hidden">
				<motion.div
					className={`absolute w-[600px] h-[600px] rounded-full bg-gradient-to-br ${content.gradient} opacity-20 blur-[120px]`}
					animate={{
						x: [0, 50, 0],
						y: [0, 30, 0],
						scale: [1, 1.1, 1],
					}}
					transition={{
						duration: 8,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeInOut",
					}}
					style={{ top: "-20%", left: "-10%" }}
				/>
				<motion.div
					className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-br from-[#156d95] to-[#167E6C] opacity-15 blur-[100px]"
					animate={{
						x: [0, -30, 0],
						y: [0, 50, 0],
						scale: [1, 1.2, 1],
					}}
					transition={{
						duration: 10,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeInOut",
						delay: 1,
					}}
					style={{ bottom: "-10%", right: "-5%" }}
				/>
				{/* Floating particles */}
				{[...Array(5)].map((_, i) => (
					<motion.div
						// biome-ignore lint/suspicious/noArrayIndexKey: stable array for decorative particles
						key={`particle-${currentStep}-${i}`}
						className="absolute w-2 h-2 rounded-full bg-white/20"
						animate={{
							y: [0, -100, 0],
							opacity: [0, 1, 0],
						}}
						transition={{
							duration: 4 + i,
							repeat: Number.POSITIVE_INFINITY,
							delay: i * 0.8,
							ease: "easeInOut",
						}}
						style={{
							left: `${15 + i * 18}%`,
							bottom: "10%",
						}}
					/>
				))}
			</div>

			{/* Grid pattern overlay */}
			<div
				className="absolute inset-0 opacity-[0.03]"
				style={{
					backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
					backgroundSize: "60px 60px",
				}}
			/>

			{/* Logo */}
			<motion.div
				className="relative z-10"
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				<Link
					href="/"
					className="text-3xl font-bold text-white inline-flex items-center gap-2"
					style={{ fontFamily: "Figtree", fontWeight: 800 }}
				>
					<motion.div
						className={`w-10 h-10 rounded-xl bg-gradient-to-br ${content.gradient} flex items-center justify-center`}
						animate={{ rotate: [0, 5, -5, 0] }}
						transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
					>
						<span className="text-white font-bold text-lg">T</span>
					</motion.div>
					TeamUp
				</Link>
			</motion.div>

			{/* Dynamic Content */}
			<div className="relative z-10 flex-1 flex flex-col justify-center py-12">
				<AnimatePresence mode="wait">
					<motion.div
						key={currentStep}
						variants={staggerContainer}
						initial="initial"
						animate="animate"
						exit="exit"
						className="space-y-8"
					>
						{/* Icon Badge */}
						<motion.div variants={staggerItem} className="flex items-center gap-3">
							<motion.div
								className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${content.gradient} flex items-center justify-center shadow-lg shadow-white/10`}
								whileHover={{ scale: 1.05, rotate: 5 }}
								transition={{ type: "spring", stiffness: 300 }}
							>
								<IconComponent className="w-8 h-8 text-white" />
							</motion.div>
							<div className="flex flex-col">
								<span
									className="text-white/50 text-sm uppercase tracking-wider"
									style={{ fontFamily: "Figtree" }}
								>
									Step {currentStepIndex + 1} of {steps.length - 1}
								</span>
							</div>
						</motion.div>

						{/* Main Headline with gradient text */}
						<motion.h1
							variants={staggerItem}
							className="text-5xl font-bold text-white leading-tight"
							style={{ fontFamily: "Figtree" }}
						>
							{content.headline.split(" ").map((word, i) => (
								<motion.span
									// biome-ignore lint/suspicious/noArrayIndexKey: stable word order for headline animation
									key={`word-${currentStep}-${i}`}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.1 + i * 0.05 }}
									className={
										i === content.headline.split(" ").length - 1
											? `bg-gradient-to-r ${content.gradient} bg-clip-text text-transparent`
											: ""
									}
								>
									{word}{" "}
								</motion.span>
							))}
						</motion.h1>

						{/* Description */}
						<motion.p
							variants={staggerItem}
							className="text-xl text-white/60 leading-relaxed max-w-md"
							style={{ fontFamily: "Figtree" }}
						>
							{content.description}
						</motion.p>

						{/* Stats Card */}
						{"stat" in content && content.stat && (
							<motion.div variants={staggerItem} className="flex gap-4">
								<motion.div
									className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-8 py-5 group"
									whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
									transition={{ type: "spring", stiffness: 300 }}
								>
									<motion.p
										className={`text-4xl font-bold bg-gradient-to-r ${content.gradient} bg-clip-text text-transparent`}
										style={{ fontFamily: "Figtree" }}
										initial={{ scale: 0.5 }}
										animate={{ scale: 1 }}
										transition={{ type: "spring", delay: 0.3 }}
									>
										{content.stat}
									</motion.p>
									<p className="text-sm text-white/50 mt-1" style={{ fontFamily: "Figtree" }}>
										{content.statLabel}
									</p>
								</motion.div>
							</motion.div>
						)}

						{/* Feature Tags */}
						<motion.div variants={staggerItem} className="flex flex-wrap gap-3">
							{content.features.map((feature, i) => (
								<motion.div
									key={feature}
									initial={{ opacity: 0, scale: 0.8 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ delay: 0.4 + i * 0.1 }}
									className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm backdrop-blur-sm"
									style={{ fontFamily: "Figtree" }}
									whileHover={{ backgroundColor: "rgba(255,255,255,0.15)", scale: 1.05 }}
								>
									{feature}
								</motion.div>
							))}
						</motion.div>

						{/* Social Proof */}
						<motion.div variants={staggerItem} className="flex items-center gap-4 pt-4">
							<div className="flex -space-x-3">
								{[...Array(4)].map((_, i) => (
									<motion.div
										// biome-ignore lint/suspicious/noArrayIndexKey: stable array for avatar decorations
										key={`avatar-${i}`}
										initial={{ opacity: 0, scale: 0, x: -20 }}
										animate={{ opacity: 1, scale: 1, x: 0 }}
										transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
										className={`w-10 h-10 rounded-full bg-gradient-to-br ${
											i === 0
												? "from-blue-400 to-blue-600"
												: i === 1
													? "from-purple-400 to-purple-600"
													: i === 2
														? "from-pink-400 to-pink-600"
														: "from-orange-400 to-orange-600"
										} border-2 border-[#0a0f2e] flex items-center justify-center text-white text-xs font-bold shadow-lg`}
									>
										{["JD", "SK", "AR", "MK"][i]}
									</motion.div>
								))}
								<motion.div
									initial={{ opacity: 0, scale: 0 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ delay: 0.9, type: "spring" }}
									className="w-10 h-10 rounded-full bg-white/10 border-2 border-[#0a0f2e] flex items-center justify-center text-white/60 text-xs backdrop-blur-sm"
								>
									+99
								</motion.div>
							</div>
							<p className="text-white/50 text-sm" style={{ fontFamily: "Figtree" }}>
								{content.highlight}
							</p>
						</motion.div>
					</motion.div>
				</AnimatePresence>
			</div>

			{/* Step Indicator */}
			<motion.div
				className="relative z-10 space-y-4"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.5 }}
			>
				<div className="flex gap-2">
					{steps.slice(0, -1).map((step, index) => (
						<motion.div
							key={step}
							className="h-1 rounded-full overflow-hidden bg-white/10"
							style={{ width: index === currentStepIndex ? 48 : 16 }}
							animate={{ width: index === currentStepIndex ? 48 : 16 }}
							transition={{ duration: 0.3 }}
						>
							<motion.div
								className={`h-full bg-gradient-to-r ${content.gradient}`}
								initial={{ width: "0%" }}
								animate={{ width: index <= currentStepIndex ? "100%" : "0%" }}
								transition={{ duration: 0.5, delay: 0.2 }}
							/>
						</motion.div>
					))}
				</div>
				<p className="text-white/30 text-sm" style={{ fontFamily: "Figtree" }}>
					© 2024 TeamUp. All rights reserved.
				</p>
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
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex">
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
						className="lg:hidden text-2xl font-bold text-[#111A4A]"
						style={{ fontFamily: "Figtree", fontWeight: 800 }}
					>
						TeamUp
					</Link>
					{currentStepIndex > 0 && currentStep !== "complete" && (
						<motion.button
							type="button"
							onClick={handleBack}
							className="flex items-center gap-2 text-gray-600 hover:text-[#111A4A] transition-colors"
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
								className="h-full bg-gradient-to-r from-[#156d95] to-[#167E6C] rounded-full"
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
											className="w-16 h-16 mx-auto bg-gradient-to-br from-[#156d95]/10 to-[#167E6C]/10 rounded-2xl flex items-center justify-center"
											whileHover={{ scale: 1.1, rotate: 5 }}
										>
											<StepIcon className="w-7 h-7 text-[#156d95]" />
										</motion.div>
										<h2
											className="text-2xl font-bold text-[#111A4A]"
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
												className="text-sm font-medium text-[#111A4A]"
												style={{ fontFamily: "Figtree" }}
											>
												Email address
											</p>
											<input
												type="email"
												value={data.email}
												onChange={(e) => setData({ ...data, email: e.target.value })}
												placeholder="you@company.com"
												className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#156d95] focus:ring-2 focus:ring-[#156d95]/20 outline-none transition-all text-[#111A4A]"
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
												className="text-[#111A4A] font-medium"
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
											<span className="font-medium text-[#111A4A]">{data.email}</span>
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
													className="w-12 h-14 text-center text-xl font-semibold rounded-xl border border-gray-200 focus:border-[#156d95] focus:ring-2 focus:ring-[#156d95]/20 outline-none transition-all text-[#111A4A]"
													style={{ fontFamily: "Figtree" }}
													whileFocus={{ scale: 1.05 }}
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
								)}

								{currentStep === "workspace" && (
									<div className="space-y-6">
										<div className="space-y-2">
											<p
												className="text-sm font-medium text-[#111A4A]"
												style={{ fontFamily: "Figtree" }}
											>
												Workspace name
											</p>
											<input
												type="text"
												value={data.workspaceName}
												onChange={(e) => setData({ ...data, workspaceName: e.target.value })}
												placeholder="Acme Inc."
												className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#156d95] focus:ring-2 focus:ring-[#156d95]/20 outline-none transition-all text-[#111A4A]"
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
												className="text-sm font-medium text-[#111A4A]"
												style={{ fontFamily: "Figtree" }}
											>
												Your full name
											</p>
											<input
												type="text"
												value={data.userName}
												onChange={(e) => setData({ ...data, userName: e.target.value })}
												placeholder="John Doe"
												className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#156d95] focus:ring-2 focus:ring-[#156d95]/20 outline-none transition-all text-[#111A4A]"
												style={{ fontFamily: "Figtree" }}
											/>
										</div>
									</div>
								)}

								{currentStep === "invite" && (
									<div className="space-y-6">
										<div className="space-y-3">
											<p
												className="text-sm font-medium text-[#111A4A]"
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
													className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#156d95] focus:ring-2 focus:ring-[#156d95]/20 outline-none transition-all text-[#111A4A]"
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
												className="text-[#156d95] text-sm font-medium hover:underline"
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
											className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30"
											initial={{ scale: 0 }}
											animate={{ scale: 1 }}
											transition={{ type: "spring", delay: 0.2 }}
										>
											<Check className="w-12 h-12 text-white" />
										</motion.div>
										<div>
											<h3
												className="text-2xl font-bold text-[#111A4A] mb-2"
												style={{ fontFamily: "Figtree" }}
											>
												Welcome, {data.userName}!
											</h3>
											<p className="text-gray-600" style={{ fontFamily: "Figtree" }}>
												Your workspace{" "}
												<span className="font-semibold text-[#156d95]">{data.workspaceName}</span>{" "}
												is ready.
											</p>
										</div>
										<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
											<Link
												href="/"
												className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#156d95] to-[#167E6C] text-white px-6 py-4 rounded-xl font-medium hover:shadow-lg hover:shadow-[#156d95]/30 transition-all"
												style={{ fontFamily: "Figtree" }}
											>
												Go to Dashboard
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
										className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#156d95] to-[#167E6C] text-white px-6 py-4 rounded-xl font-medium hover:shadow-lg hover:shadow-[#156d95]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
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
