"use client";

import { CheckCircle2, ChevronDown, Circle, Clock, Search, X } from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Person {
	id: string;
	name: string;
	title: string;
	avatar: string;
	status?: "verified" | "online" | "away" | "offline";
}

const people: Person[] = [
	{
		id: "1",
		name: "Ravikrishna J",
		title: "That's you!",
		avatar: "/avatars/user.png",
		status: "verified",
	},
	{
		id: "2",
		name: "Elena Vance",
		title: "Product Designer",
		avatar: "/avatars/sarah.png",
		status: "away",
	},
	{
		id: "3",
		name: "Marcus Wright",
		title: "Engineering Lead",
		avatar: "/avatars/alex.png",
		status: "online",
	},
	{
		id: "4",
		name: "Sarah Chen",
		title: "Head of Operations",
		avatar: "/avatars/1.png",
		status: "online",
	},
	{
		id: "5",
		name: "David Miller",
		title: "Marketing Manager",
		avatar: "/avatars/2.png",
		status: "offline",
	},
	{
		id: "6",
		name: "Morgan Lee",
		title: "DevOps Engineer",
		avatar: "/avatars/3.png",
		status: "online",
	},
	{
		id: "7",
		name: "Jordan Smith",
		title: "UX Researcher",
		avatar: "/avatars/4.png",
		status: "offline",
	},
	{
		id: "8",
		name: "Casey Johnson",
		title: "Senior Developer",
		avatar: "/avatars/5.png",
		status: "online",
	},
];

const getStatusIcon = (status?: string) => {
	switch (status) {
		case "verified":
			return <CheckCircle2 className="w-4 h-4 text-primary" />;
		case "online":
			return <Circle className="w-3 h-3 fill-emerald-500 text-emerald-500" />;
		case "away":
			return <Clock className="w-4 h-4 text-slate-400" />;
		case "offline":
			return <Circle className="w-3 h-3 text-slate-400" />;
		default:
			return null;
	}
};

export function PeopleDirectory() {
	const [searchQuery, setSearchQuery] = useState("");
	const [showBanner, setShowBanner] = useState(true);
	const [displayCount, setDisplayCount] = useState(5);

	const filteredPeople = people.filter(
		(person) =>
			person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			person.title.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const displayedPeople = filteredPeople.slice(0, displayCount);

	return (
		<div className="flex-1 flex flex-col bg-white min-w-0 overflow-hidden">
			{/* Header */}
			<div className="h-16 px-6 flex items-center justify-between border-b border-slate-200 bg-white shrink-0">
				<h1 className="text-2xl font-semibold text-slate-900">People</h1>
				<Button
					onClick={() => setShowBanner(true)}
					className="gap-2 bg-[#156d97] hover:bg-[#156d97]/90 text-white"
				>
					<span>+</span>
					Invite People
				</Button>
			</div>

			{/* Invite Banner */}
			{showBanner && (
				<div className="relative bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-12 shrink-0">
					<button
						type="button"
						onClick={() => setShowBanner(false)}
						className="absolute top-4 right-4 text-white hover:text-slate-300"
					>
						<X className="w-6 h-6" />
					</button>
					<h2 className="text-2xl font-semibold text-white mb-2">Invite your team to Team UP</h2>
					<p className="text-slate-300 text-sm mb-6 max-w-xl">
						Bring your team members into Team UP to start working better together. Send invites via
						email, or get a handy link to share.
					</p>
					<Button
						onClick={() => setShowBanner(false)}
						className="bg-slate-700 hover:bg-slate-600 text-white font-semibold"
					>
						Invite people
					</Button>
				</div>
			)}

			{/* Search Bar */}
			<div className="px-8 py-4 flex items-center gap-4 bg-slate-50 border-b border-slate-200 shrink-0">
				<div className="flex-1 max-w-2xl relative">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
						<Input
							placeholder="Search for people"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10 bg-white border-slate-300 rounded-lg"
						/>
					</div>
				</div>
			</div>

			{/* Filters and Sort */}
			<div className="px-8 py-6 flex items-center justify-between gap-4 border-b border-slate-200 bg-white shrink-0">
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						className="bg-white border-slate-200 text-slate-600 text-xs hover:bg-slate-50"
					>
						Title <ChevronDown className="w-3 h-3 ml-1" />
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="bg-white border-slate-200 text-slate-600 text-xs hover:bg-slate-50"
					>
						Location <ChevronDown className="w-3 h-3 ml-1" />
					</Button>
					<div className="w-px h-6 bg-slate-200 mx-2" />
					<Button
						size="sm"
						className="text-[#156d97] bg-transparent hover:bg-slate-100 text-xs font-semibold flex items-center gap-1 px-3 py-1.5"
					>
						<Search className="w-4 h-4" />
						Filters
					</Button>
				</div>
				<Button
					variant="outline"
					size="sm"
					className="bg-white border-slate-200 text-slate-600 text-xs hover:bg-slate-50"
				>
					Most recommended <ChevronDown className="w-3 h-3 ml-1" />
				</Button>
			</div>

			{/* People Grid */}
			<div className="flex-1 overflow-y-auto">
				<div className="p-8">
					{displayedPeople.length === 0 ? (
						<div className="flex items-center justify-center h-64 text-slate-500">
							No people found
						</div>
					) : (
						<>
							<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 mb-8">
								{displayedPeople.map((person) => (
									<div
										key={person.id}
										className="bg-white rounded-md overflow-hidden border border-slate-200 hover:shadow-md transition-all group"
									>
										{/* Image Container */}
										<div className="relative aspect-square overflow-hidden bg-slate-100">
											<Avatar className="w-full h-full rounded-none">
												<AvatarImage src={person.avatar} className="w-full h-full object-cover" />
												<AvatarFallback className="w-full h-full bg-slate-100 text-slate-600 text-xs font-medium flex items-center justify-center">
													{person.name
														.split(" ")
														.map((n) => n[0])
														.join("")
														.slice(0, 2)
														.toUpperCase()}
												</AvatarFallback>
											</Avatar>
											{person.id === "1" && (
												<Button
													size="sm"
													className="absolute top-2 right-2 bg-[#156d97] hover:bg-[#156d97]/90 text-white h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
												>
													Edit
												</Button>
											)}
										</div>

										{/* Info Container */}
										<div className="p-2">
											<div className="flex items-center gap-1 mb-0.5">
												<h3 className="font-semibold text-slate-900 text-[10px] flex-1">
													{person.name}
												</h3>
												{getStatusIcon(person.status) && (
													<div className="flex-shrink-0">{getStatusIcon(person.status)}</div>
												)}
											</div>
											<p className="text-[9px] text-slate-500">{person.title}</p>
										</div>
									</div>
								))}
							</div>

							{/* Footer */}
							<div className="flex flex-col items-center gap-4 pt-4 border-t border-slate-200 bg-slate-50 -mx-8 -mb-8 px-8 py-8">
								<p className="text-xs text-slate-500">
									Showing {displayedPeople.length} of {filteredPeople.length} people
								</p>
								{displayCount < filteredPeople.length && (
									<Button
										variant="outline"
										onClick={() => setDisplayCount(displayCount + 5)}
										className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 px-8"
									>
										Load more
									</Button>
								)}
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
