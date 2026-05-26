import {
	ArrowDown,
	ArrowUpDown,
	Check,
	CheckSquare,
	ChevronDown,
	ChevronUp,
	CornerUpLeft,
	Eye,
	Filter,
	Lock,
	MoreHorizontal,
	Plus,
	RotateCw,
	Share2,
	User,
	X,
	Zap,
} from "lucide-react";
import type { KeyboardEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function SpaceColumnView() {
	// State for subtasks interaction
	const [subtasks, setSubtasks] = useState<{ id: string; title: string }[]>([]);
	const [isAddingSubtask, setIsAddingSubtask] = useState(false);
	const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
	const [description, setDescription] = useState("");
	const subtaskInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (isAddingSubtask && subtaskInputRef.current) {
			subtaskInputRef.current.focus();
		}
	}, [isAddingSubtask]);

	const handleAddSubtask = () => {
		if (!newSubtaskTitle.trim()) {
			setIsAddingSubtask(false);
			return;
		}
		// Generate pseudo ID
		const newId = `KAN-${Math.floor(Math.random() * 1000) + 10}`;
		setSubtasks([...subtasks, { id: newId, title: newSubtaskTitle }]);
		setNewSubtaskTitle("");
		setIsAddingSubtask(false);
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter") {
			handleAddSubtask();
		} else if (e.key === "Escape") {
			setIsAddingSubtask(false);
			setNewSubtaskTitle("");
		}
	};

	return (
		<div className="flex-1 flex overflow-hidden border-t border-slate-200 animate-[fadeInUp_0.35s_ease-out]">
			{/* Left Pane - List */}
			<div className="w-[320px] bg-slate-50 flex flex-col border-r border-slate-200">
				<div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
					<button
						type="button"
						className="flex items-center gap-1 text-[12px] font-semibold text-slate-700 hover:text-slate-900"
					>
						Created <ChevronDown className="w-3 h-3 text-slate-400" />
					</button>
					<div className="flex items-center gap-2">
						<button type="button" className="p-1 hover:bg-slate-200 rounded">
							<ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
						</button>
						<button type="button" className="p-1 hover:bg-slate-200 rounded">
							<RotateCw className="w-3.5 h-3.5 text-slate-500" />
						</button>
					</div>
				</div>
				<ScrollArea className="flex-1">
					<div className="px-2 pt-2 pb-4 space-y-1">
						<ColumnListItem id="KAN-4" title="do" active />
						{/* Render Dynamic Subtasks in List */}
						{subtasks.map((st) => (
							<ColumnListItem key={st.id} id={st.id} title={st.title} subtask />
						))}
						<ColumnListItem id="KAN-2" title="Task 2" />
						<ColumnListItem id="KAN-1" title="Task 1" />
					</div>
				</ScrollArea>
				<div className="px-4 py-2 border-t border-slate-200 text-[11px] text-slate-400">
					{3 + subtasks.length} of {3 + subtasks.length}
				</div>
			</div>

			{/* Middle Pane - Detail */}
			<div className="flex-1 bg-white flex flex-col min-w-0">
				<div className="px-8 py-6 flex-1 overflow-y-auto">
					{/* Breadcrumbs / Top Nav */}
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-2 text-[13px] text-slate-500">
							<button
								type="button"
								className="flex items-center gap-1 hover:bg-slate-100 px-1.5 py-0.5 rounded transition-colors"
							>
								<CornerUpLeft className="w-3 h-3" /> Add epic
							</button>
							<span>/</span>
							<div className="flex items-center gap-1.5">
								<CheckSquare className="w-3.5 h-3.5 text-blue-600" />
								<span className="font-medium text-slate-700">KAN-4</span>
							</div>
						</div>
						<div className="flex items-center gap-1">
							<button type="button" className="p-1 hover:bg-slate-100 rounded text-slate-500">
								<ChevronUp className="w-4 h-4" />
							</button>
							<button type="button" className="p-1 hover:bg-slate-100 rounded text-slate-500">
								<ChevronDown className="w-4 h-4" />
							</button>
						</div>
					</div>

					{/* Title */}
					<h1 className="text-2xl font-semibold text-slate-900 mb-4">do</h1>

					{/* Title Action Bar */}
					<div className="flex items-center gap-2 mb-8">
						<button
							type="button"
							className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded text-slate-600"
						>
							<Plus className="w-4 h-4" />
						</button>
						<button
							type="button"
							className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded text-slate-600"
						>
							<MoreHorizontal className="w-4 h-4" />
						</button>
					</div>

					{/* Description - Now Editable */}
					<div className="mb-8 group">
						<h3 className="text-[13px] font-semibold text-slate-900 mb-2">Description</h3>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Add a description..."
							className="w-full text-[14px] text-slate-700 placeholder:text-slate-500 bg-transparent resize-none outline-none focus:bg-slate-50 -ml-2 p-2 rounded-md transition-colors min-h-[40px] focus:min-h-[100px]"
						/>
					</div>

					{/* Subtasks - Now Interactive */}
					<div className="mb-8">
						<h3 className="text-[13px] font-semibold text-slate-900 mb-2">Subtasks</h3>

						{/* List of subtasks in detail view */}
						{subtasks.length > 0 && (
							<div className="mb-2 space-y-1">
								{subtasks.map((st) => (
									<div
										key={st.id}
										className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded -ml-1.5 group/item"
									>
										<div className="flex items-center justify-center w-5 h-5">
											<ArrowDown className="w-3.5 h-3.5 text-slate-400" />
										</div>
										<button
											type="button"
											className="text-[13px] text-blue-600 font-medium hover:underline cursor-pointer"
										>
											{st.id}
										</button>
										<span className="text-[13px] text-slate-700">{st.title}</span>
										<div className="ml-auto opacity-0 group-hover/item:opacity-100 flex items-center gap-1">
											<div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">
												U
											</div>
											<button
												type="button"
												className="p-1 hover:bg-slate-200 rounded text-red-500 cursor-pointer"
												onClick={() => {
													setSubtasks(subtasks.filter((s) => s.id !== st.id));
												}}
											>
												<X className="w-3 h-3" />
											</button>
										</div>
									</div>
								))}
							</div>
						)}

						{isAddingSubtask ? (
							<div className="flex items-center gap-2 -ml-1.5 p-1.5">
								<input
									ref={subtaskInputRef}
									type="text"
									value={newSubtaskTitle}
									onChange={(e) => setNewSubtaskTitle(e.target.value)}
									onKeyDown={handleKeyDown}
									placeholder="What needs to be done?"
									className="flex-1 text-[13px] border border-blue-500 rounded px-2 py-1 outline-none shadow-sm"
								/>
								<button
									type="button"
									onClick={handleAddSubtask}
									className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700"
								>
									<Check className="w-3.5 h-3.5" />
								</button>
								<button
									type="button"
									onClick={() => setIsAddingSubtask(false)}
									className="bg-slate-100 text-slate-600 p-1 rounded hover:bg-slate-200"
								>
									<X className="w-3.5 h-3.5" />
								</button>
							</div>
						) : (
							<button
								type="button"
								onClick={() => setIsAddingSubtask(true)}
								className="flex items-center gap-2 text-[13px] text-slate-500 hover:bg-slate-50 w-full p-1.5 rounded -ml-1.5 transition-colors group"
							>
								<Plus className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
								<span>Add subtask</span>
							</button>
						)}
					</div>

					{/* Linked work items */}
					<div className="mb-8">
						<h3 className="text-[13px] font-semibold text-slate-900 mb-2">Linked work items</h3>
						<button
							type="button"
							className="flex items-center gap-2 text-[13px] text-slate-500 hover:bg-slate-50 w-full p-1.5 rounded -ml-1.5 transition-colors group"
						>
							<Plus className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
							<span>Add linked work item</span>
						</button>
					</div>

					{/* Activity (Same as before) */}
					<div>
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-[13px] font-semibold text-slate-900">Activity</h3>
							<div className="flex items-center gap-1.5">
								<div className="flex items-center bg-slate-100 p-0.5 rounded text-[12px] font-medium text-slate-600">
									<button type="button" className="px-2 py-0.5 hover:text-slate-900">
										All
									</button>
									<button
										type="button"
										className="px-2 py-0.5 bg-white shadow-sm rounded text-slate-900"
									>
										Comments
									</button>
									<button type="button" className="px-2 py-0.5 hover:text-slate-900">
										History
									</button>
									<button type="button" className="px-2 py-0.5 hover:text-slate-900">
										Work log
									</button>
								</div>
								<button type="button" className="p-1 hover:bg-slate-100 rounded">
									<Filter className="w-3.5 h-3.5 text-slate-400" />
								</button>
							</div>
						</div>

						<div className="flex gap-3">
							<div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-bold border border-emerald-200 shrink-0">
								RK
							</div>
							<div className="flex-1">
								<div className="border border-slate-200 rounded-md bg-white focus-within:ring-1 focus-within:ring-[#0B6E4F] transition-all">
									<textarea
										placeholder="Add a comment..."
										className="w-full min-h-[60px] p-3 text-[14px] bg-transparent outline-none resize-none placeholder-slate-400"
									/>
									<div className="px-2 pb-2 flex gap-2">
										<button
											type="button"
											className="px-2 py-1 bg-slate-100 text-[11px] font-medium text-slate-600 rounded hover:bg-slate-200"
										>
											Who is working on this...?
										</button>
										<button
											type="button"
											className="px-2 py-1 bg-slate-100 text-[11px] font-medium text-slate-600 rounded hover:bg-slate-200"
										>
											Can I get more info...?
										</button>
										<button
											type="button"
											className="px-2 py-1 bg-slate-100 text-[11px] font-medium text-slate-600 rounded hover:bg-slate-200"
										>
											Status update...
										</button>
									</div>
								</div>
								<div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
									Pro tip: press{" "}
									<span className="font-bold text-slate-600 bg-slate-100 px-1 rounded">M</span> to
									comment
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Right Pane - Meta (Same as before) */}
			<div className="w-[300px] border-l border-slate-200 bg-white flex flex-col overflow-y-auto">
				<div className="p-4 border-b border-slate-200 flex items-center justify-between gap-2 sticky top-0 bg-white z-10">
					<div className="flex items-center gap-2">
						<button
							type="button"
							className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1.5 rounded-md text-[13px] font-semibold hover:bg-green-200 transition-colors"
						>
							Done <ChevronDown className="w-3 h-3" />
						</button>
						<button
							type="button"
							className="flex items-center gap-1 px-2 py-1.5 text-[12px] font-medium text-slate-500 hover:bg-slate-100 rounded"
						>
							<Check className="w-3 h-3" /> Done
						</button>
						<button
							type="button"
							className="flex items-center gap-1 px-2 py-1.5 text-[12px] font-medium text-slate-500 hover:bg-slate-100 rounded"
						>
							<Zap className="w-3 h-3" /> Improve Task
						</button>
					</div>
					<div className="flex items-center gap-1">
						<button type="button" className="p-1.5 text-slate-500 hover:bg-slate-100 rounded">
							<Lock className="w-4 h-4" />
						</button>
						<div className="flex items-center gap-1 px-1.5 py-1 bg-slate-100 rounded text-[11px] font-medium text-slate-600">
							<Eye className="w-3 h-3" /> 1
						</div>
						<button type="button" className="p-1.5 text-slate-500 hover:bg-slate-100 rounded">
							<Share2 className="w-4 h-4" />
						</button>
						<button type="button" className="p-1.5 text-slate-500 hover:bg-slate-100 rounded">
							<MoreHorizontal className="w-4 h-4" />
						</button>
					</div>
				</div>

				<div className="p-4 space-y-6">
					{/* Details Accordion Group (Same as before) */}
					<div>
						<button
							type="button"
							className="w-full flex items-center justify-between text-[13px] font-semibold text-slate-900 mb-3 hover:bg-slate-50 p-1 -ml-1 rounded"
						>
							Details <ChevronDown className="w-4 h-4" />
						</button>
						<div className="space-y-4 pl-1">
							<MetaField label="Assignee">
								<button
									type="button"
									className="flex items-center gap-2 group cursor-pointer text-left w-full"
								>
									<div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
										<User className="w-3 h-3" />
									</div>
									<div>
										<div className="text-[13px] text-slate-500">Unassigned</div>
										<div className="text-[12px] text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
											Assign to me
										</div>
									</div>
								</button>
							</MetaField>

							<MetaField label="Priority">
								<div className="flex items-center gap-2">
									<div className="flex flex-col gap-[2px]">
										<div className="w-3 h-[2px] bg-emerald-400" />
										<div className="w-3 h-[2px] bg-emerald-400" />
									</div>
									<span className="text-[13px] text-slate-700 font-medium">= Medium</span>
								</div>
							</MetaField>

							<MetaField label="Parent">
								<span className="text-[13px] text-slate-500">None</span>
							</MetaField>

							<MetaField label="Due date">
								<span className="text-[13px] text-slate-500">None</span>
							</MetaField>

							<MetaField label="Labels">
								<span className="text-[13px] text-slate-500">None</span>
							</MetaField>

							<MetaField label="Team">
								<span className="text-[13px] text-slate-500">None</span>
							</MetaField>

							<MetaField label="Start date">
								<span className="text-[13px] text-slate-500">None</span>
							</MetaField>

							<MetaField label="Development">
								<div className="space-y-1">
									<button
										type="button"
										className="flex items-center gap-1 text-[13px] text-blue-600 hover:underline cursor-pointer w-full text-left"
									>
										<Share2 className="w-3 h-3 rotate-90" /> Create branch{" "}
										<ChevronDown className="w-3 h-3 ml-auto" />
									</button>
									<button
										type="button"
										className="flex items-center gap-1 text-[13px] text-blue-600 hover:underline cursor-pointer w-full text-left"
									>
										<Share2 className="w-3 h-3 rotate-90" /> Create commit{" "}
										<ChevronDown className="w-3 h-3 ml-auto" />
									</button>
								</div>
							</MetaField>

							<MetaField label="Reporter">
								<div className="flex items-center gap-2">
									<div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 border border-slate-200">
										<User className="w-3 h-3" />
									</div>
									<span className="text-[13px] text-slate-500">Unassigned</span>
								</div>
							</MetaField>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function ColumnListItem({
	id,
	title,
	active,
	subtask,
}: {
	id: string;
	title: string;
	active?: boolean;
	subtask?: boolean;
}) {
	return (
		<button
			type="button"
			className={`group flex flex-col px-2 py-2.5 rounded-lg cursor-pointer border transition-all text-left w-full ${
				active
					? "bg-white border-blue-200 shadow-[0_1px_3px_rgba(0,0,0,0.1)] relative z-10"
					: "border-transparent hover:bg-slate-200/50"
			} ${subtask ? "ml-4" : ""}`}
		>
			{/* Title Row */}
			<div className="flex items-start justify-between mb-1.5">
				<div
					className={`text-[14px] font-medium leading-tight ${active ? "text-blue-600" : "text-slate-700"}`}
				>
					{title}
				</div>
				{active && <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />}
			</div>

			{/* ID & Avatar Row */}
			<div className="flex items-center justify-between mt-auto">
				<div className="flex items-center gap-2">
					{subtask ? (
						<ArrowDown className="w-3.5 h-3.5 text-slate-400" />
					) : (
						<CheckSquare className={`w-3.5 h-3.5 ${active ? "text-blue-600" : "text-blue-600"}`} />
					)}
					<span
						className={`text-[11px] font-medium ${subtask ? "text-slate-400" : "text-slate-500"}`}
					>
						{id}
					</span>
				</div>

				<div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-[8px] font-bold border border-green-200/50 shrink-0">
					U
				</div>
			</div>
		</button>
	);
}

function MetaField({ label, children }: { label: string; children: ReactNode }) {
	return (
		<div className="grid grid-cols-[100px_1fr] gap-2 items-start">
			<span className="text-[12px] font-medium text-slate-500 pt-0.5">{label}</span>
			<div>{children}</div>
		</div>
	);
}
