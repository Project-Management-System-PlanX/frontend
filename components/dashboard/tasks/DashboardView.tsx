"use client";

import { MoreHorizontal } from "lucide-react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { useMemberLookup } from "@/hooks/use-member-lookup";
import type { Task } from "@/lib/types/models";
import { cn } from "@/lib/utils";
import type { Column } from "./types";

interface DashboardViewProps {
	tasks: Record<string, Task>;
	columns: Record<string, Column>;
	columnOrder: string[];
}

export function DashboardView({ tasks, columns, columnOrder }: DashboardViewProps) {
	const { getMember } = useMemberLookup();
	const allTasks = Object.values(tasks);

	// 1. Cards per list
	const cardsPerListData = columnOrder.map((id) => ({
		name: columns[id]?.name || "Unknown",
		count: columns[id]?.taskIds.length || 0,
	}));

	// 2. Cards per member
	const memberCounts: Record<string, number> = { Unassigned: 0 };
	for (const task of allTasks) {
		const member = task.assigneeId ? getMember(task.assigneeId) : null;
		const name = member?.name || "Unassigned";
		memberCounts[name] = (memberCounts[name] || 0) + 1;
	}
	const cardsPerMemberData = Object.entries(memberCounts).map(([name, count]) => ({
		name,
		count,
	}));

	// 3. Cards per label
	const labelCounts: Record<string, number> = {};
	for (const task of allTasks) {
		if (task.labels && task.labels.length > 0) {
			for (const label of task.labels) {
				labelCounts[label.name] = (labelCounts[label.name] || 0) + 1;
			}
		} else {
			labelCounts["No Label"] = (labelCounts["No Label"] || 0) + 1;
		}
	}
	const cardsPerLabelData = Object.entries(labelCounts).map(([name, count]) => ({
		name,
		count,
	}));

	// 4. Cards per due date
	const now = new Date();
	const dueDateCounts = {
		Complete: 0,
		"Due soon": 0,
		"Due later": 0,
		Overdue: 0,
		"No due date": 0,
	};

	for (const task of allTasks) {
		if (task.resolution === "RESOLVED") {
			dueDateCounts.Complete++;
			continue;
		}
		if (!task.dueDate) {
			dueDateCounts["No due date"]++;
			continue;
		}
		const d = new Date(task.dueDate);
		const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

		if (diffDays < 0) dueDateCounts.Overdue++;
		else if (diffDays <= 3) dueDateCounts["Due soon"]++;
		else dueDateCounts["Due later"]++;
	}
	const cardsPerDueDateData = Object.entries(dueDateCounts).map(([name, count]) => ({
		name,
		count,
	}));

	// 5. Trend (Mocking some trend data based on createdAt for now)
	const trendData = [
		{ date: "5/3/2026", Today: 2, "This Week": 2, Later: 3 },
		{ date: "5/4/2026", Today: 1, "This Week": 3, Later: 1 },
		{ date: "5/5/2026", Today: 1, "This Week": 3, Later: 1 },
		{ date: "5/6/2026", Today: 1, "This Week": 3, Later: 1 },
		{ date: "5/7/2026", Today: 1, "This Week": 2, Later: 1 },
		{ date: "5/8/2026", Today: 1, "This Week": 2, Later: 1 },
		{ date: "5/9/2026", Today: 3, "This Week": 1, Later: 0 },
	];

	return (
		<div className="flex-1 overflow-auto custom-scrollbar p-6 bg-[#2d2d44]">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Cards per List */}
				<ChartCard title="Cards per list">
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={cardsPerListData}>
							<CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
							<XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
							<YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
							<Tooltip
								contentStyle={{
									backgroundColor: "#3d3d54",
									border: "1px solid #505060",
									borderRadius: "8px",
								}}
								itemStyle={{ color: "#fff" }}
							/>
							<Bar dataKey="count" fill="#D1D5DB" radius={[4, 4, 0, 0]} />
						</BarChart>
					</ResponsiveContainer>
				</ChartCard>

				{/* Cards per Due Date */}
				<ChartCard title="Cards per due date">
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={cardsPerDueDateData} barCategoryGap="20%">
							<CartesianGrid strokeDasharray="3 3" stroke="#505060" vertical={false} />
							<XAxis
								dataKey="name"
								stroke="#a0a0b0"
								fontSize={11}
								tickLine={false}
								axisLine={false}
							/>
							<YAxis stroke="#a0a0b0" fontSize={12} tickLine={false} axisLine={false} />
							<Tooltip
								contentStyle={{
									backgroundColor: "#3d3d54",
									border: "1px solid #505060",
									borderRadius: "8px",
								}}
								itemStyle={{ color: "#fff" }}
							/>
							<Bar dataKey="count" radius={[4, 4, 0, 0]}>
								{cardsPerDueDateData.map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={entry.name === "Due later" ? "#e85d04" : "#505060"}
									/>
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				</ChartCard>

				{/* Cards per Member */}
				<ChartCard title="Cards per member">
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={cardsPerMemberData} barCategoryGap="20%">
							<CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
							<XAxis dataKey="name" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
							<YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
							<Tooltip
								contentStyle={{
									backgroundColor: "#1A1A1A",
									border: "1px solid #333",
									borderRadius: "8px",
								}}
								itemStyle={{ color: "#fff" }}
							/>
							<Bar dataKey="count" fill="#D1D5DB" radius={[4, 4, 0, 0]} />
						</BarChart>
					</ResponsiveContainer>
				</ChartCard>

				{/* Cards per Label */}
				<ChartCard title="Cards per label">
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={cardsPerLabelData} barCategoryGap="20%">
							<CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
							<XAxis dataKey="name" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
							<YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
							<Tooltip
								contentStyle={{
									backgroundColor: "#1A1A1A",
									border: "1px solid #333",
									borderRadius: "8px",
								}}
								itemStyle={{ color: "#fff" }}
							/>
							<Bar dataKey="count" radius={[4, 4, 0, 0]}>
								{cardsPerLabelData.map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={
											entry.name === "yellow"
												? "#856404"
												: entry.name === "green"
													? "#155724"
													: "#4B5563"
										}
									/>
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				</ChartCard>

				{/* Cards per List Trend */}
				<ChartCard title="Cards per list trend" className="lg:col-span-2">
					<ResponsiveContainer width="100%" height={400}>
						<LineChart data={trendData}>
							<CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
							<XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
							<YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
							<Tooltip
								contentStyle={{
									backgroundColor: "#1A1A1A",
									border: "1px solid #333",
									borderRadius: "8px",
								}}
								itemStyle={{ color: "#fff" }}
							/>
							<Legend />
							<Line
								type="monotone"
								dataKey="Today"
								stroke="#3B82F6"
								strokeWidth={3}
								dot={{ r: 4 }}
								activeDot={{ r: 6 }}
							/>
							<Line
								type="monotone"
								dataKey="This Week"
								stroke="#10B981"
								strokeWidth={3}
								dot={{ r: 4 }}
								activeDot={{ r: 6 }}
							/>
							<Line
								type="monotone"
								dataKey="Later"
								stroke="#e85d04"
								strokeWidth={3}
								dot={{ r: 4 }}
								activeDot={{ r: 6 }}
							/>
						</LineChart>
					</ResponsiveContainer>
				</ChartCard>
			</div>
		</div>
	);
}

function ChartCard({
	title,
	children,
	className,
}: {
	title: string;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn("bg-[#3d3d54] rounded-2xl p-6 border border-[#505060] shadow-xl", className)}
		>
			<div className="flex items-center justify-between mb-8">
				<h3 className="text-[16px] font-bold text-white tracking-tight">{title}</h3>
				<button className="p-1 hover:bg-white/5 rounded-md transition-colors text-white/40 hover:text-white">
					<MoreHorizontal className="w-5 h-5" />
				</button>
			</div>
			{children}
		</div>
	);
}
