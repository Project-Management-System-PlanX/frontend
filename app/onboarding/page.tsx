"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ArrowRight, Check, Loader2, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useCallback, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type OnboardingStep = "signup" | "complete";

interface OnboardingData {
	email: string;
	password: string;
}

// Animation variants
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

const steps: OnboardingStep[] = ["signup", "complete"];

const stepInfo = {
	signup: {
		title: "Sign in to your account",
		subtitle: "Start your journey with TeamUp",
		icon: Mail,
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
		icon: Mail,
		gradient: "from-[#50C878] via-[#0B6E4F] to-[#013220]",
		features: ["Real-time Analytics", "AI-Powered Insights", "Team Collaboration"],
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

const LeftPanel = memo(function LeftPanel({
	currentStep,
	currentStepIndex,
}: {
	currentStep: OnboardingStep;
	currentStepIndex: number;
}) {
	const content = leftPanelContent[currentStep];

	return (
		<div className="hidden lg:flex lg:w-1/2 h-screen bg-[#D1F2EB] flex-col relative overflow-hidden">
			<div className="relative z-10 flex flex-col px-12 pt-6 shrink-0">
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
							<motion.div variants={staggerItem} className="flex items-center gap-2">
								<span
									className="text-[#0B6E4F] text-xs uppercase tracking-wider font-mono"
									style={{
										fontFamily: "var(--font-geist-mono), 'Geist Mono', ui-monospace, monospace",
									}}
								>
									Step {currentStepIndex + 1} of {steps.length}
								</span>
							</motion.div>

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
	const [error, setError] = useState<string | null>(null);
	const [isSignUp, setIsSignUp] = useState(false);
	const [data, setData] = useState<OnboardingData>({
		email: "",
		password: "",
	});

	const router = useRouter();
	const supabase = createClient();

	const currentStepIndex = steps.indexOf(currentStep);
	const progress = (currentStepIndex / (steps.length - 1)) * 100;

	const handleEmailAuth = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			if (isSignUp) {
				const { error: signUpError } = await supabase.auth.signUp({
					email: data.email,
					password: data.password,
				});
				if (signUpError) throw signUpError;
				setCurrentStep("complete");
			} else {
				const { error: signInError } = await supabase.auth.signInWithPassword({
					email: data.email,
					password: data.password,
				});
				if (signInError) throw signInError;
				router.push("/workspaces");
			}
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Authentication failed";
			setError(message);
		} finally {
			setIsLoading(false);
		}
	}, [data.email, data.password, isSignUp, supabase.auth, router]);

	const handleGoogleAuth = useCallback(async () => {
		setError(null);
		try {
			const { error: oauthError } = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: {
					redirectTo: `${window.location.origin}/auth/callback`,
				},
			});
			if (oauthError) throw oauthError;
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Google sign-in failed";
			setError(message);
		}
	}, [supabase.auth]);

	const canProceed = useMemo(() => {
		return data.email.includes("@") && data.email.includes(".") && data.password.length >= 6;
	}, [data]);

	const StepIcon = stepInfo[currentStep].icon;

	return (
		<div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 flex">
			<LeftPanel currentStep={currentStep} currentStepIndex={currentStepIndex} />

			<div className="flex-1 flex flex-col">
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
					<div className="flex-1" />
					{currentStep !== "complete" && (
						<span className="text-sm text-gray-500" style={{ fontFamily: "Figtree" }}>
							{isSignUp ? "Sign Up" : "Sign In"}
						</span>
					)}
				</motion.div>

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
								{currentStep === "signup" && (
									<>
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
												{isSignUp ? "Create your account" : "Welcome back"}
											</h2>
											<p className="text-gray-600" style={{ fontFamily: "Figtree" }}>
												{isSignUp
													? "Start your journey with TeamUp"
													: "Sign in to continue to TeamUp"}
											</p>
										</motion.div>

										<div className="space-y-6">
											{error && (
												<motion.div
													initial={{ opacity: 0, y: -10 }}
													animate={{ opacity: 1, y: 0 }}
													className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center"
												>
													{error}
												</motion.div>
											)}

											<div className="space-y-4">
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
												<div className="space-y-2">
													<p
														className="text-sm font-medium text-[#013220]"
														style={{ fontFamily: "Figtree" }}
													>
														Password
													</p>
													<input
														type="password"
														value={data.password}
														onChange={(e) => setData({ ...data, password: e.target.value })}
														placeholder="••••••••"
														className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#50C878] focus:ring-2 focus:ring-[#50C878]/20 outline-none transition-all text-[#013220]"
														style={{ fontFamily: "Figtree" }}
														onKeyDown={(e) => {
															if (e.key === "Enter" && canProceed) handleEmailAuth();
														}}
													/>
													{isSignUp && (
														<p className="text-xs text-gray-400">Minimum 6 characters</p>
													)}
												</div>
											</div>

											<motion.button
												type="button"
												onClick={handleEmailAuth}
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
														{isSignUp ? "Create Account" : "Sign In"}
														<ArrowRight className="w-4 h-4" />
													</>
												)}
											</motion.button>

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
												onClick={handleGoogleAuth}
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

											<p
												className="text-center text-sm text-gray-500"
												style={{ fontFamily: "Figtree" }}
											>
												{isSignUp ? "Already have an account? " : "Don't have an account? "}
												<button
													type="button"
													onClick={() => {
														setIsSignUp(!isSignUp);
														setError(null);
													}}
													className="text-[#0B6E4F] font-semibold hover:underline"
												>
													{isSignUp ? "Sign In" : "Sign Up"}
												</button>
											</p>
										</div>
									</>
								)}

								{currentStep === "complete" && (
									<motion.div
										className="text-center space-y-6"
										variants={scaleIn}
										initial="initial"
										animate="animate"
									>
										<motion.div
											className="w-24 h-24 mx-auto bg-[#50C878] rounded-full flex items-center justify-center shadow-lg"
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
												Account Created!
											</h3>
											<p className="text-gray-600" style={{ fontFamily: "Figtree" }}>
												Check your email to verify your account, then sign in.
											</p>
										</div>
										<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
											<button
												type="button"
												onClick={() => {
													setCurrentStep("signup");
													setIsSignUp(false);
												}}
												className="inline-flex items-center justify-center gap-2 w-full bg-[#0B6E4F] text-white px-6 py-4 rounded-xl font-medium hover:shadow-lg transition-all"
												style={{ fontFamily: "Figtree" }}
											>
												Go to Sign In
												<ArrowRight className="w-4 h-4" />
											</button>
										</motion.div>
									</motion.div>
								)}
							</motion.div>
						</AnimatePresence>
					</div>
				</div>
			</div>
		</div>
	);
}
