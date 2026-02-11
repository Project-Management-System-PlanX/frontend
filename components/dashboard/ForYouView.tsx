"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ActivityTabsNavigation } from "./foryou/ActivityTabsNavigation";
import { AssignedToMeTab } from "./foryou/AssignedToMeTab";
import { BoardsTab } from "./foryou/BoardsTab";
import { ForYouHeader } from "./foryou/ForYouHeader";
import { RecommendedSpaces } from "./foryou/RecommendedSpaces";
import { StarredTab } from "./foryou/StarredTab";
import { ViewedTab } from "./foryou/ViewedTab";
import { WorkedOnTab } from "./foryou/WorkedOnTab";

export function ForYouView() {
	const [activeActivityTab, setActiveActivityTab] = useState("Worked on");
	const [activeSpaceTab, setActiveSpaceTab] = useState("Recommended");

	return (
		<div
			className="flex-1 flex flex-col bg-white min-w-0 overflow-hidden"
			style={{ fontFamily: "var(--font-figtree), Figtree" }}
		>
			{/* ──────── Top Header Bar ──────── */}
			<ForYouHeader />

			{/* ──────── Fixed Top Section (Title + Spaces + Tabs) ──────── */}
			<div className="shrink-0 px-8">
				{/* Page Title */}
				<h1 className="text-[22px] font-semibold text-slate-900 pt-6 pb-4 animate-[fadeInUp_0.4s_ease-out]">
					For you
				</h1>

				{/* Divider after title */}
				<div className="border-b border-slate-200 mb-5" />

				{/* Recommended Spaces */}
				<RecommendedSpaces activeSpaceTab={activeSpaceTab} setActiveSpaceTab={setActiveSpaceTab} />

				{/* Divider before tabs */}
				<div className="border-b border-slate-200" />

				{/* Activity Tabs */}
				<ActivityTabsNavigation
					activeActivityTab={activeActivityTab}
					setActiveActivityTab={setActiveActivityTab}
				/>
			</div>

			{/* ──────── Scrollable Content Area ──────── */}
			<ScrollArea className="flex-1 min-h-0">
				<div className="px-8">
					{/* ════════ Worked On Tab ════════ */}
					{activeActivityTab === "Worked on" && <WorkedOnTab />}

					{/* ════════ Viewed Tab ════════ */}
					{activeActivityTab === "Viewed" && <ViewedTab />}

					{/* ════════ Assigned to me Tab ════════ */}
					{activeActivityTab === "Assigned to me" && <AssignedToMeTab />}

					{/* ════════ Starred Tab ════════ */}
					{activeActivityTab === "Starred" && <StarredTab />}

					{/* ════════ Boards Tab ════════ */}
					{activeActivityTab === "Boards" && <BoardsTab />}
				</div>
			</ScrollArea>
		</div>
	);
}
