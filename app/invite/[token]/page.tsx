"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Loader2, Users, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { workspaceService } from "@/lib/api/services/workspaces";
import { createClient } from "@/lib/supabase/client";

interface InviteData {
	id: string;
	workspaceId: string;
	token: string;
	expiresAt: string;
	workspace: {
		id: string;
		name: string;
		slug: string;
		avatar: string | null;
	};
}

type PageState = "loading" | "preview" | "auth" | "joining" | "success" | "error";

export default function InvitePage() {
	const params = useParams();
	const router = useRouter();
	const inviteToken = params.token as string;

	const { user, token: authToken, isLoading: authLoading, isAuthenticated } = useSupabaseAuth();
	const supabase = createClient();

	const [state, setState] = useState<PageState>("loading");
	const [invite, setInvite] = useState<InviteData | null>(null);
	const [error, setError] = useState<string | null>(null);

	// Auth form state
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isSignUp, setIsSignUp] = useState(false);
	const [authError, setAuthError] = useState<string | null>(null);
	const [authSubmitting, setAuthSubmitting] = useState(false);

	// Fetch invite details via backend API (no auth needed)
	useEffect(() => {
		const fetchInvite = async () => {
			try {
				const data = await workspaceService.getInvite(inviteToken);

				if (!data) {
					setError("This invite link is invalid or has expired.");
					setState("error");
					return;
				}

				if (new Date(data.expiresAt) < new Date()) {
					setError("This invite link has expired.");
					setState("error");
					return;
				}

				setInvite(data as InviteData);
				setState("preview");
			} catch {
				setError("This invite link is invalid or has expired.");
				setState("error");
			}
		};

		fetchInvite();
	}, [inviteToken]);

	const handleJoin = useCallback(async () => {
		if (!invite || !authToken) return;

		setState("joining");
		try {
			await workspaceService.acceptInvite(inviteToken, authToken);
			setState("success");
		} catch (err: unknown) {
			if (err && typeof err === "object") {
				const status = "status" in err ? (err as { status: number }).status : 0;
				const msg =
					"message" in err ? String((err as { message: string }).message).toLowerCase() : "";

				if (
					status === 409 ||
					msg.includes("already") ||
					msg.includes("unique") ||
					msg.includes("conflict")
				) {
					setState("success");
					return;
				}
			}
			setError("Failed to join workspace. Please try again.");
			setState("error");
		}
	}, [invite, authToken, inviteToken]);

	// Auto-join if already authenticated
	useEffect(() => {
		if (!authLoading && isAuthenticated && invite && state === "preview") {
			handleJoin();
		}
	}, [authLoading, isAuthenticated, invite, state, handleJoin]);

	const handleEmailAuth = async () => {
		setAuthSubmitting(true);
		setAuthError(null);

		try {
			if (isSignUp) {
				const { error: signUpError } = await supabase.auth.signUp({
					email,
					password,
				});
				if (signUpError) throw signUpError;
				setAuthError("Check your email to verify your account, then come back to this link.");
			} else {
				const { error: signInError } = await supabase.auth.signInWithPassword({
					email,
					password,
				});
				if (signInError) throw signInError;
			}
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Authentication failed";
			setAuthError(message);
		} finally {
			setAuthSubmitting(false);
		}
	};

	const handleGoogleAuth = async () => {
		try {
			const { error: oauthError } = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: {
					redirectTo: `${window.location.origin}/invite/${inviteToken}`,
				},
			});
			if (oauthError) throw oauthError;
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Google sign-in failed";
			setAuthError(message);
		}
	};

	return (
		<div
			className="min-h-screen bg-gradient-to-br from-[#F8FCFA] via-white to-[#D1F2EB]/30 flex items-center justify-center p-4"
			style={{ fontFamily: "Figtree, sans-serif" }}
		>
			<motion.div
				initial={{ opacity: 0, y: 20, scale: 0.95 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.4, ease: "easeOut" }}
				className="w-full max-w-md"
			>
				{/* Logo */}
				<div className="text-center mb-8">
					<Link href="/" className="inline-flex items-center gap-2">
						<div className="w-10 h-10 rounded-xl bg-[#0B6E4F] flex items-center justify-center">
							<span className="text-white font-bold text-lg">T</span>
						</div>
						<span className="font-bold text-2xl text-[#013220]">TeamUp</span>
					</Link>
				</div>

				<div className="bg-white rounded-2xl shadow-xl shadow-black/5 border border-[#D1F2EB] overflow-hidden">
					<AnimatePresence mode="wait">
						{/* LOADING */}
						{state === "loading" && (
							<motion.div
								key="loading"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="p-10 text-center"
							>
								<Loader2 className="w-8 h-8 animate-spin text-[#0B6E4F] mx-auto" />
								<p className="text-gray-500 mt-4 text-sm">Loading invite...</p>
							</motion.div>
						)}

						{/* ERROR */}
						{state === "error" && (
							<motion.div
								key="error"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="p-10 text-center space-y-6"
							>
								<div className="w-16 h-16 mx-auto bg-red-50 rounded-full flex items-center justify-center">
									<X className="w-8 h-8 text-red-500" />
								</div>
								<div>
									<h2 className="text-xl font-bold text-[#013220] mb-2">Invite Invalid</h2>
									<p className="text-gray-500 text-sm">{error}</p>
								</div>
								<Link
									href="/onboarding"
									className="inline-flex items-center gap-2 bg-[#0B6E4F] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#013220] transition-colors"
								>
									Go to TeamUp
									<ArrowRight className="w-4 h-4" />
								</Link>
							</motion.div>
						)}

						{/* PREVIEW — show workspace info, auth form if needed */}
						{(state === "preview" || state === "auth") && invite && (
							<motion.div
								key="preview"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="p-8 space-y-6"
							>
								{/* Workspace info */}
								<div className="text-center space-y-4">
									<div className="w-20 h-20 mx-auto bg-[#D1F2EB] rounded-2xl flex items-center justify-center">
										<span className="text-3xl font-bold text-[#0B6E4F]">
											{invite.workspace.name.charAt(0).toUpperCase()}
										</span>
									</div>
									<div>
										<p className="text-sm text-gray-500 mb-1">You have been invited to join</p>
										<h2 className="text-2xl font-bold text-[#013220]">{invite.workspace.name}</h2>
									</div>
								</div>

								{/* If not authenticated, show auth form */}
								{!isAuthenticated && !authLoading && (
									<div className="space-y-4 pt-2">
										<div className="h-px bg-gray-100" />
										<p className="text-center text-sm text-gray-500">
											{isSignUp ? "Create an account" : "Sign in"} to accept the invite
										</p>

										{authError && (
											<div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
												{authError}
											</div>
										)}

										<div className="space-y-3">
											<input
												type="email"
												value={email}
												onChange={(e) => setEmail(e.target.value)}
												placeholder="you@company.com"
												className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#50C878] focus:ring-2 focus:ring-[#50C878]/20 outline-none transition-all text-[#013220] text-sm"
											/>
											<input
												type="password"
												value={password}
												onChange={(e) => setPassword(e.target.value)}
												placeholder="••••••••"
												className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#50C878] focus:ring-2 focus:ring-[#50C878]/20 outline-none transition-all text-[#013220] text-sm"
												onKeyDown={(e) => {
													if (e.key === "Enter") handleEmailAuth();
												}}
											/>
										</div>

										<button
											type="button"
											onClick={handleEmailAuth}
											disabled={!email.includes("@") || password.length < 6 || authSubmitting}
											className="w-full flex items-center justify-center gap-2 bg-[#0B6E4F] text-white px-6 py-3.5 rounded-xl font-medium hover:bg-[#013220] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
										>
											{authSubmitting ? (
												<Loader2 className="w-4 h-4 animate-spin" />
											) : (
												<>
													{isSignUp ? "Sign Up & Join" : "Sign In & Join"}
													<ArrowRight className="w-4 h-4" />
												</>
											)}
										</button>

										{/* Google OAuth */}
										<div className="relative">
											<div className="absolute inset-0 flex items-center">
												<div className="w-full border-t border-gray-200" />
											</div>
											<div className="relative flex justify-center text-xs">
												<span className="px-3 bg-white text-gray-400">or</span>
											</div>
										</div>
										<button
											type="button"
											onClick={handleGoogleAuth}
											className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
										>
											<svg className="w-4 h-4" viewBox="0 0 24 24" role="img" aria-label="Google">
												<title>Google</title>
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
											<span className="text-[#013220] font-medium">Continue with Google</span>
										</button>

										<p className="text-center text-xs text-gray-400">
											{isSignUp ? "Already have an account? " : "New here? "}
											<button
												type="button"
												onClick={() => {
													setIsSignUp(!isSignUp);
													setAuthError(null);
												}}
												className="text-[#0B6E4F] font-semibold hover:underline"
											>
												{isSignUp ? "Sign In" : "Sign Up"}
											</button>
										</p>
									</div>
								)}

								{/* If authenticated, show join button */}
								{isAuthenticated && state === "preview" && (
									<div className="space-y-3 pt-2">
										<div className="flex items-center gap-3 p-3 bg-[#F8FCFA] rounded-xl border border-[#D1F2EB]">
											<div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#50C878] to-[#0B6E4F] flex items-center justify-center text-white text-xs font-medium">
												{user?.email?.substring(0, 2).toUpperCase()}
											</div>
											<div className="text-sm">
												<p className="font-medium text-[#013220]">Signed in as</p>
												<p className="text-gray-500 text-xs">{user?.email}</p>
											</div>
										</div>
										<button
											type="button"
											onClick={handleJoin}
											className="w-full flex items-center justify-center gap-2 bg-[#0B6E4F] text-white px-6 py-3.5 rounded-xl font-medium hover:bg-[#013220] transition-all"
										>
											<Users className="w-4 h-4" />
											Accept Invite & Join
										</button>
									</div>
								)}
							</motion.div>
						)}

						{/* JOINING */}
						{state === "joining" && (
							<motion.div
								key="joining"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="p-10 text-center"
							>
								<Loader2 className="w-8 h-8 animate-spin text-[#0B6E4F] mx-auto" />
								<p className="text-gray-500 mt-4 text-sm">Joining workspace...</p>
							</motion.div>
						)}

						{/* SUCCESS */}
						{state === "success" && invite && (
							<motion.div
								key="success"
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0 }}
								className="p-10 text-center space-y-6"
							>
								<motion.div
									className="w-20 h-20 mx-auto bg-[#0B6E4F] rounded-full flex items-center justify-center shadow-xl shadow-[#0B6E4F]/30"
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ type: "spring", delay: 0.1 }}
								>
									<Check className="w-10 h-10 text-white" />
								</motion.div>
								<div>
									<h2 className="text-xl font-bold text-[#013220] mb-2">You are in!</h2>
									<p className="text-gray-500 text-sm">
										Welcome to{" "}
										<span className="font-semibold text-[#0B6E4F]">{invite.workspace.name}</span>
									</p>
								</div>
								<button
									type="button"
									onClick={() => router.push("/workspaces")}
									className="w-full flex items-center justify-center gap-2 bg-[#0B6E4F] text-white px-6 py-3.5 rounded-xl font-medium hover:bg-[#013220] transition-all"
								>
									Go to Workspaces
									<ArrowRight className="w-4 h-4" />
								</button>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</motion.div>
		</div>
	);
}
