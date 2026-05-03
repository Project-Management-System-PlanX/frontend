"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { createClient } from "@/lib/supabase/client";

export function ProfileCompletionModal() {
	const { user, isAuthenticated } = useSupabaseAuth();
	const [isOpen, setIsOpen] = useState(false);
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		// Only show once user is authenticated and we know they don't have a name
		if (isAuthenticated && user) {
			const hasFirstName = Boolean(user.user_metadata?.first_name);
			const hasLastName = Boolean(user.user_metadata?.last_name);

			if (!hasFirstName || !hasLastName) {
				setIsOpen(true);
			}
		}
	}, [isAuthenticated, user]);

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!firstName.trim() || !lastName.trim()) return;

		setIsLoading(true);
		const supabase = createClient();

		try {
			const { error } = await supabase.auth.updateUser({
				data: {
					first_name: firstName.trim(),
					last_name: lastName.trim(),
				},
			});

			if (error) throw error;

			// Force reload to get fresh token with new claims locally
			window.location.reload();
		} catch (error) {
			console.error("Failed to update profile", error);
			setIsLoading(false);
		}
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				// Do not allow closing if they haven't filled it out
				if (!open && (!user?.user_metadata?.first_name || !user?.user_metadata?.last_name)) {
					return;
				}
				setIsOpen(open);
			}}
		>
			<DialogContent className="sm:max-w-md pointer-events-auto" forceMount>
				<DialogHeader>
					<DialogTitle>Complete Your Profile</DialogTitle>
					<DialogDescription>
						Welcome! Please enter your name so your team knows who you are. This ensures your email
						address is masked.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSave} className="space-y-4 pt-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<label htmlFor="firstName" className="text-sm font-medium">
								First name
							</label>
							<input
								id="firstName"
								type="text"
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								required
								placeholder="Jane"
								className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
							/>
						</div>
						<div className="space-y-2">
							<label htmlFor="lastName" className="text-sm font-medium">
								Last name
							</label>
							<input
								id="lastName"
								type="text"
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								required
								placeholder="Doe"
								className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
							/>
						</div>
					</div>

					<Button
						type="submit"
						disabled={!firstName.trim() || !lastName.trim() || isLoading}
						className="w-full bg-[#0B6E4F] hover:bg-[#0B6E4F]/90 text-white"
					>
						{isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
						Save Profile
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
