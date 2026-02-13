"use client";

import {
	ArrowDown,
	ArrowRight,
	ArrowUp,
	BarChart3,
	CheckCircle2,
	CheckSquare,
	Clock,
	FileText,
	Hash,
	MessageSquare,
	MoreHorizontal,
	TrendingUp,
	Users,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════
   Mock Data
   ═══════════════════════════════════════════════ */

const statCards = [
	{
		label: "Total Messages",
		value: "2,847",
		change: "+12.5%",
		trend: "up" as const,
		icon: MessageSquare,
		gradient: "from-[#0B6E4F] to-emerald-400",
		bgLight: "bg-emerald-50",
	},
	{
		label: "Active Tasks",
		value: "38",
		change: "+4",
		trend: "up" as const,
		icon: CheckSquare,
		gradient: "from-blue-500 to-blue-400",
		bgLight: "bg-blue-50",
	},
	{
		label: "Team Members",
		value: "24",
		change: "+2",
		trend: "up" as const,
		icon: Users,
		gradient: "from-violet-500 to-purple-400",
		bgLight: "bg-violet-50",
	},
	{
		label: "Files Shared",
		value: "156",
		change: "-3",
		trend: "down" as const,
		icon: FileText,
		gradient: "from-amber-500 to-orange-400",
		bgLight: "bg-amber-50",
	},
];

const taskStatusData = [
	{ label: "Completed", value: 14, color: "#0B6E4F" },
	{ label: "In Progress", value: 8, color: "#3B82F6" },
	{ label: "In Review", value: 5, color: "#F59E0B" },
	{ label: "To Do", value: 9, color: "#94A3B8" },
	{ label: "Blocked", value: 2, color: "#EF4444" },
];

const weeklyActivity = [
	{ day: "Mon", messages: 45, tasks: 8, files: 12 },
	{ day: "Tue", messages: 62, tasks: 12, files: 8 },
	{ day: "Wed", messages: 38, tasks: 6, files: 15 },
	{ day: "Thu", messages: 72, tasks: 14, files: 10 },
	{ day: "Fri", messages: 56, tasks: 10, files: 18 },
	{ day: "Sat", messages: 20, tasks: 3, files: 4 },
	{ day: "Sun", messages: 15, tasks: 2, files: 2 },
];

const teamPerformance = [
	{ name: "Ravikrishna J", role: "Lead", tasks: 12, completed: 9, avatar: "RJ" },
	{ name: "Sarah Chen", role: "Designer", tasks: 8, completed: 7, avatar: "SC" },
	{ name: "Alex Morgan", role: "Developer", tasks: 10, completed: 6, avatar: "AM" },
	{ name: "Priya Patel", role: "QA Lead", tasks: 7, completed: 5, avatar: "PP" },
	{ name: "James Lee", role: "Marketing", tasks: 6, completed: 4, avatar: "JL" },
];

const recentActivity = [
	{
		action: "Sarah Chen completed",
		target: "Landing Page Redesign",
		channel: "#product-design",
		time: "5m ago",
		type: "task" as const,
		avatar: "SC",
		avatarColor: "bg-pink-500",
	},
	{
		action: "Ravikrishna J shared",
		target: "Q1_Report_Final.pdf",
		channel: "#all-teamup",
		time: "18m ago",
		type: "file" as const,
		avatar: "RJ",
		avatarColor: "bg-orange-500",
	},
	{
		action: "Alex Morgan commented in",
		target: "#marketing-dev",
		channel: "",
		time: "32m ago",
		type: "message" as const,
		avatar: "AM",
		avatarColor: "bg-blue-500",
	},
	{
		action: "Priya Patel created task",
		target: "API Performance Testing",
		channel: "#product-design",
		time: "1h ago",
		type: "task" as const,
		avatar: "PP",
		avatarColor: "bg-violet-500",
	},
	{
		action: "James Lee updated",
		target: "Campaign Brief v3",
		channel: "#marketing-dev",
		time: "2h ago",
		type: "file" as const,
		avatar: "JL",
		avatarColor: "bg-teal-500",
	},
];

const channelActivity = [
	{ name: "all-teamup", messages: 342, members: 24, trend: "up" as const },
	{ name: "product-design", messages: 218, members: 12, trend: "up" as const },
	{ name: "marketing-dev", messages: 156, members: 8, trend: "down" as const },
];

const upcomingDeadlines = [
	{ task: "Dashboard UI Review", due: "Today", priority: "high" as const, assignee: "RJ" },
	{ task: "API Integration Tests", due: "Tomorrow", priority: "critical" as const, assignee: "PP" },
	{ task: "Campaign Launch Prep", due: "Feb 15", priority: "medium" as const, assignee: "JL" },
	{ task: "Design System Update", due: "Feb 17", priority: "low" as const, assignee: "SC" },
];

/* ═══════════════════════════════════════════════
   Canvas Charts
   ═══════════════════════════════════════════════ */

function DonutChart({ data, size = 140 }: { data: typeof taskStatusData; size?: number }) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const total = data.reduce((s, d) => s + d.value, 0);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const dpr = window.devicePixelRatio || 1;
		canvas.width = size * dpr;
		canvas.height = size * dpr;
		ctx.scale(dpr, dpr);
		ctx.clearRect(0, 0, size, size);

		const cx = size / 2;
		const cy = size / 2;
		const radius = size / 2 - 6;
		const inner = radius * 0.65;
		let angle = -Math.PI / 2;

		for (const item of data) {
			const sweep = (item.value / total) * Math.PI * 2;
			ctx.beginPath();
			ctx.arc(cx, cy, radius, angle, angle + sweep);
			ctx.arc(cx, cy, inner, angle + sweep, angle, true);
			ctx.closePath();
			ctx.fillStyle = item.color;
			ctx.fill();
			angle += sweep;
		}

		ctx.fillStyle = "#1e293b";
		ctx.font = "bold 22px Figtree, system-ui, sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(String(total), cx, cy - 6);
		ctx.fillStyle = "#94a3b8";
		ctx.font = "11px Figtree, system-ui, sans-serif";
		ctx.fillText("tasks", cx, cy + 12);
	}, [data, size, total]);

	return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
}

