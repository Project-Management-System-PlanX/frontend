"use client";

import { CheckCircle2, MoreHorizontal, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const MOCK_TASKS = [
	{ id: "1", title: "Review architectural changes", status: "TODO", color: "#5c4a1c" },
	{ id: "2", title: "Update documentation for V2", status: "TODO", color: "#5c4a1c" },
	{ id: "3", title: "Simplify task area UI", status: "IN_PROGRESS", color: "#1e5a46" },
	{ id: "4", title: "Integrate mock data", status: "IN_PROGRESS", color: "#1e5a46" },
];

export function AssignedToMeTab() {
	return (
		<div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden p-6">
			<div
				className="flex-1 flex flex-col rounded-[34px] border overflow-hidden shadow-[0_26px_70px_rgba(0,0,0,0.35)]"
				style={{ backgroundColor: "rgba(0,0,0,0.15)", borderColor: "rgba(255,255,255,0.1)" }}
			>
				<ScrollArea className="flex-1">
					<div className="py-10 px-10 max-w-5xl mx-auto space-y-8">
						<div className="flex items-center justify-between">
							<h2 className="text-[24px] font-bold text-white">Assigned to me</h2>
							<button className="flex items-center gap-2 px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 text-white text-[14px] font-medium transition-colors">
								<Plus className="w-4 h-4" />
								Add Task
							</button>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{MOCK_TASKS.map((task) => (
								<div
									key={task.id}
									className="rounded-2xl overflow-hidden shadow-xl flex flex-col min-h-[160px]"
									style={{ backgroundColor: task.color || "#1b1b1b" }}
								>
									<div className="p-5 flex flex-col h-full">
										<div className="flex items-start justify-between mb-4">
											<span className="text-[16px] font-bold text-white leading-tight">
												{task.title}
											</span>
											<button className="p-1 hover:bg-black/10 rounded transition-colors">
												<MoreHorizontal className="w-5 h-5 text-white/50" />
											</button>
										</div>

										<div className="mt-auto flex items-center justify-between pt-4 border-t border-white/10">
											<div className="flex items-center gap-2 text-[11px] font-bold text-white/50 uppercase tracking-widest">
												<div className="w-2 h-2 rounded-full bg-white/30" />
												{task.status.replace("_", " ")}
											</div>
											<button className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
												<CheckCircle2 className="w-4 h-4 text-white/30" />
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</ScrollArea>
			</div>
		</div>
	);
}
