"use client";

import {
	ArrowRight,
	BarChart3,
	CheckSquare,
	Clock,
	FileText,
	Hash,
	MessageSquare,
	Users,
} from "lucide-react";
import Link from "next/link";

/* ═══════════════════════════════════════════════
   Main Dashboard Component
   ═══════════════════════════════════════════════ */

export function DashboardHome() {
	const now = new Date();
	const greeting =
		now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

	return (
		<div
			className="flex-1 flex flex-col bg-white min-w-0 min-h-0 overflow-hidden"
			style={{ fontFamily: "var(--font-figtree), Figtree" }}
		>
			{/* ──── Header ──── */}
			<div className="px-8 pt-7 pb-5 border-b border-slate-100 shrink-0">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold text-slate-900">{greeting}</h1>
						<p className="text-sm text-slate-400 mt-1">
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
							{ label: "Total Messages", icon: MessageSquare, color: "#0B6E4F", bg: "bg-emerald-50" },
							{ label: "Active Tasks", icon: CheckSquare, color: "#3B82F6", bg: "bg-blue-50" },
							{ label: "Team Members", icon: Users, color: "#8B5CF6", bg: "bg-violet-50" },
							{ label: "Files Shared", icon: FileText, color: "#F59E0B", bg: "bg-amber-50" },
						].map((stat) => {
							const Icon = stat.icon;
							return (
								<div
									key={stat.label}
									className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 hover:shadow-lg hover:border-slate-300 transition-all group cursor-pointer"
								>
									<div className="flex items-center justify-between mb-3">
										<div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
											<Icon className="w-5 h-5" style={{ color: stat.color }} />
										</div>
									</div>
									<p className="text-[28px] font-bold text-slate-900 leading-none mb-1">0</p>
									<p className="text-xs text-slate-400 font-medium">{stat.label}</p>
								</div>
							);
						})}
					</div>

					{/* ──── Charts Row ──── */}
					<div className="grid grid-cols-5 gap-5">
						{/* Task Overview */}
						<div className="col-span-2 bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
							<h3 className="text-sm font-bold text-slate-800 mb-5">Task Overview</h3>
							<div className="flex flex-col items-center justify-center py-8 text-slate-400">
								<CheckSquare className="w-10 h-10 mb-3 text-slate-300" />
								<p className="text-sm font-medium">No tasks yet</p>
								<p className="text-xs mt-1">Task stats will appear here</p>
							</div>
						</div>

						{/* Weekly Activity */}
						<div className="col-span-3 bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
							<h3 className="text-sm font-bold text-slate-800 mb-1">Weekly Activity</h3>
							<p className="text-xs text-slate-400 mb-4">Messages sent per day</p>
							<div className="flex flex-col items-center justify-center py-8 text-slate-400">
								<BarChart3 className="w-10 h-10 mb-3 text-slate-300" />
								<p className="text-sm font-medium">No activity yet</p>
								<p className="text-xs mt-1">Your weekly activity will show up here</p>
							</div>
						</div>
					</div>

					{/* ──── Middle Row: Team + Channels ──── */}
					<div className="grid grid-cols-5 gap-5">
						{/* Team Performance */}
						<div className="col-span-3 bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
							<div className="flex items-center justify-between mb-5">
								<h3 className="text-sm font-bold text-slate-800">Team Performance</h3>
								<Link
									href="/dashboard/task"
									className="text-xs text-[#0B6E4F] font-semibold hover:underline flex items-center gap-1"
								>
									View All <ArrowRight className="w-3 h-3" />
								</Link>
							</div>
							<div className="flex flex-col items-center justify-center py-8 text-slate-400">
								<Users className="w-10 h-10 mb-3 text-slate-300" />
								<p className="text-sm font-medium">No team data yet</p>
								<p className="text-xs mt-1">Team performance will appear as tasks are completed</p>
							</div>
						</div>

						{/* Channel Activity */}
						<div className="col-span-2 bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
							<div className="flex items-center justify-between mb-5">
								<h3 className="text-sm font-bold text-slate-800">Active Channels</h3>
								<Link
									href="/dashboard/chat"
									className="text-xs text-[#0B6E4F] font-semibold hover:underline flex items-center gap-1"
								>
									View All <ArrowRight className="w-3 h-3" />
								</Link>
							</div>
							<div className="flex flex-col items-center justify-center py-8 text-slate-400">
								<Hash className="w-10 h-10 mb-3 text-slate-300" />
								<p className="text-sm font-medium">No channels yet</p>
								<p className="text-xs mt-1">Channel activity will appear here</p>
							</div>
						</div>
					</div>

					{/* ──── Bottom Row: Activity + Deadlines ──── */}
					<div className="grid grid-cols-5 gap-5">
						{/* Recent Activity */}
						<div className="col-span-3 bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
							<h3 className="text-sm font-bold text-slate-800 mb-5">Recent Activity</h3>
							<div className="flex flex-col items-center justify-center py-8 text-slate-400">
								<MessageSquare className="w-10 h-10 mb-3 text-slate-300" />
								<p className="text-sm font-medium">No recent activity</p>
								<p className="text-xs mt-1">Activity from your workspace will show up here</p>
							</div>
						</div>

						{/* Upcoming Deadlines */}
						<div className="col-span-2 bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
							<div className="flex items-center justify-between mb-5">
								<h3 className="text-sm font-bold text-slate-800">Upcoming Deadlines</h3>
								<Clock className="w-4 h-4 text-slate-400" />
							</div>
							<div className="flex flex-col items-center justify-center py-8 text-slate-400">
								<Clock className="w-10 h-10 mb-3 text-slate-300" />
								<p className="text-sm font-medium">No upcoming deadlines</p>
								<p className="text-xs mt-1">Tasks with due dates will appear here</p>
							</div>
						</div>
					</div>

					{/* ──── Quick Actions Footer ──── */}
					<div className="grid grid-cols-3 gap-4">
						{[
							{
								title: "Messages & Channels",
								desc: "Chat with your team",
								href: "/dashboard/chat",
								icon: MessageSquare,
								color: "text-[#0B6E4F]",
								bg: "bg-emerald-50",
							},
							{
								title: "Tasks & Projects",
								desc: "Manage project progress",
								href: "/dashboard/task",
								icon: CheckSquare,
								color: "text-blue-500",
								bg: "bg-blue-50",
							},
							{
								title: "Analytics & Reports",
								desc: "Detailed workspace insights",
								href: "/dashboard/task",
								icon: BarChart3,
								color: "text-violet-500",
								bg: "bg-violet-50",
							},
						].map((link) => {
							const Icon = link.icon;
							return (
								<Link
									key={link.title}
									href={link.href}
									className="flex items-center gap-4 p-5 rounded-xl border border-slate-200 hover:border-[#0B6E4F] bg-white hover:shadow-lg transition-all group"
								>
									<div
										className={`w-11 h-11 rounded-xl ${link.bg} flex items-center justify-center shrink-0`}
									>
										<Icon className={`w-5 h-5 ${link.color}`} />
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-semibold text-slate-800 group-hover:text-[#0B6E4F] transition-colors">
											{link.title}
										</p>
										<p className="text-xs text-slate-400">{link.desc}</p>
									</div>
									<ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#0B6E4F] group-hover:translate-x-1 transition-all shrink-0" />
								</Link>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}
