"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateSpace } from "@/hooks/api/use-spaces";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useWorkspaceStore } from "@/stores/workspace-store";

const SPACE_COLORS = [
	"#0B6E4F",
	"#3B82F6",
	"#8B5CF6",
	"#EF4444",
	"#F59E0B",
	"#EC4899",
	"#06B6D4",
	"#10B981",
];

const SPACE_ICONS = ["P", "R", "I", "G", "B", "W", "C", "D"];

interface CreateSpaceDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CreateSpaceDialog({ open, onOpenChange }: CreateSpaceDialogProps) {
	const { token } = useSupabaseAuth();
	const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
	const { mutateAsync: createSpace, isPending } = useCreateSpace(token || undefined);

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [prefix, setPrefix] = useState("");
	const [color, setColor] = useState(SPACE_COLORS[0]);
	const [icon, setIcon] = useState(SPACE_ICONS[0]);
	const [error, setError] = useState<string | null>(null);

	const autoPrefix = name
		.split(/\s+/)
		.map((w) => w[0])
		.join("")
		.toUpperCase()
		.slice(0, 4);

	const handleCreate = async () => {
		if (!name.trim() || !activeWorkspaceId) return;
		setError(null);

		try {
			await createSpace({
				workspaceId: activeWorkspaceId,
				name: name.trim(),
				prefix: prefix.trim() || autoPrefix || name.slice(0, 3).toUpperCase(),
				description: description.trim() || undefined,
				color,
				icon,
			});
			setName("");
			setDescription("");
			setPrefix("");
			setColor(SPACE_COLORS[0]);
			setIcon(SPACE_ICONS[0]);
			onOpenChange(false);
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed to create space";
			setError(message);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Create Space</DialogTitle>
					<DialogDescription>
						A space is a container for organizing tasks and work items.
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-2">
					<div className="grid gap-1.5">
						<Label>
							Name <span className="text-red-500">*</span>
						</Label>
						<Input
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="e.g. Sales Outreach Strategy"
						/>
					</div>

					<div className="grid gap-1.5">
						<Label>Prefix</Label>
						<Input
							value={prefix}
							onChange={(e) => setPrefix(e.target.value.toUpperCase())}
							placeholder={autoPrefix || "AUTO"}
							maxLength={4}
						/>
						<p className="text-xs text-slate-400">
							Used for task IDs (e.g. {prefix || autoPrefix || "SOS"}-1)
						</p>
					</div>

					<div className="grid gap-1.5">
						<Label>Description</Label>
						<Textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="What is this space about?"
							rows={2}
						/>
					</div>

					<div className="grid gap-1.5">
						<Label>Icon</Label>
						<div className="flex gap-2 flex-wrap">
							{SPACE_ICONS.map((ic) => (
								<button
									key={ic}
									type="button"
									onClick={() => setIcon(ic)}
									className={`w-9 h-9 flex items-center justify-center rounded-lg border-2 text-lg transition-colors ${
										icon === ic
											? "border-[#0B6E4F] bg-[#0B6E4F]/10"
											: "border-slate-200 hover:border-slate-300"
									}`}
								>
									{ic}
								</button>
							))}
						</div>
					</div>

					<div className="grid gap-1.5">
						<Label>Color</Label>
						<div className="flex gap-2 flex-wrap">
							{SPACE_COLORS.map((c) => (
								<button
									key={c}
									type="button"
									onClick={() => setColor(c)}
									className={`w-7 h-7 rounded-full border-2 transition-all ${
										color === c
											? "border-slate-900 scale-110"
											: "border-transparent hover:scale-105"
									}`}
									style={{ backgroundColor: c }}
								/>
							))}
						</div>
					</div>

					{error && <p className="text-sm text-red-500">{error}</p>}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						onClick={handleCreate}
						disabled={!name.trim() || isPending}
						className="bg-[#0B6E4F] hover:bg-[#095C42] text-white"
					>
						{isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
						Create Space
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
