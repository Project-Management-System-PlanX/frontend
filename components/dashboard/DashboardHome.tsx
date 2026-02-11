"use client";

import { ArrowRight, CheckSquare, FileText, MessageSquare, TrendingUp } from "lucide-react";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";

export function DashboardHome() {
	const stats = [
		{ label: "Total Messages", value: "1,234", icon: MessageSquare, color: "text-blue-600" },
		{ label: "Active Tasks", value: "28", icon: CheckSquare, color: "text-green-600" },
		{ label: "Files Shared", value: "156", icon: FileText, color: "text-purple-600" },
		{ label: "Team Activity", value: "+12%", icon: TrendingUp, color: "text-amber-600" },
	];

	const quickLinks = [
		{
			title: "Messages & Channels",
			description: "Chat with your team and manage channels",
			href: "/dashboard/chat",
			icon: MessageSquare,
			color: "bg-blue-50 text-blue-600",
		},
		{
			title: "Tasks & Projects",
			description: "Manage tasks and track project progress",
			href: "/dashboard/task",
			icon: CheckSquare,
			color: "bg-green-50 text-green-600",
		},
		{
			title: "Files & Documents",
			description: "Access and share team files",
			href: "/dashboard/files",
			icon: FileText,
			color: "bg-purple-50 text-purple-600",
		},
	];

	return (
		<div
			className="flex-1 flex flex-col bg-white min-w-0"
			style={{ fontFamily: "var(--font-figtree), Figtree" }}
		>
			{/* Dashboard Header */}
			<div className="h-14 px-6 flex items-center justify-between border-b border-[#e5e7eb] shrink-0">
				<div>
					<h1 className="text-xl font-semibold text-[#202020]">Dashboard</h1>
					<p className="text-sm text-slate-500">Welcome back to Team UP</p>
				</div>
			</div>

			{/* Dashboard Content */}
			<ScrollArea className="flex-1">
				<div className="p-6 space-y-6">
					{/* Stats Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{stats.map((stat) => {
							const Icon = stat.icon;
							return (
								<div
									key={stat.label}
									className="p-4 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-shadow"
								>
									<div className="flex items-center justify-between mb-2">
										<span className="text-sm text-slate-600">{stat.label}</span>
										<Icon className={`w-5 h-5 ${stat.color}`} />
									</div>
									<p className="text-2xl font-bold text-slate-900">{stat.value}</p>
								</div>
							);
						})}
					</div>

					{/* Quick Links */}
					<div>
						<h2 className="text-lg font-semibold text-[#202020] mb-4">Quick Access</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{quickLinks.map((link) => {
								const Icon = link.icon;
								return (
									<Link key={link.href} href={link.href}>
										<div className="p-5 rounded-xl border border-slate-200 hover:border-[#0B6E4F] bg-white hover:shadow-lg transition-all cursor-pointer group">
											<div className="flex items-start justify-between mb-3">
												<div
													className={`w-12 h-12 rounded-lg ${link.color} flex items-center justify-center`}
												>
													<Icon className="w-6 h-6" />
												</div>
												<ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-[#0B6E4F] group-hover:translate-x-1 transition-all" />
											</div>
											<h3 className="font-semibold text-[#202020] mb-1">{link.title}</h3>
											<p className="text-sm text-slate-500">{link.description}</p>
										</div>
									</Link>
								);
							})}
						</div>
					</div>

					{/* Recent Activity */}
					<div>
						<h2 className="text-lg font-semibold text-[#202020] mb-4">Recent Activity</h2>
						<div className="space-y-3">
							{[
								{
									action: "New message in #product-design",
									time: "5 minutes ago",
									type: "message",
								},
								{ action: "Task 'Dashboard UI' completed", time: "1 hour ago", type: "task" },
								{
									action: "File 'Dashboard_V3.fig' uploaded",
									time: "2 hours ago",
									type: "file",
								},
							].map((activity) => (
								<div
									key={activity.action}
									className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
								>
									<div className="w-2 h-2 rounded-full bg-[#0B6E4F]" />
									<div className="flex-1">
										<p className="text-sm text-slate-900">{activity.action}</p>
										<p className="text-xs text-slate-500">{activity.time}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</ScrollArea>
		</div>
	);
}
