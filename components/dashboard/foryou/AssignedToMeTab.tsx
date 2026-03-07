import { CheckCircle2, Clock, MessageSquare, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTasksAssignedToMe } from "@/hooks/api/use-tasks";
import { useMemberLookup } from "@/hooks/use-member-lookup";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import type { Task } from "@/lib/types/models";

export function AssignedToMeTab() {
	const { token } = useSupabaseAuth();
	const { data: serverTasks, isLoading } = useTasksAssignedToMe(token || undefined);
	const { getMember } = useMemberLookup();
	const tasks = serverTasks || [];
	if (isLoading) {
		return <div className="text-center py-16 text-slate-400">Loading assigned tasks...</div>;
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
											<div className="flex items-center gap-1.5">
												<Avatar className="w-4 h-4">
													<AvatarImage src={getMember(task.reporterId).imageUrl} />
													<AvatarFallback className="text-[8px] bg-slate-100 uppercase">
														{getMember(task.reporterId).initials}
													</AvatarFallback>
												</Avatar>
												<span>{getMember(task.reporterId).name}</span>
											</div>
											<span>•</span>
											<div className="flex items-center gap-1">
												<Clock className="w-3 h-3" />
												<span>{new Date(task.createdAt).toLocaleDateString()}</span>
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
		<div className="flex flex-col items-center justify-center py-16 animate-[fadeInUp_0.5s_ease-out]">
			{/* Illustration */}
			<div className="relative mb-8 animate-[gentleFloat_3s_ease-in-out_infinite]">
				{/* Green check badge */}
				<div
					className="absolute -top-4 left-1/2 z-10"
					style={{
						animation: "bounceIn 0.6s ease-out 0.3s both, checkPulse 2s ease-in-out 1.2s infinite",
					}}
				>
					<div className="w-12 h-12 rounded-full bg-[#0B6E4F] flex items-center justify-center shadow-lg">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
							<title>Checkmark</title>
							<path
								d="M5 13l4 4L19 7"
								stroke="white"
								strokeWidth="2.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</div>
					{/* Stem below circle */}
					<div className="w-3 h-4 bg-[#0B6E4F] mx-auto rounded-b-sm" />
				</div>

				{/* Laptop / Monitor SVG */}
				<svg
					width="240"
					height="150"
					viewBox="0 0 240 150"
					fill="none"
					className="drop-shadow-lg"
					role="img"
					aria-label="No assigned items illustration"
				>
					<title>No assigned items illustration</title>
					{/* Monitor body */}
					<rect
						x="30"
						y="20"
						width="180"
						height="110"
						rx="8"
						fill="#f1f5f9"
						stroke="#e2e8f0"
						strokeWidth="1.5"
					/>
					{/* Screen */}
					<rect x="38" y="28" width="164" height="86" rx="4" fill="white" />
					{/* Top bar dots */}
					<circle cx="48" cy="36" r="2.5" fill="#94a3b8" />
					<circle cx="56" cy="36" r="2.5" fill="#0B6E4F" />
					<circle cx="64" cy="36" r="2.5" fill="#0B6E4F" />
					{/* Content blocks - left sidebar */}
					<rect x="44" y="44" width="50" height="6" rx="2" fill="#e2e8f0" />
					<rect x="44" y="54" width="40" height="5" rx="2" fill="#f1f5f9" />
					<rect x="44" y="63" width="45" height="5" rx="2" fill="#f1f5f9" />
					{/* Content blocks - main area (shimmer) */}
					<rect x="102" y="44" width="90" height="28" rx="4" fill="#dbeafe">
						<animate
							attributeName="opacity"
							values="0.6;1;0.6"
							dur="2.5s"
							repeatCount="indefinite"
						/>
					</rect>
					<rect x="110" y="50" width="50" height="4" rx="1.5" fill="#93c5fd">
						<animate
							attributeName="opacity"
							values="0.5;1;0.5"
							dur="2s"
							begin="0.3s"
							repeatCount="indefinite"
						/>
					</rect>
					<rect x="110" y="58" width="35" height="4" rx="1.5" fill="#bfdbfe">
						<animate
							attributeName="opacity"
							values="0.5;1;0.5"
							dur="2s"
							begin="0.6s"
							repeatCount="indefinite"
						/>
					</rect>
					{/* Bottom card (shimmer) */}
					<rect x="102" y="78" width="60" height="20" rx="4" fill="#d1fae5">
						<animate
							attributeName="opacity"
							values="0.6;1;0.6"
							dur="2.5s"
							begin="0.4s"
							repeatCount="indefinite"
						/>
					</rect>
					<rect x="110" y="84" width="36" height="4" rx="1.5" fill="#6ee7b7">
						<animate
							attributeName="opacity"
							values="0.5;1;0.5"
							dur="2s"
							begin="0.7s"
							repeatCount="indefinite"
						/>
					</rect>
					<rect x="110" y="92" width="24" height="3" rx="1" fill="#a7f3d0">
						<animate
							attributeName="opacity"
							values="0.5;1;0.5"
							dur="2s"
							begin="1s"
							repeatCount="indefinite"
						/>
					</rect>
					{/* Stand */}
					<rect x="95" y="130" width="50" height="4" rx="2" fill="#cbd5e1" />
					<rect x="112" y="122" width="16" height="10" rx="2" fill="#e2e8f0" />
				</svg>
			</div>

			{/* Text */}
			<h3 className="text-[15px] font-semibold text-slate-800 mb-2 animate-[fadeInUp_0.5s_ease-out_0.2s_both]">
				Find all your open work items in one place
			</h3>
			<p className="text-[13px] text-slate-400 animate-[fadeInUp_0.5s_ease-out_0.35s_both]">
				You have no open work items assigned to you
			</p>
		</div>
	);
}
