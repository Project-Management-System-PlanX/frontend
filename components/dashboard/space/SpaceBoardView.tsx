import { motion } from "framer-motion";
import { Calendar, Check, CheckSquare, MoreHorizontal, Plus, User } from "lucide-react";
import type { CSSProperties, DragEvent, KeyboardEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

export function SpaceBoardView() {
	const [tasks, setTasks] = useState([
		{
			id: "KAN-1",
			title: "Task 1",
			columnId: "todo",
			date: "Feb 13, 2026",
			priority: "none",
			assignee: "Unassigned",
		},
		{
			id: "KAN-2",
			title: "Task 2",
			columnId: "inprogress",
			date: "Feb 20, 2026",
			priority: "none",
			assignee: "Unassigned",
		},
		{
			id: "KAN-4",
			title: "do",
			columnId: "done",
			date: "",
			priority: "medium",
			assignee: "Unassigned",
		},
	]);
	const [isCreating, setIsCreating] = useState(false);
	const [newTitle, setNewTitle] = useState("");
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const [showConfetti, setShowConfetti] = useState(false);

	useEffect(() => {
		if (isCreating && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isCreating]);

	const handleCreateTask = () => {
		if (!newTitle.trim()) {
			setIsCreating(false);
			return;
		}
		const newTask = {
			id: `KAN-${Math.floor(Math.random() * 1000) + 100}`,
			title: newTitle,
			columnId: "todo",
			date: new Date().toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric",
			}),
			priority: "none",
			assignee: "Unassigned",
		};
		setTasks((prev) => [...prev, newTask]);
		setNewTitle("");
		setIsCreating(false);
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleCreateTask();
		} else if (e.key === "Escape") {
			setIsCreating(false);
			setNewTitle("");
		}
	};

	const handleDragStart = (e: DragEvent, taskId: string) => {
		e.dataTransfer.setData("taskId", taskId);
		e.currentTarget.classList.add("opacity-50");
	};

	const handleDragEnd = (e: DragEvent) => {
		e.currentTarget.classList.remove("opacity-50");
	};

	const handleDrop = (e: DragEvent, targetColumnId: string) => {
		e.preventDefault();
		const taskId = e.dataTransfer.getData("taskId");
		if (!taskId) return;

		if (targetColumnId === "done") {
			setShowConfetti(true);
			setTimeout(() => setShowConfetti(false), 2500);
		}

		setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, columnId: targetColumnId } : t)));
	};

	const handleDragOver = (e: DragEvent) => {
		e.preventDefault();
	};

	const getTasks = (colId: string) => tasks.filter((t) => t.columnId === colId);

	return (
		<div className="flex-1 overflow-x-auto bg-slate-50/30 animate-[fadeInUp_0.35s_ease-out] relative">
			{showConfetti && <Confetti />}
			<div className="p-6 flex min-h-full min-w-max">
				{/* TO DO Column */}
				<BoardColumn
					title="TO DO"
					count={getTasks("todo").length}
					columnId="todo"
					onDrop={handleDrop}
					onDragOver={handleDragOver}
				>
					{getTasks("todo").map((task) => (
						<BoardCard
							key={task.id}
							{...task}
							onDragStart={handleDragStart}
							onDragEnd={handleDragEnd}
						/>
					))}
					{isCreating ? (
						<div className="bg-white p-3 rounded-md border-2 border-blue-600 shadow-sm animate-[fadeIn_0.2s_ease-out]">
							<textarea
								ref={inputRef}
								value={newTitle}
								onChange={(e) => setNewTitle(e.target.value)}
								onKeyDown={handleKeyDown}
								onBlur={() => {
									if (!newTitle.trim()) setIsCreating(false);
								}}
								placeholder="What needs to be done?"
								className="w-full text-[13px] text-slate-900 placeholder:text-slate-400 resize-none outline-none bg-transparent min-h-[40px]"
							/>
							<div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
								<div className="flex items-center gap-2">
									<button type="button" className="text-slate-400 hover:text-slate-600">
										<CheckSquare className="w-4 h-4" />
									</button>
									<button type="button" className="text-slate-400 hover:text-slate-600">
										<Calendar className="w-4 h-4" />
									</button>
									<button type="button" className="text-slate-400 hover:text-slate-600">
										<User className="w-4 h-4" />
									</button>
								</div>
								<div className="w-6 h-6 flex items-center justify-center rounded bg-slate-100 text-slate-500">
									<span className="text-[10px] font-bold">↵</span>
								</div>
							</div>
						</div>
					) : (
						<button
							type="button"
							onClick={() => setIsCreating(true)}
							className="flex items-center gap-2 px-1 mt-1 text-slate-500 hover:text-slate-800 cursor-pointer transition-colors w-full text-left"
						>
							<Plus className="w-4 h-4" />
							<span className="text-[13px] font-medium">Create</span>
						</button>
					)}
				</BoardColumn>

				<div className="w-px bg-slate-200 self-stretch mx-4" />

				{/* IN PROGRESS Column */}
				<BoardColumn
					title="IN PROGRESS"
					count={getTasks("inprogress").length}
					columnId="inprogress"
					onDrop={handleDrop}
					onDragOver={handleDragOver}
				>
					{getTasks("inprogress").map((task) => (
						<BoardCard
							key={task.id}
							{...task}
							hasActionMenu
							onDragStart={handleDragStart}
							onDragEnd={handleDragEnd}
						/>
					))}
				</BoardColumn>

				<div className="w-px bg-slate-200 self-stretch mx-4" />

				{/* DONE Column */}
				<BoardColumn
					title="DONE"
					count={getTasks("done").length}
					isDone
					columnId="done"
					onDrop={handleDrop}
					onDragOver={handleDragOver}
				>
					{getTasks("done").map((task) => (
						<BoardCard
							key={task.id}
							{...task}
							isDone
							onDragStart={handleDragStart}
							onDragEnd={handleDragEnd}
						/>
					))}
				</BoardColumn>

				<button
					type="button"
					className="w-8 h-8 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-500 mt-0.5 ml-4"
				>
					<Plus className="w-5 h-5" />
				</button>
			</div>
		</div>
	);
}

