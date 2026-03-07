"use client";

import { ArrowRight, CheckSquare, Clock, FileText, MessageSquare, Users } from "lucide-react";
import Link from "next/link";
import { useWorkspaceAnalytics } from "@/hooks/api/use-workspaces";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useWorkspaceStore } from "@/stores/workspace-store";

/* ═══════════════════════════════════════════════
   Main Dashboard Component
   ═══════════════════════════════════════════════ */

export function DashboardHome() {
	const { token } = useSupabaseAuth();
	const { activeWorkspaceId } = useWorkspaceStore();

	const { data: analytics } = useWorkspaceAnalytics(activeWorkspaceId ?? "", token ?? undefined);

	const now = new Date();
	const greeting =
		now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

	// We calculate a max value for the weekly chart so height represents percentage
	const maxMessages = Math.max(...(analytics?.weeklyActivity.map((w) => w.count) || [0]), 10);

	return (
		<div
			className="flex-1 flex flex-col bg-slate-50 min-w-0 min-h-0 overflow-hidden"
			style={{ fontFamily: "var(--font-figtree), Figtree" }}
		>
			{/* ──── Header ──── */}
			<div className="px-8 pt-7 pb-5 bg-white border-b border-slate-200 shrink-0">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold text-slate-900">{greeting}</h1>
						<p className="text-sm text-slate-500 mt-1">
							Here&apos;s what&apos;s happening across your workspace today
						</p>
					</div>
				</div>
			</div>

			{/* ──── Content ──── */}
			<div className="flex-1 overflow-y-auto min-h-0">
				<div className="p-8 space-y-7 max-w-[1400px]">
					{/* ──── Stat Cards ──── */}
					<div className="grid grid-cols-4 gap-4">
						{[
							{
								label: "Total Messages",
								value: analytics?.totalMessages,
								icon: MessageSquare,
								color: "#0B6E4F",
								bg: "bg-emerald-50",
							},
							{
								label: "Active Tasks",
								value: analytics?.activeTasks,
								icon: CheckSquare,
								color: "#3B82F6",
								bg: "bg-blue-50",
							},
							{
								label: "Team Members",
								value: analytics?.teamMembers,
								icon: Users,
								color: "#8B5CF6",
								bg: "bg-violet-50",
							},
							{
								label: "Files Shared",
								value: analytics?.filesShared,
								icon: FileText,
								color: "#F59E0B",
								bg: "bg-amber-50",
							},
						].map((stat) => {
							const Icon = stat.icon;
							return (
								<div
									key={stat.label}
									className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group cursor-pointer"
								>
									<div className="flex items-center justify-between mb-3">
										<div
											className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}
										>
											<Icon className="w-5 h-5" style={{ color: stat.color }} />
										</div>
									</div>
									<p className="text-[28px] font-bold text-slate-900 leading-none mb-1">
										{stat.value === undefined ? (
											<span className="inline-block w-10 h-8 rounded-md bg-slate-100 animate-pulse" />
										) : (
											stat.value
										)}
									</p>
									<p className="text-xs text-slate-500 font-medium">{stat.label}</p>
								</div>
							);
						})}
					</div>

					{/* ──── Charts Row ──── */}
					<div className="grid grid-cols-5 gap-5">
						{/* Task Overview */}
						<div className="col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
							<h3 className="text-sm font-bold text-slate-800 mb-5">Task Overview</h3>
							{analytics ? (
								<div className="flex-1 flex flex-col justify-center">
									<div className="flex items-center gap-6">
										{/* Simple Pie Chart Representation using standard div arcs */}
										<div
											className="w-24 h-24 rounded-full relative shrink-0"
											style={{
												background: `conic-gradient(#10B981 ${
													(analytics.completedTasks /
														(analytics.activeTasks + analytics.completedTasks || 1)) *
													360
												}deg, #E2E8F0 0)`,
											}}
										>
											<div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
												<span className="text-sm font-bold text-slate-700">
													{Math.round(
														(analytics.completedTasks /
															(analytics.activeTasks + analytics.completedTasks || 1)) *
															100,
													)}
													%
												</span>
											</div>
										</div>
										<div className="flex-1 space-y-4">
											<div>
												<div className="flex items-center justify-between text-xs font-semibold mb-1">
													<div className="flex items-center gap-2">
														<span className="w-2 h-2 rounded-full bg-slate-200" />
														<span className="text-slate-600">Active</span>
													</div>
													<span className="text-slate-900">{analytics.activeTasks}</span>
												</div>
											</div>
											<div>
												<div className="flex items-center justify-between text-xs font-semibold mb-1">
													<div className="flex items-center gap-2">
														<span className="w-2 h-2 rounded-full bg-emerald-500" />
														<span className="text-slate-600">Completed</span>
													</div>
													<span className="text-slate-900">{analytics.completedTasks}</span>
												</div>
											</div>
										</div>
									</div>
								</div>
							) : (
								<div className="flex-1 flex flex-col items-center justify-center text-slate-400 min-h-[140px]">
									<div className="w-8 h-8 border-2 border-slate-200 border-t-emerald-500 rounded-full animate-spin mb-3" />
								</div>
							)}
						</div>

						{/* Weekly Activity */}
						<div className="col-span-3 bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
							<h3 className="text-sm font-bold text-slate-800 mb-1">Weekly Activity</h3>
							<p className="text-xs text-slate-500 mb-6">Messages sent per day (Last 7 days)</p>
							{analytics ? (
								<div className="flex-1 flex items-end justify-between gap-2 h-[120px] pb-5 border-b border-slate-100 px-2 relative">
									{analytics.weeklyActivity.map((day, _idx) => {
										const heightPct = Math.max((day.count / maxMessages) * 100, 4); // min 4% to show something
										return (
											<div key={day.day} className="flex flex-col items-center flex-1 group">
												<div
													className="w-full max-w-[32px] bg-emerald-100 group-hover:bg-emerald-200 rounded-t-sm relative transition-all duration-300 flex justify-center"
													style={{ height: `${heightPct}%` }}
												>
													<span className="absolute -top-6 opacity-0 group-hover:opacity-100 text-[10px] font-bold text-slate-700 transition-opacity">
														{day.count}
													</span>
													<div
														className="absolute bottom-0 w-full bg-emerald-500 rounded-t-sm transition-all duration-500"
														style={{ height: `${Math.min(heightPct, 100)}%` }}
													/>
												</div>
												<span className="absolute bottom-[-24px] text-[10px] font-medium text-slate-400 uppercase">
													{day.day}
												</span>
											</div>
										);
									})}
								</div>
							) : (
								<div className="flex-1 flex items-center justify-center min-h-[140px]">
									<div className="w-8 h-8 rounded-md bg-slate-100 animate-pulse" />
								</div>
							)}
						</div>
					</div>

					{/* ──── Middle Row: Active Channels + Deadlines ──── */}
					<div className="grid grid-cols-5 gap-5">
						<div className="col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
							<div className="flex items-center justify-between mb-5">
								<h3 className="text-sm font-bold text-slate-800">Top Active Channels</h3>
								<Link
									href="/dashboard/chat"
									className="text-xs text-[#0B6E4F] font-semibold hover:underline flex items-center gap-1"
								>
									View All <ArrowRight className="w-3 h-3" />
								</Link>
							</div>
							<div className="flex-1 space-y-3">
								{!analytics ? (
									[1, 2, 3].map((i) => (
										<div key={i} className="h-10 bg-slate-50 rounded-lg animate-pulse" />
									))
								) : analytics.activeChannels.length === 0 ? (
									<div className="py-8 text-center text-slate-400">
										<p className="text-sm">No channels exist yet.</p>
									</div>
								) : (
									analytics.activeChannels.map((c) => (
										<Link
											key={c.id}
											href={`/dashboard/chat/channel/${c.id}`}
											className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors group"
										>
											<div className="flex items-center gap-3">
												<div className="w-8 h-8 rounded bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-sm">
													#
												</div>
												<p className="text-sm font-semibold text-slate-700 group-hover:text-emerald-700">
													{c.name}
												</p>
											</div>
											<div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
												<MessageSquare className="w-3 h-3" /> {c._count.messages}
											</div>
										</Link>
									))
								)}
							</div>
						</div>

						<div className="col-span-3 bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
							<div className="flex items-center justify-between mb-5">
								<h3 className="text-sm font-bold text-slate-800">Upcoming Deadlines</h3>
								<Clock className="w-4 h-4 text-slate-400" />
							</div>
							<div className="flex-1 space-y-2">
								{!analytics ? (
									[1, 2, 3].map((i) => (
										<div key={i} className="h-14 bg-slate-50 rounded-lg animate-pulse" />
									))
								) : analytics.upcomingDeadlines.length === 0 ? (
									<div className="flex flex-col items-center justify-center py-6 text-slate-400">
										<CheckSquare className="w-10 h-10 mb-3 text-slate-200" />
										<p className="text-sm">You are all caught up!</p>
										<p className="text-xs">No impending deadlines found.</p>
									</div>
								) : (
									analytics.upcomingDeadlines.map((t) => {
										const due = new Date(t.dueDate);
										const isOverdue = due < new Date();
										return (
											<div
												key={t.id}
												className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-300 hover:shadow-sm transition-all bg-white"
											>
												<div className="flex items-start gap-3">
													<div
														className={`mt-0.5 w-2 h-2 rounded-full ${isOverdue ? "bg-red-500" : "bg-amber-400"}`}
													/>
													<div>
														<p className="text-sm font-semibold text-slate-800 line-clamp-1">
															{t.title}
														</p>
														<p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mt-1">
															{t.space.prefix}
														</p>
													</div>
												</div>
												<div
													className={`text-xs font-semibold px-2 py-1 rounded ${isOverdue ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-600"}`}
												>
													{due.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
												</div>
											</div>
										);
									})
								)}
							</div>
						</div>
					</div>

					{/* ──── Bottom Row: Recent Activity ──── */}
					<div className="grid grid-cols-1">
						<div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
							<h3 className="text-sm font-bold text-slate-800 mb-5">Recent Activity Feed</h3>
							<div className="space-y-4">
								{!analytics ? (
									[1, 2].map((i) => (
										<div key={i} className="h-12 bg-slate-50 rounded-lg animate-pulse" />
									))
								) : analytics.recentActivity.length === 0 ? (
									<div className="py-6 text-center text-slate-400 text-sm">
										No recent messages to display.
									</div>
								) : (
									analytics.recentActivity.map((msg) => (
										<div key={msg.id} className="flex items-start gap-3">
											<div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
												{(msg.user.firstName || msg.user.email)[0].toUpperCase()}
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-xs text-slate-500 mb-0.5">
													<span className="font-bold text-slate-800">
														{msg.user.firstName || msg.user.email.split("@")[0]}
													</span>{" "}
													posted in{" "}
													{msg.channel.type === "DIRECT_MESSAGE" ? (
														<span className="font-bold text-violet-600">a Direct Message</span>
													) : (
														<span className="font-bold text-[#0B6E4F]">#{msg.channel.name}</span>
													)}
												</p>
												<p className="text-sm text-slate-700 truncate">{msg.content}</p>
											</div>
											<span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
												{new Date(msg.createdAt).toLocaleTimeString([], {
													hour: "2-digit",
													minute: "2-digit",
												})}
											</span>
										</div>
									))
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
