"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	Clock,
	Hash,
	LayoutGrid,
	Link2,
	List,
	LogOut,
	Plus,
	Search,
	Users,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreateWorkspaceDialog } from "@/components/workspaces/CreateWorkspaceDialog";
import { InviteMembersDialog } from "@/components/workspaces/InviteMembersDialog";
import { useWorkspaces } from "@/hooks/api";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useChannelStore } from "@/stores/channel-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

const CARD =
	"bg-white/60 backdrop-blur-3xl rounded-[24px] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]";

const WORKSPACE_GRADIENTS = [
	"from-[#007AFF] to-[#5856D6]",
	"from-[#FF9500] to-[#FF3B30]",
	"from-[#34C759] to-[#30D158]",
	"from-[#AF52DE] to-[#5856D6]",
	"from-[#FF2D55] to-[#FF6482]",
	"from-[#5AC8FA] to-[#007AFF]",
	"from-[#FF9500] to-[#FFCC00]",
	"from-[#64D2FF] to-[#5AC8FA]",
];

export default function WorkspacesPage() {
	const [view, setView] = useState<"grid" | "list">("grid");
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [inviteWorkspace, setInviteWorkspace] = useState<{ id: string; name: string } | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const router = useRouter();

	const { user, token, isLoading: authLoading, signOut } = useSupabaseAuth();
	const { setActiveWorkspace } = useWorkspaceStore();
	const { setChannels } = useChannelStore();
	const {
		data: workspaces,
		isLoading: workspacesLoading,
		refetch,
	} = useWorkspaces(undefined, token);

	const isLoading = authLoading || workspacesLoading;

	const handleSignOut = async () => {
		await signOut();
		router.push("/");
	};

	const filteredWorkspaces = useMemo(() => {
		if (!workspaces) return [];
		if (!searchQuery.trim()) return workspaces;
		const q = searchQuery.toLowerCase();
		return workspaces.filter(
			(ws) => ws.name.toLowerCase().includes(q) || ws.slug.toLowerCase().includes(q),
		);
	}, [workspaces, searchQuery]);

	const userInitials = user?.email ? user.email.substring(0, 2).toUpperCase() : "?";
	const userName = user?.user_metadata?.first_name
		? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ""}`.trim()
		: user?.email?.split("@")[0] || "User";

	const totalChannels =
		workspaces?.reduce(
			(acc, ws) => acc + (ws.channels?.filter((c) => c.type !== "DIRECT_MESSAGE").length ?? 0),
			0,
		) ?? 0;

	const totalMembers = workspaces?.reduce((acc, ws) => acc + (ws.members?.length ?? 0), 0) ?? 0;

	return (
		<div
			className="min-h-screen bg-[#eff1f4] selection:bg-blue-200"
			style={{
				fontFamily: "'-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Inter', sans-serif",
			}}
		>
			{/* Ambient depth gradients */}
			<div className="fixed top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-blue-400/5 blur-[120px] pointer-events-none" />
			<div className="fixed bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

			{/* ──── Top Bar ──── */}
			<header className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-white/40">
				<div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
					<Link href="/" className="flex items-center gap-3 group">
						<div className="w-9 h-9 rounded-[12px] bg-gradient-to-b from-[#5AC8FA] to-[#007AFF] flex items-center justify-center text-white shadow-md shadow-blue-500/20 transition-all group-hover:shadow-blue-500/30">
							<Zap className="w-5 h-5 fill-white/20" />
						</div>
						<span className="font-bold text-[18px] text-gray-900 tracking-tight">TeamUp</span>
					</Link>

					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={handleSignOut}
							className="flex items-center gap-2 bg-white/70 hover:bg-white backdrop-blur-xl border border-white rounded-xl px-3.5 py-2 text-[13px] font-medium text-gray-500 hover:text-red-500 shadow-sm transition-all"
						>
							<LogOut className="w-4 h-4" />
							Sign Out
						</button>
						<Avatar className="w-9 h-9 ring-2 ring-white shadow-sm">
							<AvatarImage
								src={user?.user_metadata?.avatar_url || user?.user_metadata?.picture}
								alt={userName}
								referrerPolicy="no-referrer"
							/>
							<AvatarFallback className="bg-gradient-to-tr from-blue-500 to-indigo-500 text-white font-medium text-sm">
								{userInitials}
							</AvatarFallback>
						</Avatar>
					</div>
				</div>
			</header>

			{/* ──── Main Content ──── */}
			<main className="max-w-[1200px] mx-auto px-6 py-10 relative z-10">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.35, ease: "easeOut" }}
				>
					{/* ──── Page Header ──── */}
					<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
						<div>
							<h1 className="text-[28px] font-bold text-gray-900 tracking-tight mb-1">
								Welcome back, {userName}
							</h1>
							<p className="text-[14px] text-gray-500">
								Select a workspace to continue, or create a new one
							</p>
						</div>

						<div className="flex items-center gap-3">
							{/* Search */}
							<div className="relative group">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-[#007AFF] transition-colors" />
								<input
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Search workspaces..."
									className="w-56 bg-white/70 backdrop-blur-xl border border-white rounded-xl py-2 pl-9 pr-4 text-[13px] font-medium text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-200 transition-all outline-none shadow-sm"
								/>
							</div>

							{/* View Toggle */}
							<div className="flex bg-gradient-to-b from-gray-100/80 to-gray-200/60 p-1 rounded-[12px] backdrop-blur-2xl border border-white/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
								<button
									type="button"
									onClick={() => setView("grid")}
									className={`relative z-10 p-2 rounded-[8px] transition-colors ${
										view === "grid"
											? "bg-white text-gray-900 shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
											: "text-gray-500"
									}`}
								>
									<LayoutGrid className="w-4 h-4" />
								</button>
								<button
									type="button"
									onClick={() => setView("list")}
									className={`relative z-10 p-2 rounded-[8px] transition-colors ${
										view === "list"
											? "bg-white text-gray-900 shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
											: "text-gray-500"
									}`}
								>
									<List className="w-4 h-4" />
								</button>
							</div>

							{/* New Workspace */}
							<button
								type="button"
								onClick={() => setIsCreateModalOpen(true)}
								className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white shadow-md transition-all"
							>
								<Plus className="w-4 h-4" />
								<span className="hidden sm:inline">New Workspace</span>
							</button>
						</div>
					</div>

					{/* ──── Content ──── */}
					<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
						{/* Workspace Cards */}
						<div className="lg:col-span-3">
							{isLoading ? (
								<div className="flex items-center justify-center py-24">
									<div className="animate-spin w-8 h-8 border-2 border-[#007AFF] border-t-transparent rounded-full" />
								</div>
							) : filteredWorkspaces.length === 0 && !searchQuery.trim() ? (
								<div className={`${CARD} p-16 text-center`}>
									<div className="w-16 h-16 mx-auto rounded-[20px] bg-blue-50 flex items-center justify-center mb-5">
										<Users className="w-8 h-8 text-[#007AFF]" />
									</div>
									<h3 className="text-[17px] font-bold text-gray-900 mb-2">No workspaces yet</h3>
									<p className="text-[14px] text-gray-500 mb-6 max-w-sm mx-auto">
										Create your first workspace to start collaborating with your team
									</p>
									<button
										type="button"
										onClick={() => setIsCreateModalOpen(true)}
										className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md"
									>
										<Plus className="w-4 h-4" />
										Create Workspace
									</button>
								</div>
							) : filteredWorkspaces.length === 0 ? (
								<div className={`${CARD} p-16 text-center`}>
									<Search className="w-10 h-10 text-gray-300 mx-auto mb-4" />
									<h3 className="text-[15px] font-semibold text-gray-500">No results</h3>
									<p className="text-[13px] text-gray-400 mt-1">
										No workspaces match &quot;{searchQuery}&quot;
									</p>
								</div>
							) : (
								<AnimatePresence mode="wait">
									<motion.div
										key={view}
										initial={{ opacity: 0, y: 6 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -6 }}
										transition={{ duration: 0.15 }}
										className={
											view === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-3"
										}
									>
										{filteredWorkspaces.map((workspace, index) => (
											<motion.div
												key={workspace.id}
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: index * 0.05 }}
											>
												{/* biome-ignore lint/a11y/useSemanticElements: complex card */}
												<div
													role="button"
													tabIndex={0}
													onKeyDown={(e) => {
														if (e.key === "Enter" || e.key === " ") {
															e.preventDefault();
															setActiveWorkspace(workspace.id, workspace.name);
															setChannels([]);
															router.push("/dashboard");
														}
													}}
													onClick={() => {
														setActiveWorkspace(workspace.id, workspace.name);
														setChannels([]);
														router.push("/dashboard");
													}}
													className={`group ${CARD} cursor-pointer hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:border-gray-200 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/30 ${
														view === "grid" ? "p-6" : "p-5 flex items-center justify-between gap-6"
													}`}
												>
													<div
														className={`flex items-start ${
															view === "grid" ? "justify-between mb-5 w-full" : "gap-4 items-center"
														}`}
													>
														<div className="flex items-center gap-4">
															<div
																className={`rounded-[16px] bg-gradient-to-br ${
																	WORKSPACE_GRADIENTS[index % WORKSPACE_GRADIENTS.length]
																} flex items-center justify-center text-white font-bold shadow-lg ${
																	view === "grid" ? "w-14 h-14 text-xl" : "w-11 h-11 text-base"
																}`}
															>
																{workspace.name.charAt(0).toUpperCase()}
															</div>
															<div>
																<h3 className="text-[15px] font-bold text-gray-900 group-hover:text-[#007AFF] transition-colors">
																	{workspace.name}
																</h3>
																<p className="text-[12px] text-gray-400 mt-0.5">
																	{workspace.slug}.teamup.app
																</p>
															</div>
														</div>
														{view === "grid" && (
															<button
																type="button"
																onClick={(e) => {
																	e.preventDefault();
																	e.stopPropagation();
																	setInviteWorkspace({
																		id: workspace.id,
																		name: workspace.name,
																	});
																}}
																className="p-2 rounded-xl text-gray-300 hover:text-[#007AFF] hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100"
																title="Invite members"
															>
																<Link2 className="w-4 h-4" />
															</button>
														)}
													</div>

													<div
														className={
															view === "grid"
																? "grid grid-cols-2 gap-4"
																: "flex flex-1 items-center justify-end gap-8"
														}
													>
														<div className="flex items-center gap-2.5">
															<div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
																<Users className="w-3.5 h-3.5 text-[#007AFF]" />
															</div>
															<div>
																<span className="text-[14px] font-bold text-gray-900">
																	{workspace.members?.length ?? 0}
																</span>{" "}
																<span className="text-[12px] text-gray-400">members</span>
															</div>
														</div>
														<div className="flex items-center gap-2.5">
															<div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
																<Hash className="w-3.5 h-3.5 text-[#34C759]" />
															</div>
															<div>
																<span className="text-[14px] font-bold text-gray-900">
																	{workspace.channels?.filter((c) => c.type !== "DIRECT_MESSAGE")
																		.length ?? 0}
																</span>{" "}
																<span className="text-[12px] text-gray-400">channels</span>
															</div>
														</div>
													</div>

													{view === "grid" && (
														<div className="mt-5 pt-4 border-t border-gray-100/60 flex items-center justify-between text-[12px]">
															<span className="text-gray-400">Created</span>
															<span className="flex items-center gap-1.5 text-gray-500 font-medium">
																<Clock className="w-3.5 h-3.5 text-[#007AFF]" />
																{new Date(workspace.createdAt).toLocaleDateString("en-US", {
																	month: "short",
																	day: "numeric",
																	year: "numeric",
																})}
															</span>
														</div>
													)}

													{view === "list" && (
														<div className="flex items-center gap-1.5 text-[12px] text-gray-400 w-32 justify-end shrink-0">
															<Clock className="w-3.5 h-3.5 text-[#007AFF]" />
															{new Date(workspace.createdAt).toLocaleDateString("en-US", {
																month: "short",
																day: "numeric",
															})}
														</div>
													)}
												</div>
											</motion.div>
										))}

										{/* Create Card */}
										<button
											type="button"
											onClick={() => setIsCreateModalOpen(true)}
											className={`group border-2 border-dashed border-gray-200 rounded-[24px] hover:border-[#007AFF]/30 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center text-gray-400 hover:text-[#007AFF] ${
												view === "grid" ? "min-h-[200px]" : "p-5 min-h-[72px]"
											}`}
										>
											<div
												className={`flex items-center justify-center gap-3 ${
													view === "grid" ? "flex-col" : "flex-row w-full"
												}`}
											>
												<div className="w-11 h-11 rounded-[14px] bg-white border border-gray-200 flex items-center justify-center group-hover:bg-[#007AFF] group-hover:text-white group-hover:border-[#007AFF] transition-all shadow-sm">
													<Plus className="w-5 h-5" />
												</div>
												<span className="font-semibold text-[14px]">Create Workspace</span>
											</div>
										</button>
									</motion.div>
								</AnimatePresence>
							)}
						</div>

						{/* ──── Sidebar Stats ──── */}
						<div className="lg:col-span-1 space-y-4">
							<div className={`${CARD} p-6`}>
								<h3 className="text-[14px] font-bold text-gray-900 tracking-tight mb-5">
									Overview
								</h3>
								<div className="space-y-5">
									{[
										{
											icon: LayoutGrid,
											label: "Workspaces",
											value: String(workspaces?.length ?? 0),
											color: "#007AFF",
											bg: "bg-blue-50",
										},
										{
											icon: Hash,
											label: "Channels",
											value: String(totalChannels),
											color: "#34C759",
											bg: "bg-green-50",
										},
										{
											icon: Users,
											label: "Members",
											value: String(totalMembers),
											color: "#FF9500",
											bg: "bg-orange-50",
										},
									].map((item) => (
										<div key={item.label} className="flex items-center gap-3">
											<div
												className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center`}
											>
												<item.icon className="w-4 h-4" style={{ color: item.color }} />
											</div>
											<div className="flex-1">
												<div className="text-[12px] text-gray-500 font-medium">{item.label}</div>
												<div className="text-[18px] font-bold text-gray-900 leading-tight">
													{item.value}
												</div>
											</div>
										</div>
									))}
								</div>
							</div>

							<div className={`${CARD} p-6`}>
								<h3 className="text-[14px] font-bold text-gray-900 tracking-tight mb-4">Account</h3>
								<div className="flex items-center gap-3">
									<Avatar className="w-10 h-10 shadow-sm">
										<AvatarImage
											src={user?.user_metadata?.avatar_url || user?.user_metadata?.picture}
											alt={userName}
											referrerPolicy="no-referrer"
										/>
										<AvatarFallback className="bg-gradient-to-tr from-blue-500 to-indigo-500 text-white text-[12px] font-bold">
											{userInitials}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 min-w-0">
										<div className="text-[13px] font-semibold text-gray-900 truncate">
											{userName}
										</div>
										<div className="text-[12px] text-gray-400 truncate">{user?.email}</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</motion.div>
			</main>

			<CreateWorkspaceDialog
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				onCreateSuccess={(newWorkspace) => {
					refetch();
					if (newWorkspace) {
						setActiveWorkspace(newWorkspace.id, newWorkspace.name);
					}
				}}
				token={token}
			/>

			{inviteWorkspace && (
				<InviteMembersDialog
					isOpen={!!inviteWorkspace}
					onClose={() => setInviteWorkspace(null)}
					workspaceId={inviteWorkspace.id}
					workspaceName={inviteWorkspace.name}
					userId={user?.id ?? ""}
				/>
			)}
		</div>
	);
}
