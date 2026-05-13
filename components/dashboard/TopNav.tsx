"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	Bell,
	CheckSquare,
	ChevronDown,
	Files,
	HelpCircle,
	LayoutGrid,
	MessageSquare,
	Plus,
	Search,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { cn } from "@/lib/utils";

const UI = {
	primary: "#2d6a4f",
	bg: "#f8f9f4",
	border: "rgba(45, 106, 79, 0.1)",
	textPrimary: "#0f2318",
	textSecondary: "#4a6552",
};

export function TopNav() {
	const pathname = usePathname();
	const { user } = useSupabaseAuth();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	const initials = user?.email?.substring(0, 2).toUpperCase() || "?";
	const imageUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

	const navItems = [
		{ icon: LayoutGrid, label: "Dashboard", href: "/dashboard" },
		{ icon: CheckSquare, label: "Tasks", href: "/dashboard/task" },
		{ icon: MessageSquare, label: "Chat", href: "/dashboard/chat" },
		{ icon: Files, label: "Files", href: "/dashboard/files" },
	];

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsMenuOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<nav
			className="h-14 w-full border-b flex items-center px-4 gap-4 z-[100] relative shrink-0"
			style={{ backgroundColor: UI.bg, borderColor: UI.border }}
		>
			{/* Logo + Dropdown Trigger */}
			<div className="relative" ref={menuRef}>
				<button
					type="button"
					onClick={() => setIsMenuOpen(!isMenuOpen)}
					className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-black/5 transition-colors group"
				>
					<div className="w-8 h-8 rounded-lg bg-[#2d6a4f] flex items-center justify-center text-white shadow-lg">
						<Zap className="w-5 h-5 fill-white/20" />
					</div>
					<span
						className="font-bold text-[#0f2318] text-[14px] hidden sm:block"
						style={{ fontFamily: "var(--font-heading)" }}
					>
						TeamUp
					</span>
					<ChevronDown
						className={cn(
							"w-4 h-4 text-[#4a6552] transition-transform",
							isMenuOpen && "rotate-180",
						)}
					/>
				</button>

				<AnimatePresence>
					{isMenuOpen && (
						<motion.div
							initial={{ opacity: 0, y: 10, scale: 0.95 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 10, scale: 0.95 }}
							className="absolute top-full left-0 mt-2 w-64 rounded-xl border shadow-2xl overflow-hidden py-2"
							style={{ backgroundColor: "#f0f4ee", borderColor: UI.border }}
						>
							<div className="px-3 py-2 border-b mb-2" style={{ borderColor: UI.border }}>
								<p className="text-[11px] font-bold text-[#4a6552] uppercase tracking-wider">
									Navigate to
								</p>
							</div>
							{navItems.map((item) => (
								<Link
									key={item.label}
									href={item.href}
									onClick={() => setIsMenuOpen(false)}
									className={cn(
										"flex items-center gap-3 px-4 py-3 transition-colors",
										pathname === item.href
											? "bg-[#d8f3dc] text-[#0f2318]"
											: "text-[#4a6552] hover:bg-[#f0f4ee] hover:text-[#0f2318]",
									)}
								>
									<item.icon className="w-5 h-5" />
									<span className="text-[14px] font-medium">{item.label}</span>
									{pathname === item.href && (
										<div
											className="ml-auto w-1.5 h-1.5 rounded-full"
											style={{ backgroundColor: UI.primary }}
										/>
									)}
								</Link>
							))}
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Search */}
			<div className="hidden md:flex flex-1 max-w-[520px] ml-4">
				<div
					className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#f0f4ee] border w-full focus-within:border-[#2d6a4f] transition-colors"
					style={{ borderColor: UI.border }}
				>
					<Search className="w-4 h-4 text-[#4a6552]" />
					<input
						placeholder="Search cards, tasks, files..."
						className="bg-transparent text-[13px] text-[#0f2318] placeholder:text-[#4a6552] outline-none w-full"
					/>
				</div>
			</div>

			{/* Right Actions */}
			<div className="ml-auto flex items-center gap-2">
				<button
					type="button"
					className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-[13px] font-bold shadow-lg transition-transform active:scale-95"
					style={{ backgroundColor: UI.primary }}
				>
					<Plus className="w-4 h-4" />
					Create
				</button>
				<div className="w-[1px] h-6 bg-white/10 mx-2 hidden sm:block" />
				<button
					type="button"
					className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors relative"
				>
					<Bell className="w-5 h-5" />
					<div
						className="absolute top-2 right-2 w-2 h-2 rounded-full border-2 border-[#1E293B]"
						style={{ backgroundColor: UI.primary }}
					/>
				</button>
				<button
					type="button"
					className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
				>
					<HelpCircle className="w-5 h-5" />
				</button>
				<button type="button" className="ml-2">
					<Avatar className="w-8 h-8 ring-2 ring-white/5">
						<AvatarImage src={imageUrl} />
						<AvatarFallback className="bg-indigo-600 text-[10px] text-white font-bold">
							{initials}
						</AvatarFallback>
					</Avatar>
				</button>
			</div>
		</nav>
	);
}
