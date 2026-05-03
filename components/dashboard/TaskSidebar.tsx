"use client";

import { Inbox, MoreHorizontal, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const UI = {
	bg: "#1b1b1b",
	card: "rgba(0,0,0,0.2)",
	border: "rgba(255,255,255,0.08)",
	text: "#FFFFFF",
	muted: "rgba(255,255,255,0.6)",
};

const MOCK_TASKS = [
	{ id: "1", title: "Refactor task backend service" },
	{ id: "2", title: "Update inbox sidebar width" },
	{ id: "3", title: "Simplify task card design" },
	{ id: "4", title: "Remove legacy icons and text" },
	{ id: "5", title: "Finalize dashboard layout" },
];

export function TaskSidebar() {
	return (
		<div className="h-full w-[400px] p-6">
			<div
				className="h-full w-full rounded-[34px] border overflow-hidden shadow-2xl flex flex-col"
				style={{
					backgroundColor: UI.bg,
					borderColor: UI.border,
				}}
			>
				{/* Header */}
				<div className="px-6 py-5 border-b" style={{ borderColor: UI.border }}>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Inbox className="w-5 h-5 text-white/80" />
							<h1 className="text-[16px] font-bold" style={{ color: UI.text }}>
								Inbox
							</h1>
						</div>
						<div className="flex items-center gap-2">
							<button type="button" className="p-2 rounded hover:bg-white/5 transition-colors">
								<MoreHorizontal className="w-4 h-4" style={{ color: UI.muted }} />
							</button>
						</div>
					</div>
				</div>

				{/* Content */}
				<ScrollArea className="flex-1">
					<div className="p-3 space-y-2">
						{MOCK_TASKS.map((task, idx) => (
							<div
								key={task.id}
								className="w-full rounded-lg p-3 transition-all hover:bg-black/30 cursor-pointer"
								style={{
									backgroundColor: UI.card,
									animation: `fadeIn 0.3s ease-out ${idx * 0.04}s both`,
								}}
							>
								<p className="text-[14px] font-medium leading-relaxed" style={{ color: UI.text }}>
									{task.title}
								</p>
							</div>
						))}

						<button
							className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-black/20 text-[13px] font-medium mt-2"
							style={{ color: UI.text }}
						>
							<Plus className="w-4 h-4" />
							Add a card
						</button>
					</div>
				</ScrollArea>
			</div>

			<style>{`
				@keyframes fadeIn {
					from { opacity: 0; transform: translateY(8px); }
					to { opacity: 1; transform: translateY(0); }
				}
			`}</style>
		</div>
	);
}
