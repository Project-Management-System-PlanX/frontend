"use client";

import { Hash, Lock, MessageSquare, Users } from "lucide-react";

export default function ChatPage() {
	return (
		<div className="flex-1 flex flex-col items-center justify-center bg-white min-h-0">
			{/* WhatsApp-style welcome screen */}
			<div className="flex flex-col items-center text-center max-w-md px-8">
				{/* Animated Logo */}
				<div className="relative mb-8">
					<div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-100">
						<MessageSquare className="w-10 h-10 text-white" />
					</div>
					<div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-4 border-white animate-pulse" />
				</div>

				<h2
					className="text-2xl font-bold text-slate-800 mb-2"
					style={{ fontFamily: "var(--font-figtree), Figtree" }}
				>
					Teamup Chat
				</h2>

				<p className="text-sm text-slate-500 leading-relaxed mb-8">
					Select a channel or direct message from the sidebar to start chatting with your team.
				</p>

				{/* Feature pills */}
				<div className="flex flex-col gap-3 w-full">
					{[
						{
							icon: Hash,
							label: "Channels",
							desc: "Join public or private channels",
							color: "text-green-600",
							bg: "bg-green-50",
						},
						{
							icon: Users,
							label: "Direct Messages",
							desc: "Chat privately with teammates",
							color: "text-emerald-600",
							bg: "bg-emerald-50",
						},
						{
							icon: Lock,
							label: "End-to-end secure",
							desc: "Your messages are safe and private",
							color: "text-green-700",
							bg: "bg-green-100",
						},
					].map((item) => {
						const Icon = item.icon;
						return (
							<div
								key={item.label}
								className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all"
							>
								<div
									className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}
								>
									<Icon className={`w-4.5 h-4.5 ${item.color}`} />
								</div>
								<div className="text-left">
									<p className="text-sm font-semibold text-slate-700">{item.label}</p>
									<p className="text-xs text-slate-400">{item.desc}</p>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
