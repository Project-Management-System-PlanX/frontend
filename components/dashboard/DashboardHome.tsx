"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	Calendar,
	ChevronDown,
	Clock,
	Filter,
	Hash,
	LayoutGrid,
	MessageSquare,
	MoreHorizontal,
	TrendingUp,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWorkspaceAnalytics } from "@/hooks/api/use-workspaces";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useWorkspaceMembers } from "@/hooks/use-workspace-members";
import { useWorkspaceStore } from "@/stores/workspace-store";

/* ═══════════════════════════════════════════════
   Apple UI Dashboard Components
   ═══════════════════════════════════════════════ */

const CARD =
	"bg-white/60 backdrop-blur-3xl rounded-[24px] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]";

const MiniSparkline = ({ positive, data }: { positive: boolean; data: number[] }) => {
	const points = data || [3, 5, 2, 7, 4, 8, 6, 9];
	const max = Math.max(...points);
	const min = Math.min(...points);
	const range = max - min || 1;
	const w = 80,
		h = 32,
		pad = 2;
	const xs = points.map((_, i) => pad + (i / (points.length - 1)) * (w - 2 * pad));
	const ys = points.map((v) => h - pad - ((v - min) / range) * (h - 2 * pad));
	const d = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
	const color = positive ? "#34C759" : "#FF3B30";
	return (
		<svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
			<title>Sparkline</title>
			<path
				d={d}
				fill="none"
				stroke={color}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				style={{ filter: `drop-shadow(0px 2px 2px ${color}40)` }}
			/>
		</svg>
	);
};

const CustomTooltip = ({ active, payload, label }: any) => {
	if (active && payload && payload.length) {
		return (
			<div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl py-2.5 px-3.5 text-sm">
				<div className="font-semibold text-gray-900 mb-1">{label}</div>
				{payload.map((p: any, i: number) => (
					<div key={p.dataKey || p.name || `item-${i}`} className="flex items-center gap-2 mb-0.5">
						<div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
						<span className="text-gray-600">{p.dataKey || p.name}</span>
						<span className="text-gray-900 font-semibold ml-auto pl-3">{p.value}</span>
					</div>
				))}
			</div>
		);
	}
	return null;
};

const sparklines = [
	[3, 5, 4, 7, 5, 8, 7, 9],
	[2, 4, 3, 5, 4, 6, 5, 7],
	[4, 6, 5, 8, 6, 9, 8, 11],
	[8, 6, 7, 5, 6, 4, 5, 3],
	[3, 5, 6, 8, 7, 9, 10, 12],
];

const DATE_RANGES = ["Last 7 Days", "Last 14 Days", "Last 30 Days", "All Time"] as const;

