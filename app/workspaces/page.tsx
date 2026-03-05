"use client";

import { motion } from "framer-motion";
import {
	Bell,
	CheckCircle2,
	Clock,
	LayoutGrid,
	Link2,
	List,
	LogOut,
	Plus,
	Search,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreateWorkspaceDialog } from "@/components/workspaces/CreateWorkspaceDialog";
import { InviteMembersDialog } from "@/components/workspaces/InviteMembersDialog";
import { useWorkspaces } from "@/hooks/api";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useChannelStore } from "@/stores/channel-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

const WORKSPACE_COLORS = [
	"bg-blue-500",
	"bg-purple-500",
	"bg-orange-500",
	"bg-[#0B6E4F]",
	"bg-pink-500",
	"bg-teal-500",
	"bg-indigo-500",
	"bg-amber-500",
];

export default function WorkspacesPage() {
	const [view, setView] = useState<"grid" | "list">("grid");
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [inviteWorkspace, setInviteWorkspace] = useState<{ id: string; name: string } | null>(null);
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
		router.push("/onboarding");
	};

	const userInitials = user?.email ? user.email.substring(0, 2).toUpperCase() : "?";

	return (
		<div
			className="min-h-screen bg-[#F8FCFA] text-black selection:bg-[#D1F2EB] selection:text-[#013220]"
			style={{ fontFamily: "Figtree, sans-serif" }}
		>
			<header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#D1F2EB]">
				<div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Link href="/" className="flex items-center gap-2">
							<div className="w-8 h-8 rounded-lg bg-[#0B6E4F] flex items-center justify-center">
								<span className="text-white font-bold text-lg">T</span>
							</div>
							<span className="font-bold text-xl tracking-tight text-black">TeamUp</span>
						</Link>
					</div>

					<div className="flex items-center gap-4">
						<div className="relative group hidden sm:block">
							<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-[#0B6E4F] transition-colors" />
							<input
								type="text"
								placeholder="Search..."
								className="w-64 h-9 pl-9 pr-4 bg-gray-50 border border-[#D1F2EB] rounded-lg text-sm text-black placeholder:text-gray-400 focus:bg-white focus:border-[#50C878] focus:ring-2 focus:ring-[#D1F2EB] transition-all outline-none"
							/>
						</div>
						<button
							type="button"
							className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-[#0B6E4F] hover:bg-[#D1F2EB]/50 rounded-full transition-colors relative"
						>
							<Bell className="w-5 h-5" />
							<span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
						</button>
						<button
							type="button"
							onClick={handleSignOut}
							className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
							title="Sign Out"
						>
							<LogOut className="w-4 h-4" />
						</button>
						<div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#50C878] to-[#0B6E4F] ring-2 ring-white shadow-sm flex items-center justify-center text-white font-medium text-sm">
							{userInitials}
						</div>
					</div>
				</div>
			</header>

			<main className="max-w-[1400px] mx-auto px-4 py-8">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.35, ease: "easeOut" }}
				>
					<div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
						<div>
							<h1 className="text-2xl font-bold text-black mb-1">Your Workspaces</h1>
							<p className="text-gray-500 text-sm">Manage your teams and current projects</p>
						</div>

						<div className="flex items-center gap-3">
							<div className="h-10 flex p-1 bg-white border border-[#D1F2EB] rounded-lg shadow-sm">
								<button
									type="button"
									onClick={() => setView("grid")}
									className={`w-8 flex items-center justify-center rounded transition-colors ${
										view === "grid"
											? "bg-[#D1F2EB] text-[#0B6E4F]"
											: "text-gray-400 hover:text-black"
									}`}
								>
									<LayoutGrid className="w-4 h-4" />
								</button>
								<button
									type="button"
									onClick={() => setView("list")}
									className={`w-8 flex items-center justify-center rounded transition-colors ${
										view === "list"
											? "bg-[#D1F2EB] text-[#0B6E4F]"
											: "text-gray-400 hover:text-black"
									}`}
								>
									<List className="w-4 h-4" />
								</button>
							</div>
							<button
								type="button"
								onClick={() => setIsCreateModalOpen(true)}
								className="h-10 px-4 flex items-center gap-2 bg-[#0B6E4F] hover:bg-[#0B6E4F]/90 text-white font-medium rounded-lg transition-colors shadow-sm"
							>
								<Plus className="w-4 h-4" />
								<span className="hidden sm:inline">New Workspace</span>
							</button>
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
						<div className="lg:col-span-3">
							{isLoading ? (
								<div className="flex items-center justify-center py-20">
									<div className="animate-spin w-8 h-8 border-2 border-[#0B6E4F] border-t-transparent rounded-full" />
								</div>
							) : !workspaces || workspaces.length === 0 ? (
								<div className="text-center py-20">
									<div className="w-16 h-16 mx-auto bg-[#D1F2EB] rounded-2xl flex items-center justify-center mb-4">
										<Users className="w-8 h-8 text-[#0B6E4F]" />
									</div>
									<h3 className="text-lg font-bold text-black mb-2">No workspaces yet</h3>
									<p className="text-gray-500 text-sm mb-6">
										Create your first workspace to get started
									</p>
									<button
										type="button"
										onClick={() => setIsCreateModalOpen(true)}
										className="inline-flex items-center gap-2 bg-[#0B6E4F] hover:bg-[#0B6E4F]/90 text-white font-medium px-6 py-3 rounded-lg transition-colors"
									>
										<Plus className="w-4 h-4" />
										Create Workspace
									</button>
								</div>
							) : (
								<div
									className={
										view === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"
									}
								>
									{workspaces.map((workspace, index) => (
										<button
											key={workspace.id}
											type="button"
											onClick={() => {
												setActiveWorkspace(workspace.id, workspace.name);
												setChannels([]); // Clear stale channels so they reload for the new workspace
												router.push("/dashboard");
											}}
											className={`group block cursor-pointer bg-white border border-[#D1F2EB] rounded-xl hover:border-[#50C878] transition-all shadow-sm hover:shadow-md hover:shadow-[#50C878]/5 text-left ${
												view === "grid" ? "p-5" : "p-4 flex items-center justify-between gap-6"
											}`}
										>
											<div
												className={`flex items-start ${view === "grid" ? "justify-between mb-4 w-full" : "gap-4 items-center"}`}
											>
												<div className="flex items-center gap-3">
													<div
														className={`rounded-xl ${
															WORKSPACE_COLORS[index % WORKSPACE_COLORS.length]
														} flex items-center justify-center text-white font-bold shadow-sm ${
															view === "grid" ? "w-12 h-12 text-lg" : "w-10 h-10 text-base"
														}`}
													>
														{workspace.name.charAt(0).toUpperCase()}
													</div>
													<div>
														<h3 className="text-base font-bold text-black group-hover:text-[#0B6E4F] transition-colors">
															{workspace.name}
														</h3>
														<div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
															{view === "grid" && (
																<>
																	<span>•</span>
																	<span className="hover:text-black transition-colors">
																		{workspace.slug}.teamup.app
																	</span>
																</>
															)}
														</div>
													</div>
												</div>
												{view === "grid" && (
													<button
														type="button"
														onClick={(e) => {
															e.preventDefault();
															e.stopPropagation();
															setInviteWorkspace({ id: workspace.id, name: workspace.name });
														}}
														className="text-gray-400 hover:text-[#0B6E4F] p-1.5 rounded-lg hover:bg-[#D1F2EB]/30 transition-colors"
														title="Invite members"
													>
														<Link2 className="w-4 h-4" />
													</button>
												)}
											</div>

											<div
												className={
													view === "grid"
														? "grid grid-cols-2 gap-4 pt-2"
														: "flex flex-1 items-center justify-end gap-8"
												}
											>
												<div className="flex items-center gap-2">
													<Users className="w-4 h-4 text-gray-400" />
													<div className="text-sm">
														<span className="font-semibold text-black">
															{workspace.members?.length ?? 0}
														</span>{" "}
														<span className="text-gray-500 text-xs">members</span>
													</div>
												</div>
												<div className="flex items-center gap-2">
													<CheckCircle2 className="w-4 h-4 text-gray-400" />
													<div className="text-sm">
														<span className="font-semibold text-black">
															{workspace.channels?.filter((c) => c.type !== "DIRECT_MESSAGE")
																.length ?? 0}
														</span>{" "}
														<span className="text-gray-500 text-xs">channels</span>
													</div>
												</div>
												{view === "list" && (
													<div className="flex items-center gap-1.5 text-xs text-gray-500 w-32 justify-end">
														<Clock className="w-3.5 h-3.5 text-[#50C878]" />
														{new Date(workspace.createdAt).toLocaleDateString()}
													</div>
												)}
											</div>

											{view === "grid" && (
												<div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
													<span className="text-gray-400">Created</span>
													<span className="flex items-center gap-1.5 text-gray-600 font-medium">
														<Clock className="w-3.5 h-3.5 text-[#50C878]" />
														{new Date(workspace.createdAt).toLocaleDateString()}
													</span>
												</div>
											)}
										</button>
									))}

									<button
										type="button"
										onClick={() => setIsCreateModalOpen(true)}
										className={`group border-2 border-dashed border-[#D1F2EB] rounded-xl hover:border-[#50C878] hover:bg-[#D1F2EB]/10 transition-all flex flex-col items-center justify-center text-gray-400 hover:text-[#0B6E4F] ${
											view === "grid" ? "min-h-[160px]" : "p-4 min-h-[72px]"
										}`}
									>
										<div
											className={`flex items-center justify-center gap-3 ${view === "grid" ? "flex-col" : "flex-row w-full"}`}
										>
											<div className="w-10 h-10 rounded-full bg-white border border-[#D1F2EB] flex items-center justify-center group-hover:bg-[#0B6E4F] group-hover:text-white group-hover:border-[#0B6E4F] transition-all shadow-sm">
												<Plus className="w-5 h-5" />
											</div>
											<span className="font-medium text-sm">Create Workspace</span>
										</div>
									</button>
								</div>
							)}
						</div>

						{/* Sidebar Stats */}
						<div className="lg:col-span-1 space-y-6">
							<div className="bg-white border border-[#D1F2EB] rounded-xl p-5 shadow-sm">
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-sm font-bold text-black">Overview</h3>
								</div>
								<div className="space-y-4">
									{[
										{
											label: "Total Workspaces",
											value: String(workspaces?.length ?? 0),
											percent: 100,
										},
										{
											label: "Total Channels",
											value: String(
												workspaces?.reduce(
													(acc, ws) =>
														acc +
														(ws.channels?.filter((c) => c.type !== "DIRECT_MESSAGE").length ?? 0),
													0,
												) ?? 0,
											),
											percent: 70,
										},
										{
											label: "Total Members",
											value: String(
												workspaces?.reduce((acc, ws) => acc + (ws.members?.length ?? 0), 0) ?? 0,
											),
											percent: 85,
										},
									].map((item) => (
										<div key={item.label} className="group">
											<div className="flex items-center justify-between text-xs mb-1.5">
												<span className="text-gray-600 font-medium">{item.label}</span>
												<span className="text-gray-500 font-medium">{item.value}</span>
											</div>
											<div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
												<div
													className="h-full bg-[#50C878] rounded-full"
													style={{ width: `${item.percent}%` }}
												/>
											</div>
										</div>
									))}
								</div>
							</div>

							<div className="bg-white border border-[#D1F2EB] rounded-xl p-5 shadow-sm">
								<h3 className="text-sm font-bold text-black mb-4">Account</h3>
								<div className="space-y-3 text-sm">
									<div className="flex items-center gap-2 text-gray-600">
										<div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#50C878] to-[#0B6E4F] flex items-center justify-center text-white text-xs font-medium">
											{userInitials}
										</div>
										<span className="truncate text-xs">{user?.email}</span>
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
