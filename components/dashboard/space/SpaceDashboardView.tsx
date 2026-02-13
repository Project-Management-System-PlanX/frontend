"use client";

import { useEffect, useRef } from "react";

/* ─── Mock Data ─── */
const statusData = [
	{ label: "Done", value: 14, color: "#0B6E4F" },
	{ label: "In Progress", value: 8, color: "#3B82F6" },
	{ label: "In Review", value: 5, color: "#F59E0B" },
	{ label: "To Do", value: 9, color: "#94A3B8" },
	{ label: "Blocked", value: 2, color: "#EF4444" },
];

const weeklyProgress = [
	{ week: "W1", done: 3, inProgress: 5, todo: 12 },
	{ week: "W2", done: 5, inProgress: 6, todo: 10 },
	{ week: "W3", done: 8, inProgress: 7, todo: 8 },
	{ week: "W4", done: 10, inProgress: 8, todo: 6 },
	{ week: "W5", done: 12, inProgress: 6, todo: 5 },
	{ week: "W6", done: 14, inProgress: 8, todo: 4 },
];

const teamWorkload = [
	{ name: "Ravikrishna", tasks: 8, completed: 5 },
	{ name: "Sarah Chen", tasks: 6, completed: 4 },
	{ name: "Alex Morgan", tasks: 7, completed: 3 },
	{ name: "Priya Patel", tasks: 5, completed: 4 },
	{ name: "James Lee", tasks: 4, completed: 2 },
];

const priorityData = [
	{ label: "Critical", value: 3, color: "#EF4444" },
	{ label: "High", value: 8, color: "#F97316" },
	{ label: "Medium", value: 15, color: "#3B82F6" },
	{ label: "Low", value: 12, color: "#94A3B8" },
];

/* ─── Donut Chart ─── */
function DonutChart({
	data,
	size = 180,
}: {
	data: { label: string; value: number; color: string }[];
	size?: number;
}) {
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

		const cx = size / 2;
		const cy = size / 2;
		const radius = size / 2 - 8;
		const innerRadius = radius * 0.62;
		let startAngle = -Math.PI / 2;

		for (const item of data) {
			const sweep = (item.value / total) * Math.PI * 2;
			ctx.beginPath();
			ctx.arc(cx, cy, radius, startAngle, startAngle + sweep);
			ctx.arc(cx, cy, innerRadius, startAngle + sweep, startAngle, true);
			ctx.closePath();
			ctx.fillStyle = item.color;
			ctx.fill();
			startAngle += sweep;
		}

		// Center text
		ctx.fillStyle = "#1e293b";
		ctx.font = "bold 28px Figtree, system-ui, sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(String(total), cx, cy - 8);
		ctx.fillStyle = "#94a3b8";
		ctx.font = "12px Figtree, system-ui, sans-serif";
		ctx.fillText("Total", cx, cy + 12);
	}, [data, size, total]);

	return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
}

/* ─── Bar Chart ─── */
function BarChart({
	data,
}: {
	data: { week: string; done: number; inProgress: number; todo: number }[];
}) {
	const maxVal = Math.max(...data.map((d) => d.done + d.inProgress + d.todo));

	return (
		<div className="flex items-end gap-3 h-[140px] w-full">
			{data.map((d) => {
				const total = d.done + d.inProgress + d.todo;
				const h = (total / maxVal) * 100;
				const doneH = (d.done / total) * h;
				const progressH = (d.inProgress / total) * h;
				const todoH = (d.todo / total) * h;
				return (
					<div key={d.week} className="flex-1 flex flex-col items-center gap-1">
						<div
							className="w-full rounded-t-md flex flex-col-reverse overflow-hidden"
							style={{ height: `${h}%` }}
						>
							<div
								className="w-full transition-all duration-500"
								style={{
									height: `${doneH}%`,
									backgroundColor: "#0B6E4F",
								}}
							/>
							<div
								className="w-full transition-all duration-500"
								style={{
									height: `${progressH}%`,
									backgroundColor: "#3B82F6",
								}}
							/>
							<div
								className="w-full transition-all duration-500"
								style={{
									height: `${todoH}%`,
									backgroundColor: "#E2E8F0",
								}}
							/>
						</div>
						<span className="text-[10px] text-slate-400 font-medium">{d.week}</span>
					</div>
				);
			})}
		</div>
	);
}

/* ─── Workload Bars ─── */
function WorkloadBars({ data }: { data: { name: string; tasks: number; completed: number }[] }) {
	const maxTasks = Math.max(...data.map((d) => d.tasks));

	return (
		<div className="space-y-3">
			{data.map((d) => (
				<div key={d.name} className="flex items-center gap-3">
					<div className="w-20 shrink-0">
						<span className="text-xs text-slate-600 font-medium truncate block">
							{d.name.split(" ")[0]}
						</span>
					</div>
					<div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden relative">
						<div
							className="h-full bg-gradient-to-r from-[#0B6E4F] to-emerald-400 rounded-full transition-all duration-700"
							style={{
								width: `${(d.completed / maxTasks) * 100}%`,
							}}
						/>
						<div
							className="absolute top-0 left-0 h-full border-2 border-slate-300 border-dashed rounded-full pointer-events-none"
							style={{
								width: `${(d.tasks / maxTasks) * 100}%`,
							}}
						/>
					</div>
					<span className="text-xs tabular-nums text-slate-500 font-medium w-10 text-right">
						{d.completed}/{d.tasks}
					</span>
				</div>
			))}
		</div>
	);
}

