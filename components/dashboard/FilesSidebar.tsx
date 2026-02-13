"use client";

import { Files, LayoutTemplate, ListTodo, Plus, Star } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { IconRail } from "./IconRail";

const navItems = [
	{
		label: "All files",
		icon: Files,
		href: "/dashboard/files",
		exact: true,
	},
	{
		label: "Canvases",
		icon: LayoutTemplate,
		href: "/dashboard/files/canvases",
		exact: false,
	},
	{
		label: "Lists",
		icon: ListTodo,
		href: "/dashboard/files/lists",
		exact: false,
	},
];

export function FilesSidebar() {
	const pathname = usePathname();

	return (
		<div
			className="flex h-full animate-[fadeInUp_0.35s_ease-out]"
			style={{ fontFamily: "var(--font-figtree), Figtree" }}
		>
			{/* Shared Icon Rail */}
			<IconRail />

			{/* Sidebar List */}
			<div className="w-56 bg-white flex flex-col border-r border-slate-200">
				{/* Header */}
				<div className="p-4 flex items-center justify-between">
					<span className="font-bold text-slate-900 text-lg">Files</span>
					<Button
						variant="ghost"
						size="icon"
						className="w-7 h-7 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
					>
						<Plus className="w-5 h-5" />
					</Button>
				</div>

				<ScrollArea className="flex-1">
					<div className="px-2 py-2">
						<div className="space-y-0.5">
							{navItems.map((item) => {
								const Icon = item.icon;
								const isActive = item.exact
									? pathname === item.href
									: pathname.startsWith(item.href);

								return (
									<Link
										key={item.href}
										href={item.href}
										className={cn(
											"flex items-center gap-3 w-full px-3 py-2 rounded-md transition-colors text-[14px]",
											isActive
												? "bg-[#0B6E4F]/10 text-[#0B6E4F] font-semibold"
												: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium",
										)}
									>
										<Icon
											className={cn("w-4 h-4", isActive ? "text-[#0B6E4F]" : "text-slate-500")}
										/>
										<span>{item.label}</span>
									</Link>
								);
							})}
						</div>

						{/* Starred Section */}
						<div className="mt-8 px-3">
							<div className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-2">
								Starred
							</div>
							<div className="text-[13px] text-slate-500 leading-relaxed">
								Click the{" "}
								<Star className="inline w-3.5 h-3.5 text-amber-400 fill-amber-400 mx-0.5 -mt-0.5" />{" "}
								star on any canvas or list to add it here for later.
							</div>
						</div>
					</div>
				</ScrollArea>
			</div>
		</div>
	);
}
