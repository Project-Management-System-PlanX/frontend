"use client";

import { motion } from "framer-motion";
import {
	Bell,
	CheckCircle2,
	Clock,
	LayoutGrid,
	List,
	MoreHorizontal,
	Plus,
	Search,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CreateWorkspaceDialog } from "@/components/workspaces/CreateWorkspaceDialog";

const initialWorkspaces = [
	{
		id: 1,
		name: "Engineering Team",
		slug: "engineering",
		plan: "PRO",
		members: 12,
		activeTasks: 34,
		lastActive: "2 min ago",
		color: "bg-blue-500",
		initial: "E",
	},
	{
		id: 2,
		name: "Product Design",
		slug: "product-design",
		plan: "TEAM",
		members: 8,
		activeTasks: 15,
		lastActive: "10 min ago",
		color: "bg-purple-500",
		initial: "P",
	},
	{
		id: 3,
		name: "Marketing Campaign",
		slug: "marketing",
		plan: "FREE",
		members: 5,
		activeTasks: 8,
		lastActive: "1h ago",
		color: "bg-orange-500",
		initial: "M",
	},
];

export default function WorkspacesPage() {
	const [view, setView] = useState<"grid" | "list">("grid");
	const [workspaces, setWorkspaces] = useState(initialWorkspaces);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	return (
		<div
			className="min-h-screen bg-[#F8FCFA] text-black selection:bg-[#D1F2EB] selection:text-[#013220]"
			style={{ fontFamily: "Figtree, sans-serif" }}
		>
			<header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#D1F2EB]">
				<div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Link href="/" className="flex items-center gap-2">
							{/* TeamUp Logo Icon */}
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
						<div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#50C878] to-[#0B6E4F] ring-2 ring-white shadow-sm flex items-center justify-center text-white font-medium text-sm">
							RJ
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
					{/* Header Actions */}
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
						{/* Workspaces List/Grid */}
						<div className="lg:col-span-3">
							<div
								className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}
							>
								{workspaces.map((workspace) => (
									<Link
										key={workspace.id}
										href="/dashboard"
										className={`group block bg-white border border-[#D1F2EB] rounded-xl hover:border-[#50C878] transition-all shadow-sm hover:shadow-md hover:shadow-[#50C878]/5 ${
											view === "grid" ? "p-5" : "p-4 flex items-center justify-between gap-6"
										}`}
									>
										<div
											className={`flex items-start ${view === "grid" ? "justify-between mb-4 w-full" : "gap-4 items-center"}`}
										>
											<div className="flex items-center gap-3">
												<div
													className={`rounded-xl ${
														workspace.color
													} flex items-center justify-center text-white font-bold shadow-sm ${
														view === "grid" ? "w-12 h-12 text-lg" : "w-10 h-10 text-base"
													}`}
												>
													{workspace.initial}
												</div>
												<div>
													<h3 className="text-base font-bold text-black group-hover:text-[#0B6E4F] transition-colors">
														{workspace.name}
													</h3>
													<div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
														<span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium border border-gray-200">
															{workspace.plan}
														</span>
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
													className="text-gray-400 hover:text-[#0B6E4F] p-1 rounded hover:bg-[#D1F2EB]/30 transition-colors"
												>
													<MoreHorizontal className="w-5 h-5" />
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
													<span className="font-semibold text-black">{workspace.members}</span>{" "}
													<span className="text-gray-500 text-xs">members</span>
												</div>
											</div>
											<div className="flex items-center gap-2">
												<CheckCircle2 className="w-4 h-4 text-gray-400" />
												<div className="text-sm">
													<span className="font-semibold text-black">{workspace.activeTasks}</span>{" "}
													<span className="text-gray-500 text-xs">active tasks</span>
												</div>
											</div>
											{view === "list" && (
												<div className="flex items-center gap-1.5 text-xs text-gray-500 w-32 justify-end">
													<Clock className="w-3.5 h-3.5 text-[#50C878]" />
													{workspace.lastActive}
												</div>
											)}
										</div>

										{view === "grid" && (
											<div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
												<span className="text-gray-400">Activity</span>
												<span className="flex items-center gap-1.5 text-gray-600 font-medium">
													<Clock className="w-3.5 h-3.5 text-[#50C878]" />
													active {workspace.lastActive}
												</span>
											</div>
										)}
									</Link>
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
						</div>

						{/* Sidebar Stats */}
						<div className="lg:col-span-1 space-y-6">
							<div className="bg-white border border-[#D1F2EB] rounded-xl p-5 shadow-sm">
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-sm font-bold text-black">Productivity</h3>
									<span className="text-xs text-gray-500">This Month</span>
								</div>

								<div className="space-y-4">
									{[
										{ label: "Tasks Completed", value: "142", total: "150", percent: 94 },
										{
											label: "On-time Delivery",
											value: "98%",
											total: "100%",
											percent: 98,
										},
										{ label: "Team Velocity", value: "42 pts", total: "50", percent: 84 },
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

								<button
									type="button"
									className="w-full mt-5 text-xs font-semibold text-[#0B6E4F] py-2 bg-[#F8FCFA] hover:bg-[#D1F2EB]/50 rounded-lg border border-[#D1F2EB] transition-colors"
								>
									View Full Report
								</button>
							</div>

							<div className="bg-white border border-[#D1F2EB] rounded-xl p-5 shadow-sm">
								<h3 className="text-sm font-bold text-black mb-4">Recent Updates</h3>
								<div className="space-y-4">
									{[
										{
											user: "Sarah Chen",
											action: "commented on",
											target: "Q3 Roadmap",
											time: "2h ago",
										},
										{
											user: "Alex Morgan",
											action: "completed",
											target: "Homepage Redesign",
											time: "4h ago",
										},
										{
											user: "You",
											action: "invited",
											target: "Mike Ross",
											time: "1d ago",
										},
									].map((activity, i) => (
										// biome-ignore lint/suspicious/noArrayIndexKey: Index is stable here for static list
										<div key={i} className="flex gap-3 text-xs">
											<div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200 font-medium text-gray-600">
												{activity.user.charAt(0)}
											</div>
											<div className="text-gray-600 leading-relaxed">
												<span className="font-semibold text-black">{activity.user}</span>{" "}
												{activity.action}{" "}
												<span className="font-medium text-black">{activity.target}</span>
												<div className="text-gray-400 mt-0.5">{activity.time}</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</motion.div>
			</main>

			<CreateWorkspaceDialog
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				onCreate={(name) => {
					setWorkspaces([
						...workspaces,
						{
							id: workspaces.length + 1,
							name,
							slug: name.toLowerCase().replace(/\s+/g, "-"),
							plan: "FREE",
							members: 1,
							activeTasks: 0,
							lastActive: "just now",
							color: "bg-[#0B6E4F]",
							initial: name.charAt(0).toUpperCase(),
						},
					]);
				}}
			/>
		</div>
	);
}