function BoardColumn({
	title,
	count,
	children,
	isDone,
	columnId,
	onDrop,
	onDragOver,
}: {
	title: string;
	count: number;
	children: ReactNode;
	isDone?: boolean;
	columnId: string;
	onDrop: (e: DragEvent, colId: string) => void;
	onDragOver: (e: DragEvent) => void;
}) {
	return (
		<ul
			className="flex flex-col w-[280px] h-full p-0 m-0 list-none"
			onDrop={(e) => onDrop(e, columnId)}
			onDragOver={onDragOver}
			aria-label={`${title} tasks`}
		>
			<div className="flex items-center justify-between mb-4 px-1">
				<div className="flex items-center gap-2">
					<span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
						{title}
					</span>
					<span className="px-1.5 py-0.5 rounded bg-slate-100 text-[11px] font-medium text-slate-600">
						{count}
					</span>
					{isDone && <Check className="w-3.5 h-3.5 text-green-600" />}
				</div>
				<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
					<button type="button" className="p-1 hover:bg-slate-200 rounded text-slate-500">
						<Plus className="w-3.5 h-3.5" />
					</button>
				</div>
			</div>
			<div className="flex flex-col gap-3 min-h-[100px]">{children}</div>
		</ul>
	);
}

interface BoardCardProps {
	id: string;
	title: string;
	date?: string;
	// priority: string; // Removed unused prop
	isDone?: boolean;
	hasActionMenu?: boolean;
	onDragStart: (e: DragEvent, id: string) => void;
	onDragEnd: (e: DragEvent) => void;
}

function BoardCard({
	id,
	title,
	date,
	// priority,
	isDone,
	hasActionMenu,
	onDragStart,
	onDragEnd,
}: BoardCardProps) {
	return (
		<li
			draggable
			onDragStart={(e) => onDragStart(e, id)}
			onDragEnd={onDragEnd}
			className="group bg-white p-3 rounded-md border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing list-none m-0"
		>
			<div className="flex items-start justify-between mb-2">
				<div className="text-[13px] font-medium text-slate-900 leading-tight">{title}</div>
				{hasActionMenu && (
					<button
						type="button"
						className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-100 rounded text-slate-400"
					>
						<MoreHorizontal className="w-3.5 h-3.5" />
					</button>
				)}
			</div>

			{date && (
				<div className="flex items-center gap-1.5 text-slate-500 mb-3">
					<Calendar className="w-3 h-3" />
					<span className="text-[11px] font-medium">{date}</span>
				</div>
			)}

			<div className="flex items-center justify-between mt-auto pt-1">
				<div className="flex items-center gap-2">
					{isDone ? (
						<CheckSquare className="w-3.5 h-3.5 text-blue-600" />
					) : (
						<div className="w-3.5 h-3.5 border-2 border-slate-300 rounded-[3px]" />
					)}
					<span
						className={`text-[11px] font-medium ${isDone ? "text-slate-400 line-through" : "text-slate-500"}`}
					>
						{id}
					</span>

					{isDone && (
						<>
							<Check className="w-3 h-3 text-green-600 ml-1" />
							<div className="flex flex-col gap-[2px]">
								<div className="w-2.5 h-[2px] bg-orange-400" />
								<div className="w-2.5 h-[2px] bg-orange-400" />
							</div>
						</>
					)}
				</div>

				<div className="flex items-center gap-1.5">
					{/* Avatars */}
					<div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
						<User className="w-3 h-3" />
					</div>
				</div>
			</div>
		</li>
	);
}

function Confetti() {
	const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"];
	return (
		<div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center overflow-hidden">
			{[...Array(50)].map((_, i) => {
				const shapeType = i % 3; // 0: square, 1: circle, 2: triangle
				const color = colors[i % colors.length];
				let className = "absolute w-2.5 h-2.5";
				let style: CSSProperties = { backgroundColor: color };

				if (shapeType === 0) {
					className += " rounded-sm"; // Square
				} else if (shapeType === 1) {
					className += " rounded-full"; // Circle
				} else {
					style = { ...style, clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }; // Triangle
				}

				// Randomize size slightly for rectangles sometimes
				if (shapeType === 0 && i % 2 === 0) {
					className = "absolute w-3 h-1.5 rounded-sm";
				}

				return (
					<motion.div
						// biome-ignore lint/suspicious/noArrayIndexKey: ephemeral animation
						key={i}
						initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
						animate={{
							opacity: [1, 1, 0],
							scale: [0, 1.5, 1],
							x: (Math.random() - 0.5) * 1000,
							y: (Math.random() - 0.5) * 1000,
							rotate: Math.random() * 720,
						}}
						transition={{ duration: 1.5, ease: "circOut" }}
						className={className}
						style={style}
					/>
				);
			})}
		</div>
	);
}