/* ─── Main View ─── */
export function SpaceChartView() {
	return (
		<div
			className="flex-1 overflow-auto bg-slate-50/50 animate-[fadeInUp_0.35s_ease-out]"
			style={{ fontFamily: "var(--font-figtree), Figtree" }}
		>
			<div className="p-6 max-w-[1200px] mx-auto">
				{/* Summary Stats */}
				<div className="grid grid-cols-4 gap-4 mb-6">
					{[
						{
							label: "Total Tasks",
							value: "38",
							change: "+4",
							color: "bg-slate-900",
						},
						{
							label: "Completed",
							value: "14",
							change: "+3",
							color: "bg-[#0B6E4F]",
						},
						{
							label: "In Progress",
							value: "8",
							change: "0",
							color: "bg-blue-500",
						},
						{
							label: "Overdue",
							value: "2",
							change: "-1",
							color: "bg-red-500",
						},
					].map((stat) => (
						<div
							key={stat.label}
							className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
						>
							<div className="flex items-center justify-between mb-3">
								<span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
									{stat.label}
								</span>
								<div className={`w-2 h-2 rounded-full ${stat.color}`} />
							</div>
							<div className="flex items-end gap-2">
								<span className="text-3xl font-bold text-slate-900">{stat.value}</span>
								<span
									className={`text-xs font-semibold mb-1 ${
										stat.change.startsWith("+")
											? "text-emerald-500"
											: stat.change.startsWith("-")
												? "text-red-500"
												: "text-slate-400"
									}`}
								>
									{stat.change} this week
								</span>
							</div>
						</div>
					))}
				</div>

				{/* Charts Row */}
				<div className="grid grid-cols-2 gap-5 mb-5">
					{/* Status Breakdown */}
					<div className="bg-white rounded-xl border border-slate-200 p-6">
						<h3 className="text-sm font-bold text-slate-800 mb-5">Status Overview</h3>
						<div className="flex items-center gap-6">
							<DonutChart data={statusData} size={160} />
							<div className="space-y-2.5 flex-1">
								{statusData.map((item) => (
									<div key={item.label} className="flex items-center justify-between">
										<div className="flex items-center gap-2.5">
											<div
												className="w-3 h-3 rounded-full"
												style={{ backgroundColor: item.color }}
											/>
											<span className="text-sm text-slate-600">{item.label}</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="text-sm font-bold text-slate-800">{item.value}</span>
											<span className="text-xs text-slate-400">
												{Math.round((item.value / 38) * 100)}%
											</span>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Weekly Progress */}
					<div className="bg-white rounded-xl border border-slate-200 p-6">
						<h3 className="text-sm font-bold text-slate-800 mb-2">Weekly Progress</h3>
						<div className="flex items-center gap-4 mb-4">
							{[
								{ label: "Done", color: "#0B6E4F" },
								{ label: "In Progress", color: "#3B82F6" },
								{ label: "To Do", color: "#E2E8F0" },
							].map((l) => (
								<div key={l.label} className="flex items-center gap-1.5">
									<div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: l.color }} />
									<span className="text-[11px] text-slate-500">{l.label}</span>
								</div>
							))}
						</div>
						<BarChart data={weeklyProgress} />
					</div>
				</div>

				{/* Bottom Row */}
				<div className="grid grid-cols-2 gap-5">
					{/* Team Workload */}
					<div className="bg-white rounded-xl border border-slate-200 p-6">
						<h3 className="text-sm font-bold text-slate-800 mb-2">Team Workload</h3>
						<p className="text-[11px] text-slate-400 mb-5">Completed vs assigned tasks</p>
						<WorkloadBars data={teamWorkload} />
					</div>

					{/* Priority Distribution */}
					<div className="bg-white rounded-xl border border-slate-200 p-6">
						<h3 className="text-sm font-bold text-slate-800 mb-5">Priority Distribution</h3>
						<div className="space-y-4">
							{priorityData.map((item) => (
								<div key={item.label}>
									<div className="flex items-center justify-between mb-1.5">
										<div className="flex items-center gap-2">
											<div
												className="w-2.5 h-2.5 rounded-full"
												style={{ backgroundColor: item.color }}
											/>
											<span className="text-sm text-slate-600 font-medium">{item.label}</span>
										</div>
										<span className="text-sm font-bold text-slate-800">{item.value}</span>
									</div>
									<div className="h-2 bg-slate-100 rounded-full overflow-hidden">
										<div
											className="h-full rounded-full transition-all duration-700"
											style={{
												width: `${(item.value / 38) * 100}%`,
												backgroundColor: item.color,
											}}
										/>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