function ActivityBarChart({ data }: { data: typeof weeklyActivity }) {
	const maxVal = Math.max(...data.map((d) => d.messages));

	return (
		<div className="flex items-end gap-2 h-[120px] w-full px-1">
			{data.map((d) => {
				const h = (d.messages / maxVal) * 100;
				return (
					<div key={d.day} className="flex-1 flex flex-col items-center gap-1.5 group">
						<div className="relative w-full">
							{/* Tooltip */}
							<div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
								{d.messages} msgs
							</div>
							<div
								className="w-full rounded-t-md bg-gradient-to-t from-[#0B6E4F] to-emerald-400 hover:from-[#095C42] hover:to-emerald-500 transition-all cursor-pointer"
								style={{ height: `${h}px` }}
							/>
						</div>
						<span className="text-[10px] text-slate-400 font-medium">{d.day}</span>
					</div>
				);
			})}
		</div>
	);
}

/* ═══════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════ */

function PriorityBadge({ priority }: { priority: string }) {
	const styles: Record<string, string> = {
		critical: "bg-red-100 text-red-700",
		high: "bg-orange-100 text-orange-700",
		medium: "bg-blue-100 text-blue-700",
		low: "bg-slate-100 text-slate-600",
	};
	return (
		<span
			className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${styles[priority] || styles.low}`}
		>
			{priority}
		</span>
	);
}

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
						<h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
							{greeting}, Ravikrishna
							<span className="text-2xl">👋</span>
						</h1>
						<p className="text-sm text-slate-400 mt-1">
							Here&apos;s what&apos;s happening across your workspace today
						</p>
					</div>
					<div className="flex items-center gap-3">
						<div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
							<Zap className="w-4 h-4 text-[#0B6E4F]" />
							<span className="text-sm font-semibold text-[#0B6E4F]">92% Productivity</span>
						</div>
					</div>
				</div>
			</div>

			{/* ──── Content ──── */}
			<div className="flex-1 overflow-y-auto min-h-0">
				<div className="p-8 space-y-7 max-w-[1400px]">
					{/* ──── Stat Cards ──── */}
					<div className="grid grid-cols-4 gap-4">
						{statCards.map((stat) => {
							const Icon = stat.icon;
							return (
								<div
									key={stat.label}
									className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 hover:shadow-lg hover:border-slate-300 transition-all group cursor-pointer"
								>
									{/* Accent gradient line at top */}
									<div
										className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
									/>

									<div className="flex items-center justify-between mb-3">
										<div
											className={`w-10 h-10 rounded-xl ${stat.bgLight} flex items-center justify-center`}
										>
											<Icon
												className={`w-5 h-5 bg-gradient-to-r ${stat.gradient} bg-clip-text`}
												style={{
													color: stat.gradient.includes("emerald")
														? "#0B6E4F"
														: stat.gradient.includes("blue")
															? "#3B82F6"
															: stat.gradient.includes("violet")
																? "#8B5CF6"
																: "#F59E0B",
												}}
											/>
										</div>
										<div
											className={`flex items-center gap-1 text-xs font-semibold ${stat.trend === "up" ? "text-emerald-500" : "text-red-500"}`}
										>
											{stat.trend === "up" ? (
												<ArrowUp className="w-3 h-3" />
											) : (
												<ArrowDown className="w-3 h-3" />
											)}
											{stat.change}
										</div>
									</div>
									<p className="text-[28px] font-bold text-slate-900 leading-none mb-1">
										{stat.value}
									</p>
									<p className="text-xs text-slate-400 font-medium">{stat.label}</p>
								</div>
							);
						})}
					</div>

					{/* ──── Charts Row ──── */}
					<div className="grid grid-cols-5 gap-5">
						{/* Task Status Donut */}
						<div className="col-span-2 bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
							<div className="flex items-center justify-between mb-5">
								<h3 className="text-sm font-bold text-slate-800">Task Overview</h3>
								<button type="button" className="text-slate-400 hover:text-slate-600">
									<MoreHorizontal className="w-4 h-4" />
								</button>
							</div>
							<div className="flex items-center gap-5">
								<DonutChart data={taskStatusData} />
								<div className="space-y-2 flex-1">
									{taskStatusData.map((item) => (
										<div key={item.label} className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<div
													className="w-2.5 h-2.5 rounded-full"
													style={{ backgroundColor: item.color }}
												/>
												<span className="text-xs text-slate-500">{item.label}</span>
											</div>
											<div className="flex items-center gap-2">
												<span className="text-xs font-bold text-slate-700 tabular-nums">
													{item.value}
												</span>
												<div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
													<div
														className="h-full rounded-full"
														style={{
															width: `${(item.value / 38) * 100}%`,
															backgroundColor: item.color,
														}}
													/>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>

						{/* Weekly Activity */}
						<div className="col-span-3 bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
							<div className="flex items-center justify-between mb-4">
								<div>
									<h3 className="text-sm font-bold text-slate-800">Weekly Activity</h3>
									<p className="text-xs text-slate-400 mt-0.5">Messages sent per day</p>
								</div>
								<div className="flex items-center gap-3">
									<div className="flex items-center gap-1.5">
										<div className="w-2 h-2 rounded-full bg-[#0B6E4F]" />
										<span className="text-[10px] text-slate-400">Messages</span>
									</div>
									<div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg text-xs font-medium text-slate-500">
										This Week
									</div>
								</div>
							</div>
							<ActivityBarChart data={weeklyActivity} />
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
							<div className="space-y-3.5">
								{teamPerformance.map((member) => {
									const pct = Math.round((member.completed / member.tasks) * 100);
									return (
										<div key={member.name} className="flex items-center gap-3 group">
											<div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
												{member.avatar}
											</div>
											<div className="min-w-[120px]">
												<p className="text-sm font-medium text-slate-800 leading-tight">
													{member.name}
												</p>
												<p className="text-[10px] text-slate-400">{member.role}</p>
											</div>
											<div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
												<div
													className="h-full bg-gradient-to-r from-[#0B6E4F] to-emerald-400 rounded-full transition-all duration-700"
													style={{ width: `${pct}%` }}
												/>
											</div>
											<span className="text-xs font-bold tabular-nums text-slate-600 w-16 text-right">
												{member.completed}/{member.tasks}
												<span className="text-slate-400 font-normal ml-1">({pct}%)</span>
											</span>
										</div>
									);
								})}
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
							<div className="space-y-3">
								{channelActivity.map((ch) => (
									<Link
										key={ch.name}
										href={`/dashboard/chat/channel/${ch.name}`}
										className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
									>
										<div className="w-9 h-9 rounded-lg bg-[#0B6E4F]/10 flex items-center justify-center shrink-0">
											<Hash className="w-4 h-4 text-[#0B6E4F]" />
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-semibold text-slate-800 group-hover:text-[#0B6E4F] transition-colors">
												{ch.name}
											</p>
											<p className="text-[10px] text-slate-400">{ch.members} members</p>
										</div>
										<div className="text-right">
											<p className="text-sm font-bold text-slate-700 tabular-nums">{ch.messages}</p>
											<div
												className={`flex items-center gap-0.5 text-[10px] font-medium ${ch.trend === "up" ? "text-emerald-500" : "text-red-400"}`}
											>
												{ch.trend === "up" ? (
													<TrendingUp className="w-2.5 h-2.5" />
												) : (
													<ArrowDown className="w-2.5 h-2.5" />
												)}
												msgs
											</div>
										</div>
									</Link>
								))}
							</div>
						</div>
					</div>

					{/* ──── Bottom Row: Activity + Deadlines ──── */}
					<div className="grid grid-cols-5 gap-5">
						{/* Recent Activity */}
						<div className="col-span-3 bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
							<div className="flex items-center justify-between mb-5">
								<h3 className="text-sm font-bold text-slate-800">Recent Activity</h3>
								<div className="flex items-center gap-2">
									{["All", "Tasks", "Files", "Messages"].map((filter, i) => (
										<button
											key={filter}
											type="button"
											className={`text-[11px] font-semibold px-3 py-1 rounded-full transition-colors ${
												i === 0
													? "bg-[#0B6E4F] text-white"
													: "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
											}`}
										>
											{filter}
										</button>
									))}
								</div>
							</div>
							<div className="space-y-1">
								{recentActivity.map((act) => (
									<div
										key={act.target}
										className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
									>
										<div
											className={`w-8 h-8 rounded-full ${act.avatarColor} text-white flex items-center justify-center text-[10px] font-bold shrink-0`}
										>
											{act.avatar}
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm text-slate-600">
												<span className="font-semibold text-slate-800">
													{act.action.split(" ")[0]} {act.action.split(" ")[1]}
												</span>{" "}
												{act.action.split(" ").slice(2).join(" ")}{" "}
												<span className="font-semibold text-slate-800">{act.target}</span>
											</p>
											{act.channel && (
												<p className="text-[10px] text-slate-400 mt-0.5">in {act.channel}</p>
											)}
										</div>
										<span className="text-[10px] text-slate-400 shrink-0">{act.time}</span>
										{act.type === "task" ? (
											<CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
										) : act.type === "file" ? (
											<FileText className="w-4 h-4 text-blue-400 shrink-0" />
										) : (
											<MessageSquare className="w-4 h-4 text-violet-400 shrink-0" />
										)}
									</div>
								))}
							</div>
						</div>

						{/* Upcoming Deadlines */}
						<div className="col-span-2 bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
							<div className="flex items-center justify-between mb-5">
								<h3 className="text-sm font-bold text-slate-800">Upcoming Deadlines</h3>
								<Clock className="w-4 h-4 text-slate-400" />
							</div>
							<div className="space-y-3">
								{upcomingDeadlines.map((deadline) => (
									<div
										key={deadline.task}
										className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
									>
										<div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
											{deadline.assignee}
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-slate-800 truncate">{deadline.task}</p>
											<div className="flex items-center gap-2 mt-0.5">
												<span
													className={`text-[10px] font-medium ${deadline.due === "Today" ? "text-red-500" : deadline.due === "Tomorrow" ? "text-amber-500" : "text-slate-400"}`}
												>
													{deadline.due}
												</span>
												<PriorityBadge priority={deadline.priority} />
											</div>
										</div>
									</div>
								))}
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
