"use client";

import { Camera, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

interface SettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
	const { user, isAuthenticated } = useSupabaseAuth();

	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [username, setUsername] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

	const fileInputRef = useRef<HTMLInputElement>(null);

	// Load user data when modal opens
	useEffect(() => {
		if (isOpen && isAuthenticated && user) {
			setFirstName(
				user.user_metadata?.first_name || user.user_metadata?.full_name?.split(" ")[0] || "",
			);
			setLastName(
				user.user_metadata?.last_name ||
					user.user_metadata?.full_name?.split(" ").slice(1).join(" ") ||
					"",
			);
			setUsername(user.user_metadata?.username || "");
			setAvatarPreviewUrl(user.user_metadata?.avatar_url || user.user_metadata?.picture || null);
		}
	}, [isOpen, isAuthenticated, user]);

	// Handle avatar selection
	const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.[0]) {
			const file = e.target.files[0];
			setAvatarFile(file);
			setAvatarPreviewUrl(URL.createObjectURL(file));
		}
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!firstName.trim() || !lastName.trim()) return;

		setIsLoading(true);
		const supabase = createClient();

		try {
			let uploadedAvatarUrl =
				user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;
			let avatarUploadSuccess = false;

			// If a new avatar file was selected, upload it
			if (avatarFile && user?.id) {
				const fileExt = avatarFile.name.split(".").pop();
				const fileName = `${user.id}-${Date.now()}.${fileExt}`;

				const { error: uploadError } = await supabase.storage
					.from("chat_attachments") // Re-using general bucket, since it most likely exists and is public
					.upload(`avatars/${fileName}`, avatarFile, { upsert: true });

				if (!uploadError) {
					const { data } = supabase.storage
						.from("chat_attachments")
						.getPublicUrl(`avatars/${fileName}`);
					uploadedAvatarUrl = data.publicUrl;
					avatarUploadSuccess = true;
				} else {
					console.warn(
						"Avatar upload failed (bucket might missing). Proceeding without avatar update",
						uploadError,
					);
				}
			}

			// Update Auth User Metadata
			const { error } = await supabase.auth.updateUser({
				data: {
					first_name: firstName.trim(),
					last_name: lastName.trim(),
					username: username.trim(),
					...(avatarUploadSuccess
						? { avatar_url: uploadedAvatarUrl, picture: uploadedAvatarUrl }
						: {}),
				},
			});

			if (error) throw error;

			// Also update the 'users' table with this new info
			const { error: profileError } = await supabase
				.from("users")
				.update({
					firstName: firstName.trim(),
					lastName: lastName.trim(),
					username: username.trim() || null,
					...(avatarUploadSuccess ? { imageUrl: uploadedAvatarUrl } : {}),
				})
				.eq("supabaseId", user?.id);

			if (profileError) {
				console.warn("Failed to update public user profile record:", profileError);
			}

			// Force reload to get fresh token with new claims locally (or we could just close and let ui sync up)
			window.location.reload();
		} catch (error) {
			console.error("Failed to update profile", error);
			setIsLoading(false);
		}
	};

	const initials =
		firstName && lastName
			? `${firstName[0]}${lastName[0]}`.toUpperCase()
			: user?.email
				? user.email.substring(0, 2).toUpperCase()
				: "?";

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md pointer-events-auto">
				<DialogHeader>
					<DialogTitle>Profile Settings</DialogTitle>
					<DialogDescription>
						Update your personal information and how others see you.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSave} className="space-y-5 pt-4">
					{/* Avatar Section */}
					<div className="flex flex-col items-center justify-center space-y-3 pb-2">
						<button
							type="button"
							className="relative group cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#0B6E4F]/30 rounded-full"
							onClick={() => fileInputRef.current?.click()}
						>
							<Avatar className="w-20 h-20 ring-4 ring-[#0B6E4F]/10 group-hover:ring-[#0B6E4F]/30 transition-all">
								<AvatarImage src={avatarPreviewUrl || undefined} className="object-cover" />
								<AvatarFallback className="bg-[#0B6E4F] text-white text-2xl font-semibold">
									{initials}
								</AvatarFallback>
							</Avatar>
							<div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
								<Camera className="w-6 h-6" />
							</div>
						</button>
						<input
							type="file"
							ref={fileInputRef}
							className="hidden"
							accept="image/*"
							onChange={handleAvatarSelect}
						/>
						<p className="text-xs text-slate-500">Click to upload a new avatar</p>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<label htmlFor="settings-firstName" className="text-sm font-medium text-slate-700">
								First Name <span className="text-red-500">*</span>
							</label>
							<input
								id="settings-firstName"
								type="text"
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								required
								placeholder="Jane"
								className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
							/>
						</div>
						<div className="space-y-2">
							<label htmlFor="settings-lastName" className="text-sm font-medium text-slate-700">
								Last Name <span className="text-red-500">*</span>
							</label>
							<input
								id="settings-lastName"
								type="text"
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								required
								placeholder="Doe"
								className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<label htmlFor="settings-username" className="text-sm font-medium text-slate-700">
							Username (Optional)
						</label>
						<input
							id="settings-username"
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							placeholder="janedoe"
							className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
						/>
					</div>

					<div className="space-y-2">
						<label htmlFor="settings-email" className="text-sm font-medium text-slate-700">
							Email Address
						</label>
						<input
							id="settings-email"
							type="text"
							value={user?.email || ""}
							disabled
							className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed rounded-lg"
						/>
					</div>

					<div className="pt-2 flex gap-3 justify-end">
						<Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={!firstName.trim() || !lastName.trim() || isLoading}
							className="bg-[#0B6E4F] hover:bg-[#0B6E4F]/90 text-white"
						>
							{isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
							Save Changes
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