export function DashboardHome() {
	const { token } = useSupabaseAuth();
	const { activeWorkspaceId } = useWorkspaceStore();
	const { data: analytics } = useWorkspaceAnalytics(activeWorkspaceId ?? "", token ?? undefined);
	const { members } = useWorkspaceMembers();
	const [activeTab, setActiveTab] = useState("Overview");
	const [dateRange, setDateRange] = useState<string>("Last 7 Days");
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [showFilter, setShowFilter] = useState(false);
	const [filterType, setFilterType] = useState<"all" | "messages" | "tasks" | "files">("all");

	const isLoaded = !!analytics;

	const metrics = [
		{
			label: "Messages",
			value: analytics?.totalMessages.toLocaleString() || "0",
			change: "+7.4%",
			positive: true,
		},
		{
			label: "Active Tasks",
			value: analytics?.activeTasks.toLocaleString() || "0",
			change: "+4.9%",
			positive: true,
		},
		{
			label: "Completed Tasks",
			value: analytics?.completedTasks.toLocaleString() || "0",
			change: "+11.7%",
			positive: true,
		},
		{
			label: "Team Members",
			value: analytics?.teamMembers.toLocaleString() || "0",
			change: "-2.5%",
			positive: false,
		},
		{
			label: "Files Shared",
			value: analytics?.filesShared.toLocaleString() || "0",
			change: "+19.4%",
			positive: true,
		},
	];

	// Seeded random for stable renders
	const weeklyActivityData = useMemo(
		() =>
			analytics?.weeklyActivity.map((w, _i) => ({
				name: w.day,
				messages: w.count,
				tasks: Math.max(0, Math.round(w.count * 0.6)),
				files: Math.max(0, Math.round(w.count * 0.3)),
			})) || [],
		[analytics],
	);

	const overviewData = useMemo(
		() =>
			analytics?.weeklyActivity.map((w, _i) => ({
				name: w.day,
				active: Math.round(w.count * 1.2) + 10,
				completed: Math.round(w.count * 0.8) + 5,
				pending: Math.round(w.count * 0.4),
			})) || [],
		[analytics],
	);

	// Filtered activity data based on filter type
	const filteredActivity = useMemo(() => {
		if (!analytics?.recentActivity) return [];
		if (filterType === "all") return analytics.recentActivity;
		if (filterType === "messages")
			return analytics.recentActivity.filter((a) => a.channel.type !== "DIRECT_MESSAGE");
		if (filterType === "tasks")
			return analytics.recentActivity.filter((a) => a.channel.type === "DIRECT_MESSAGE");
		return analytics.recentActivity;
	}, [analytics, filterType]);

	return (
		<div className="flex-1 flex flex-col bg-transparent min-w-0 min-h-0 overflow-y-auto selection:bg-blue-200">
			<div
				className="min-h-full p-6 md:p-8 lg:p-10 mx-auto w-full max-w-[1400px]"
				style={{
					fontFamily: "'-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Inter', sans-serif",
				}}
			>
				{/* ──── Header & Tabs ──── */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
					<div>
						<h1 className="text-[28px] font-bold text-gray-900 tracking-tight mb-2">Dashboard</h1>
						<div className="flex relative bg-gradient-to-b from-gray-100/80 to-gray-200/60 p-1.5 rounded-[14px] w-fit backdrop-blur-2xl border border-white/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
							{["Overview", "Activity", "Analytics", "Audience"].map((tab) => {
								const isActive = activeTab === tab;
								return (
									<button
										key={tab}
										type="button"
										onClick={() => setActiveTab(tab)}
										className={`relative z-10 px-4 py-1.5 text-[13px] font-semibold transition-colors duration-200 ${
											isActive ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
										}`}
									>
										{isActive && (
											<motion.div
												layoutId="activeTabBadgeDashboard"
												className="absolute inset-0 bg-white rounded-[10px] shadow-[0_3px_8px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)] border border-gray-200/50"
												initial={false}
												transition={{ type: "spring", stiffness: 500, damping: 30 }}
												style={{ zIndex: -1 }}
											/>
										)}
										{tab}
									</button>
								);
							})}
						</div>
					</div>

					<div className="flex items-center gap-3">
						{/* Date Range Picker */}
						<div className="relative">
							<button
								type="button"
								onClick={() => {
									setShowDatePicker(!showDatePicker);
									setShowFilter(false);
								}}
								className="flex items-center gap-2 bg-white/70 hover:bg-white backdrop-blur-xl border border-white rounded-xl px-3.5 py-2 text-[13px] font-medium text-gray-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
							>
								<Calendar className="w-4 h-4 text-gray-500" />
								{dateRange}
								<ChevronDown className="w-3.5 h-3.5 text-gray-400" />
							</button>
							{showDatePicker && (
								<div className="absolute right-0 top-full mt-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-gray-200/60 py-1.5 z-50 min-w-[180px]">
									{DATE_RANGES.map((range) => (
										<button
											key={range}
											type="button"
											onClick={() => {
												setDateRange(range);
												setShowDatePicker(false);
											}}
											className={`w-full text-left px-4 py-2 text-[13px] font-medium transition-colors ${
												dateRange === range
													? "text-gray-900 bg-gray-100"
													: "text-gray-600 hover:bg-gray-50"
											}`}
										>
											{range}
											{dateRange === range && <span className="float-right text-[#007AFF]">✓</span>}
										</button>
									))}
								</div>
							)}
						</div>

						{/* Filter Button */}
						<div className="relative">
							<button
								type="button"
								onClick={() => {
									setShowFilter(!showFilter);
									setShowDatePicker(false);
								}}
								className={`flex items-center gap-2 backdrop-blur-xl border rounded-xl px-3.5 py-2 text-[13px] font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
									filterType !== "all"
										? "bg-[#007AFF]/10 border-[#007AFF]/20 text-[#007AFF]"
										: "bg-white/70 hover:bg-white border-white text-gray-700"
								}`}
							>
								<Filter className="w-4 h-4" />
								{filterType === "all"
									? "Filter"
									: filterType.charAt(0).toUpperCase() + filterType.slice(1)}
							</button>
							{showFilter && (
								<div className="absolute right-0 top-full mt-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-gray-200/60 py-1.5 z-50 min-w-[160px]">
									{(["all", "messages", "tasks", "files"] as const).map((type) => (
										<button
											key={type}
											type="button"
											onClick={() => {
												setFilterType(type);
												setShowFilter(false);
											}}
											className={`w-full text-left px-4 py-2 text-[13px] font-medium transition-colors ${
												filterType === type
													? "text-gray-900 bg-gray-100"
													: "text-gray-600 hover:bg-gray-50"
											}`}
										>
											{type === "all" ? "All Types" : type.charAt(0).toUpperCase() + type.slice(1)}
											{filterType === type && <span className="float-right text-[#007AFF]">✓</span>}
										</button>
									))}
								</div>
							)}
						</div>

						{/* Widgets — navigate to relevant section */}
						<Link
							href="/dashboard/task"
							className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 rounded-xl px-3.5 py-2 text-[13px] font-medium text-white shadow-md transition-all"
						>
							<LayoutGrid className="w-4 h-4" />
							Widgets
						</Link>
					</div>
				</div>

				{/* Close dropdowns on outside click */}
				{(showDatePicker || showFilter) && (
					// biome-ignore lint/a11y/useKeyWithClickEvents: dismissal overlay
					<div
						className="fixed inset-0 z-40"
						onClick={() => {
							setShowDatePicker(false);
							setShowFilter(false);
						}}
					/>
				)}

				{/* ──── TAB CONTENT ──── */}
				<AnimatePresence mode="wait">
					<motion.div
						key={activeTab}
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						transition={{ duration: 0.2 }}
					>
						{activeTab === "Overview" && (
							<OverviewTab
								metrics={metrics}
								isLoaded={isLoaded}
								weeklyActivityData={weeklyActivityData}
								overviewData={overviewData}
								analytics={analytics}
								filteredActivity={filteredActivity}
							/>
						)}
						{activeTab === "Activity" && (
							<ActivityTab
								analytics={analytics}
								isLoaded={isLoaded}
								filteredActivity={filteredActivity}
							/>
						)}
						{activeTab === "Analytics" && (
							<AnalyticsTab
								analytics={analytics}
								isLoaded={isLoaded}
								weeklyActivityData={weeklyActivityData}
								overviewData={overviewData}
							/>
						)}
						{activeTab === "Audience" && (
							<AudienceTab members={members} isLoaded={isLoaded} analytics={analytics} />
						)}
					</motion.div>
				</AnimatePresence>
			</div>
		</div>
	);
}

/* ═══════════════════════════════════════════════
   TAB: Overview (original dashboard)
   ═══════════════════════════════════════════════ */
function OverviewTab({
	metrics,
	isLoaded,
	weeklyActivityData,
	overviewData,
	analytics,
	filteredActivity,
}: any) {
	return (
		<>
			{/* Metrics Summary */}
			<div className={`${CARD} p-6 mb-6`}>
				<div className="mb-5">
					<div className="font-semibold text-[15px] text-gray-900 tracking-tight">
						Performance Summary
					</div>
					<div className="text-[13px] text-gray-500">View your key performance metrics</div>
				</div>
				<div className="grid grid-cols-2 md:grid-cols-5 gap-6 divide-x divide-gray-200/50">
					{metrics.map((m: any, i: number) => (
						<div key={m.label} className={i !== 0 ? "pl-6" : ""}>
							<div className="text-[13px] font-medium text-gray-500 mb-2">{m.label}</div>
							<div className="flex items-end justify-between">
								<div className="text-[26px] font-bold text-gray-900 tracking-tight leading-none">
									{!isLoaded ? (
										<div className="h-7 w-12 bg-gray-200 animate-pulse rounded-md" />
									) : (
										m.value
									)}
								</div>
								<MiniSparkline positive={m.positive} data={sparklines[i]} />
							</div>
							<div className="flex items-center gap-1.5 mt-3">
								<span
									className={`text-[12px] font-semibold px-1.5 py-0.5 rounded-md ${
										m.positive ? "bg-[#34C759]/10 text-[#34C759]" : "bg-[#FF3B30]/10 text-[#FF3B30]"
									}`}
								>
									{m.positive ? "↑" : "↓"} {m.change}
								</span>
								<span className="text-[12px] text-gray-400 font-medium tracking-tight">
									vs last week
								</span>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Charts Row */}
			<div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
				<div className={`lg:col-span-3 ${CARD} p-6 flex flex-col`}>
					<div className="flex items-center justify-between mb-6">
						<div>
							<h3 className="font-semibold text-[15px] text-gray-900 tracking-tight">
								Weekly Activity
							</h3>
							<h4 className="text-[13px] text-gray-500 mt-0.5">
								Messages and interactions over the week
							</h4>
						</div>
						<button
							type="button"
							className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
						>
							<MoreHorizontal className="w-5 h-5" />
						</button>
					</div>
					<div className="flex-1 min-h-[220px]">
						{!isLoaded ? (
							<div className="w-full h-full bg-gray-100/50 animate-pulse rounded-xl" />
						) : (
							<ResponsiveContainer width="100%" height="100%">
								<LineChart
									data={weeklyActivityData}
									margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
								>
									<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
									<XAxis
										dataKey="name"
										tick={{ fontSize: 11, fill: "#8e8e93", fontWeight: 500 }}
										axisLine={false}
										tickLine={false}
										tickMargin={12}
									/>
									<YAxis
										tick={{ fontSize: 11, fill: "#8e8e93", fontWeight: 500 }}
										axisLine={false}
										tickLine={false}
										tickMargin={12}
									/>
									<Tooltip content={<CustomTooltip />} cursor={{ fill: "#f3f4f6" }} />
									<Line
										type="monotone"
										dataKey="messages"
										name="Messages"
										stroke="#007AFF"
										strokeWidth={3}
										dot={false}
										activeDot={{ r: 6, strokeWidth: 0, fill: "#007AFF" }}
										style={{ filter: "drop-shadow(0px 4px 6px rgba(0, 122, 255, 0.3))" }}
									/>
									<Line
										type="monotone"
										dataKey="tasks"
										name="Tasks"
										stroke="#FF9500"
										strokeWidth={3}
										dot={false}
										activeDot={{ r: 6, strokeWidth: 0, fill: "#FF9500" }}
										style={{ filter: "drop-shadow(0px 4px 6px rgba(255, 149, 0, 0.3))" }}
									/>
									<Line
										type="monotone"
										dataKey="files"
										name="Files"
										stroke="#34C759"
										strokeWidth={3}
										dot={false}
										activeDot={{ r: 6, strokeWidth: 0, fill: "#34C759" }}
										style={{ filter: "drop-shadow(0px 4px 6px rgba(52, 199, 89, 0.3))" }}
									/>
								</LineChart>
							</ResponsiveContainer>
						)}
					</div>
					<div className="flex items-center justify-center gap-6 mt-6">
						{[
							{ color: "#007AFF", label: "Messages" },
							{ color: "#FF9500", label: "Tasks" },
							{ color: "#34C759", label: "Files" },
						].map((l) => (
							<div key={l.label} className="flex items-center gap-2">
								<div
									className="w-2.5 h-2.5 rounded-full shadow-sm"
									style={{ background: l.color }}
								/>
								<span className="text-[12px] font-medium text-gray-500">{l.label}</span>
							</div>
						))}
					</div>
				</div>

				<div className={`lg:col-span-2 ${CARD} p-6 flex flex-col`}>
					<div className="flex items-center justify-between mb-6">
						<div>
							<h3 className="font-semibold text-[15px] text-gray-900 tracking-tight">Overview</h3>
							<h4 className="text-[13px] text-gray-500 mt-0.5">Task completion flow</h4>
						</div>
						<div className="text-[12px] font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">
							Weekly
						</div>
					</div>
					<div className="flex-1 min-h-[220px]">
						{!isLoaded ? (
							<div className="w-full h-full bg-gray-100/50 animate-pulse rounded-xl" />
						) : (
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									data={overviewData}
									margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
									barSize={10}
									barGap={3}
								>
									<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
									<XAxis
										dataKey="name"
										tick={{ fontSize: 11, fill: "#8e8e93", fontWeight: 500 }}
										axisLine={false}
										tickLine={false}
										tickMargin={10}
									/>
									<YAxis
										tick={{ fontSize: 11, fill: "#8e8e93", fontWeight: 500 }}
										axisLine={false}
										tickLine={false}
										tickMargin={10}
									/>
									<Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
									<Bar dataKey="active" name="Active" fill="#007AFF" radius={[3, 3, 0, 0]} />
									<Bar dataKey="completed" name="Completed" fill="#5AC8FA" radius={[3, 3, 0, 0]} />
									<Bar dataKey="pending" name="Pending" fill="#AF52DE" radius={[3, 3, 0, 0]} />
								</BarChart>
							</ResponsiveContainer>
						)}
					</div>
				</div>
			</div>

			{/* Row 2: Activity + Channels */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className={`lg:col-span-2 ${CARD} p-6`}>
					<div className="flex items-center justify-between mb-6">
						<div>
							<h3 className="font-semibold text-[15px] text-gray-900 tracking-tight">
								Recent Activity Feed
							</h3>
							<h4 className="text-[13px] text-gray-500 mt-0.5">
								Latest actions across all channels
							</h4>
						</div>
						<Link
							href="/dashboard/chat"
							className="text-[12px] font-medium text-gray-600 hover:text-gray-900 transition-colors"
						>
							View All
						</Link>
					</div>
					<ActivityTable isLoaded={isLoaded} activity={filteredActivity} maxRows={4} />
				</div>

				<div className={`${CARD} p-6`}>
					<h3 className="font-semibold text-[15px] text-gray-900 tracking-tight mb-5">
						Active Channels
					</h3>
					<div className="space-y-4">
						{!isLoaded ? (
							["s1", "s2", "s3", "s4"].map((k) => (
								<div key={k} className="h-10 bg-gray-100 animate-pulse rounded-xl" />
							))
						) : analytics?.activeChannels.length === 0 ? (
							<div className="text-sm text-gray-400 py-6 text-center">No active channels</div>
						) : (
							analytics?.activeChannels.map((c: any) => (
								<Link
									key={c.id}
									href={`/dashboard/chat/channel/${c.id}`}
									className="flex items-center justify-between group p-2 -mx-2 rounded-xl hover:bg-white/50 transition-colors"
								>
									<div className="flex items-center gap-3">
										<div className="w-8 h-8 rounded-[10px] bg-blue-50 text-blue-500 flex items-center justify-center font-bold text-sm group-hover:bg-blue-500 group-hover:text-white transition-colors shadow-sm">
											#
										</div>
										<span className="text-[14px] font-semibold text-gray-800">{c.name}</span>
									</div>
									<div className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
										{c._count.messages} <span className="text-gray-400 font-normal">msgs</span>
									</div>
								</Link>
							))
						)}
					</div>
				</div>
			</div>
		</>
	);
}

/* ═══════════════════════════════════════════════
   TAB: Activity — Full Activity Feed
   ═══════════════════════════════════════════════ */
function ActivityTab({ analytics, isLoaded, filteredActivity }: any) {
	return (
		<div className={`${CARD} p-6`}>
			<div className="flex items-center justify-between mb-6">
				<div>
					<h3 className="font-semibold text-[17px] text-gray-900 tracking-tight flex items-center gap-2">
						<Clock className="w-5 h-5 text-gray-400" />
						Activity Timeline
					</h3>
					<h4 className="text-[13px] text-gray-500 mt-1">
						Complete history of all workspace actions
					</h4>
				</div>
				<div className="text-[12px] font-medium bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg">
					{filteredActivity?.length || 0} events
				</div>
			</div>

			{!isLoaded ? (
				<div className="space-y-4">
					{["s1", "s2", "s3", "s4", "s5", "s6"].map((k) => (
						<div key={k} className="h-16 bg-gray-100/50 animate-pulse rounded-xl" />
					))}
				</div>
			) : filteredActivity?.length === 0 ? (
				<div className="text-center py-16">
					<MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
					<p className="text-[15px] font-semibold text-gray-400">No activity yet</p>
					<p className="text-[13px] text-gray-400 mt-1">
						Start chatting in your channels to see activity here
					</p>
				</div>
			) : (
				<div className="space-y-1">
					{filteredActivity.map((msg: any, _i: number) => (
						<div
							key={msg.id}
							className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50/50 transition-colors group"
						>
							<Avatar className="w-9 h-9 shrink-0 mt-0.5 shadow-sm border border-white/80">
								<AvatarImage
									src={msg.user.imageUrl}
									alt={msg.user.firstName || msg.user.email}
									referrerPolicy="no-referrer"
								/>
								<AvatarFallback className="bg-gradient-to-tr from-blue-500 to-indigo-500 text-white text-[11px] font-bold">
									{(msg.user.firstName || msg.user.email)[0].toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2 mb-1">
									<span className="text-[13px] font-semibold text-gray-900">
										{msg.user.firstName || msg.user.email.split("@")[0]}
									</span>
									<span className="text-[12px] text-gray-400">sent a message in</span>
									<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-600">
										<Hash className="w-3 h-3" />
										{msg.channel.type === "DIRECT_MESSAGE" ? "DM" : msg.channel.name}
									</span>
								</div>
								<p className="text-[13px] text-gray-500 truncate max-w-xl">
									{msg.content.replace(/<[^>]*>?/gm, "").substring(0, 100)}
								</p>
							</div>
							<span className="text-[11px] text-gray-400 font-medium shrink-0 mt-1">
								{new Date(msg.createdAt).toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								})}
							</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

/* ═══════════════════════════════════════════════
   TAB: Analytics — Deep Charts
   ═══════════════════════════════════════════════ */
function AnalyticsTab({ analytics, isLoaded, weeklyActivityData, overviewData }: any) {
	return (
		<div className="space-y-6">
			{/* Message Volume Chart — Full Width */}
			<div className={`${CARD} p-6`}>
				<div className="flex items-center justify-between mb-6">
					<div>
						<h3 className="font-semibold text-[17px] text-gray-900 tracking-tight flex items-center gap-2">
							<TrendingUp className="w-5 h-5 text-gray-400" />
							Message Volume Analysis
						</h3>
						<h4 className="text-[13px] text-gray-500 mt-1">
							Breakdown of all interactions across your workspace
						</h4>
					</div>
				</div>
				<div className="h-[300px]">
					{!isLoaded ? (
						<div className="w-full h-full bg-gray-100/50 animate-pulse rounded-xl" />
					) : (
						<ResponsiveContainer width="100%" height="100%">
							<LineChart
								data={weeklyActivityData}
								margin={{ top: 5, right: 20, left: -10, bottom: 0 }}
							>
								<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
								<XAxis
									dataKey="name"
									tick={{ fontSize: 12, fill: "#8e8e93", fontWeight: 500 }}
									axisLine={false}
									tickLine={false}
									tickMargin={14}
								/>
								<YAxis
									tick={{ fontSize: 12, fill: "#8e8e93", fontWeight: 500 }}
									axisLine={false}
									tickLine={false}
									tickMargin={14}
								/>
								<Tooltip content={<CustomTooltip />} cursor={{ fill: "#f3f4f6" }} />
								<Line
									type="monotone"
									dataKey="messages"
									name="Messages"
									stroke="#007AFF"
									strokeWidth={3}
									dot={{ r: 5, fill: "#007AFF", strokeWidth: 0 }}
									activeDot={{ r: 7, strokeWidth: 0, fill: "#007AFF" }}
								/>
								<Line
									type="monotone"
									dataKey="tasks"
									name="Tasks"
									stroke="#FF9500"
									strokeWidth={3}
									dot={{ r: 5, fill: "#FF9500", strokeWidth: 0 }}
									activeDot={{ r: 7, strokeWidth: 0, fill: "#FF9500" }}
								/>
								<Line
									type="monotone"
									dataKey="files"
									name="Files"
									stroke="#34C759"
									strokeWidth={3}
									dot={{ r: 5, fill: "#34C759", strokeWidth: 0 }}
									activeDot={{ r: 7, strokeWidth: 0, fill: "#34C759" }}
								/>
							</LineChart>
						</ResponsiveContainer>
					)}
				</div>
			</div>

			{/* Task Flow + Channel Breakdown */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className={`${CARD} p-6`}>
					<h3 className="font-semibold text-[15px] text-gray-900 tracking-tight mb-1">
						Task Completion Rate
					</h3>
					<h4 className="text-[13px] text-gray-500 mb-6">Active vs completed vs pending</h4>
					<div className="h-[240px]">
						{!isLoaded ? (
							<div className="w-full h-full bg-gray-100/50 animate-pulse rounded-xl" />
						) : (
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									data={overviewData}
									margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
									barSize={14}
									barGap={4}
								>
									<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
									<XAxis
										dataKey="name"
										tick={{ fontSize: 11, fill: "#8e8e93", fontWeight: 500 }}
										axisLine={false}
										tickLine={false}
									/>
									<YAxis
										tick={{ fontSize: 11, fill: "#8e8e93", fontWeight: 500 }}
										axisLine={false}
										tickLine={false}
									/>
									<Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
									<Bar dataKey="active" name="Active" fill="#007AFF" radius={[4, 4, 0, 0]} />
									<Bar dataKey="completed" name="Completed" fill="#34C759" radius={[4, 4, 0, 0]} />
									<Bar dataKey="pending" name="Pending" fill="#FF9500" radius={[4, 4, 0, 0]} />
								</BarChart>
							</ResponsiveContainer>
						)}
					</div>
				</div>

				<div className={`${CARD} p-6`}>
					<h3 className="font-semibold text-[15px] text-gray-900 tracking-tight mb-1">
						Channel Breakdown
					</h3>
					<h4 className="text-[13px] text-gray-500 mb-6">Messages per channel</h4>
					<div className="space-y-4">
						{!isLoaded ? (
							["s1", "s2", "s3"].map((k) => (
								<div key={k} className="h-10 bg-gray-100/50 animate-pulse rounded-xl" />
							))
						) : analytics?.activeChannels.length === 0 ? (
							<div className="text-sm text-gray-400 py-8 text-center">No channel data</div>
						) : (
							analytics?.activeChannels.map((c: any) => {
								const maxMsgs = Math.max(
									...analytics.activeChannels.map((ch: any) => ch._count.messages),
									1,
								);
								const pct = (c._count.messages / maxMsgs) * 100;
								return (
									<div key={c.id}>
										<div className="flex items-center justify-between mb-1.5">
											<span className="text-[13px] font-semibold text-gray-800 flex items-center gap-2">
												<Hash className="w-3.5 h-3.5 text-gray-400" />
												{c.name}
											</span>
											<span className="text-[12px] font-bold text-gray-600">
												{c._count.messages}
											</span>
										</div>
										<div className="h-2 bg-gray-100 rounded-full overflow-hidden">
											<motion.div
												className="h-full bg-gradient-to-r from-[#007AFF] to-[#5AC8FA] rounded-full"
												initial={{ width: 0 }}
												animate={{ width: `${pct}%` }}
												transition={{ duration: 0.6, ease: "easeOut" }}
											/>
										</div>
									</div>
								);
							})
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

/* ═══════════════════════════════════════════════
   TAB: Audience — Team Members
   ═══════════════════════════════════════════════ */
function AudienceTab({ members, isLoaded, analytics }: any) {
	return (
		<div className="space-y-6">
			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className={`${CARD} p-6`}>
					<div className="flex items-center gap-3 mb-3">
						<div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
							<Users className="w-5 h-5 text-[#007AFF]" />
						</div>
						<div>
							<div className="text-[24px] font-bold text-gray-900 leading-none">
								{analytics?.teamMembers || members?.length || 0}
							</div>
							<div className="text-[12px] text-gray-500 font-medium mt-0.5">Total Members</div>
						</div>
					</div>
				</div>
				<div className={`${CARD} p-6`}>
					<div className="flex items-center gap-3 mb-3">
						<div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
							<MessageSquare className="w-5 h-5 text-[#34C759]" />
						</div>
						<div>
							<div className="text-[24px] font-bold text-gray-900 leading-none">
								{analytics?.totalMessages || 0}
							</div>
							<div className="text-[12px] text-gray-500 font-medium mt-0.5">Total Messages</div>
						</div>
					</div>
				</div>
				<div className={`${CARD} p-6`}>
					<div className="flex items-center gap-3 mb-3">
						<div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
							<Hash className="w-5 h-5 text-[#FF9500]" />
						</div>
						<div>
							<div className="text-[24px] font-bold text-gray-900 leading-none">
								{analytics?.activeChannels?.length || 0}
							</div>
							<div className="text-[12px] text-gray-500 font-medium mt-0.5">Active Channels</div>
						</div>
					</div>
				</div>
			</div>

			{/* Team Members Table */}
			<div className={`${CARD} p-6`}>
				<div className="flex items-center justify-between mb-6">
					<div>
						<h3 className="font-semibold text-[17px] text-gray-900 tracking-tight flex items-center gap-2">
							<Users className="w-5 h-5 text-gray-400" />
							Team Members
						</h3>
						<h4 className="text-[13px] text-gray-500 mt-1">All members in your workspace</h4>
					</div>
				</div>

				{!members || members.length === 0 ? (
					<div className="text-center py-16">
						<Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
						<p className="text-[15px] font-semibold text-gray-400">No team members</p>
						<p className="text-[13px] text-gray-400 mt-1">Invite members to get started</p>
					</div>
				) : (
					<div className="space-y-1">
						{members.map((member: any) => {
							const name = member.profile
								? [member.profile.firstName, member.profile.lastName].filter(Boolean).join(" ") ||
									member.profile.email
								: member.userId.slice(0, 8);
							const initials = name.substring(0, 2).toUpperCase();
							return (
								<div
									key={member.id}
									className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50/50 transition-colors"
								>
									<div className="relative">
										<Avatar className="w-10 h-10 shadow-sm border border-white/80">
											<AvatarImage
												src={member.profile?.imageUrl || undefined}
												alt={name}
												referrerPolicy="no-referrer"
											/>
											<AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-[12px] font-bold">
												{initials}
											</AvatarFallback>
										</Avatar>
										{member.online && (
											<span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#34C759] rounded-full border-2 border-white z-10" />
										)}
									</div>
									<div className="flex-1 min-w-0">
										<div className="text-[14px] font-semibold text-gray-900">{name}</div>
										<div className="text-[12px] text-gray-400">{member.profile?.email}</div>
									</div>
									<div className="text-[11px] font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg uppercase tracking-wider">
										{member.role || "Member"}
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}

/* ═══════════════════════════════════════════════
   Shared: Activity Table Component
   ═══════════════════════════════════════════════ */
function ActivityTable({
	isLoaded,
	activity,
	maxRows,
}: {
	isLoaded: boolean;
	activity: any[];
	maxRows?: number;
}) {
	const rows = maxRows ? activity?.slice(0, maxRows) : activity;
	return (
		<div className="overflow-x-auto">
			<table className="w-full text-left border-collapse">
				<thead>
					<tr className="border-b border-gray-100">
						<th className="pb-3 px-2 text-[12px] font-medium text-gray-400">User</th>
						<th className="pb-3 px-2 text-[12px] font-medium text-gray-400">Action</th>
						<th className="pb-3 px-2 text-[12px] font-medium text-gray-400">Channel / Type</th>
						<th className="pb-3 px-2 text-[12px] font-medium text-gray-400">Time</th>
					</tr>
				</thead>
				<tbody className="text-[13px]">
					{!isLoaded ? (
						["s1", "s2", "s3", "s4"].map((k) => (
							<tr key={k} className="border-b border-gray-50">
								<td colSpan={4} className="py-4">
									<div className="h-4 bg-gray-100 animate-pulse rounded max-w-md mx-auto" />
								</td>
							</tr>
						))
					) : rows?.length === 0 ? (
						<tr>
							<td colSpan={4} className="py-8 text-center text-gray-400 text-sm">
								No recent activity
							</td>
						</tr>
					) : (
						rows?.map((msg: any) => (
							<tr
								key={msg.id}
								className="border-b border-gray-50/50 hover:bg-gray-50/50 transition-colors"
							>
								<td className="py-3 px-2 font-medium text-gray-900 flex items-center gap-3">
									<Avatar className="w-7 h-7 shadow-sm border border-white/80">
										<AvatarImage
											src={msg.user.imageUrl}
											alt={msg.user.firstName || msg.user.email}
											referrerPolicy="no-referrer"
										/>
										<AvatarFallback className="bg-gradient-to-tr from-blue-500 to-indigo-500 text-white text-[10px] font-bold">
											{(msg.user.firstName || msg.user.email)[0].toUpperCase()}
										</AvatarFallback>
									</Avatar>
									{msg.user.firstName || msg.user.email.split("@")[0]}
								</td>
								<td className="py-3 px-2 text-gray-500 max-w-[200px] truncate">
									{msg.content.replace(/<[^>]*>?/gm, "").substring(0, 30)}...
								</td>
								<td className="py-3 px-2 text-gray-500">
									<span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600">
										{msg.channel.type === "DIRECT_MESSAGE" ? "DM" : `#${msg.channel.name}`}
									</span>
								</td>
								<td className="py-3 px-2 text-gray-400 text-[12px]">
									{new Date(msg.createdAt).toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit",
									})}
								</td>
							</tr>
						))
					)}
				</tbody>
			</table>
		</div>
	);
}
