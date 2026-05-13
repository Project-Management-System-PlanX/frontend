import { CheckCircle2, Clock, MessageSquare, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTasksWorkedOn } from "@/hooks/api/use-tasks";
import { useMemberLookup } from "@/hooks/use-member-lookup";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import type { Task } from "@/lib/types/models";
import { useWorkspaceStore } from "@/stores/workspace-store";

export function WorkedOnTab() {
	const { token } = useSupabaseAuth();
	const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
	const { data: serverTasks, isLoading } = useTasksWorkedOn(
		activeWorkspaceId || "",
		token || undefined,
	);
	const { getMember } = useMemberLookup();
	const tasks = serverTasks || [];

	if (isLoading) {
		return <div className="text-center py-16 text-slate-400">Loading your reported tasks...</div>;
	}

	if (tasks.length > 0) {
		return (
			<div className="py-4 space-y-4 animate-[fadeInUp_0.3s_ease-out]">
				{tasks.map((task: Task) => (
					<div
						key={task.id}
						className="p-4 rounded-xl border border-[#e5e7eb] hover:bg-[#f9fafb] transition-colors group"
					>
						<div className="flex gap-3">
							<div className="mt-1">
								<button
									type="button"
									className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${task.resolution === "DONE" ? "bg-[#0B6E4F] border-[#0B6E4F]" : "border-slate-300 hover:border-[#0B6E4F]"}`}
								>
									{task.resolution === "DONE" && (
										<CheckCircle2 className="w-3.5 h-3.5 text-white" />
									)}
								</button>
							</div>

							<div className="flex-1 min-w-0">
								<div className="flex items-start justify-between">
									<div className="space-y-1">
										<p
											className={`text-[15px] font-medium leading-normal ${task.resolution === "DONE" ? "text-slate-500 line-through" : "text-[#202020]"}`}
										>
											{task.title}
										</p>

										<div className="flex items-center gap-2 text-xs text-slate-500">
											{task.assigneeId && (
												<div className="flex items-center gap-1.5">
													<Avatar className="w-4 h-4">
														<AvatarImage src={getMember(task.assigneeId).imageUrl} />
														<AvatarFallback className="text-[8px] bg-indigo-100 text-indigo-700 uppercase">
															{getMember(task.assigneeId).initials}
														</AvatarFallback>
													</Avatar>
													<span>Assigned to {getMember(task.assigneeId).name}</span>
													<span>•</span>
												</div>
											)}
											<div className="flex items-center gap-1">
												<Clock className="w-3 h-3" />
												<span>Updated {new Date(task.updatedAt).toLocaleDateString()}</span>
											</div>
											{task.dueDate && (
												<>
													<span>•</span>
													<span className="text-[#0B6E4F] font-medium bg-[#0B6E4F]/10 px-1.5 py-0.5 rounded">
														Due {new Date(task.dueDate).toLocaleDateString()}
													</span>
												</>
											)}
											{task.priority !== "NONE" && (
												<>
													<span>•</span>
													<Badge
														variant="secondary"
														className={`h-5 px-1.5 text-[10px] uppercase font-bold
														${
															task.priority === "CRITICAL" || task.priority === "HIGH"
																? "bg-red-50 text-red-600"
																: task.priority === "MEDIUM"
																	? "bg-amber-50 text-amber-600"
																	: "bg-blue-50 text-blue-600"
														}`}
													>
														{task.priority.toLowerCase()}
													</Badge>
												</>
											)}
										</div>
									</div>
								</div>

								{/* Bottom Actions Row */}
								<div className="mt-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
									<div className="flex items-center gap-2">
										{task.comments && task.comments.length > 0 ? (
											<Button
												variant="ghost"
												size="sm"
												className="h-7 text-slate-500 text-xs gap-1.5 px-2"
											>
												<MessageSquare className="w-3 h-3" />
												{task.comments.length} comments
											</Button>
										) : (
											<Button variant="ghost" size="sm" className="h-7 text-slate-500 text-xs px-2">
												Comment
											</Button>
										)}
									</div>
									<Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400">
										<MoreHorizontal className="w-4 h-4" />
									</Button>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		);
	}

	return (
		<div className="animate-[fadeInUp_0.35s_ease-out]">
			<div className="flex flex-col items-center justify-center py-16 text-center">
				<div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
					<Clock className="w-5 h-5 text-slate-400" />
				</div>
				<p className="text-sm text-slate-500 font-medium">No recent activity</p>
				<p className="text-xs text-slate-400 mt-1">Tasks you work on or report will appear here</p>
			</div>
		</div>
	);
}
