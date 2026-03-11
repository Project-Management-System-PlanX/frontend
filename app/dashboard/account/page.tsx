"use client";

import { Camera, Loader2, LogOut, Mail, Shield, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { createClient } from "@/lib/supabase/client";

export default function AccountPage() {
	const { user, isAuthenticated } = useSupabaseAuth();
	const router = useRouter();

	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [username, setUsername] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [saved, setSaved] = useState(false);
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (isAuthenticated && user) {
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
	}, [isAuthenticated, user]);

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
		setSaved(false);
		const supabase = createClient();

		try {
			let uploadedAvatarUrl =
				user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;
			let avatarUploadSuccess = false;

			if (avatarFile && user?.id) {
				const fileExt = avatarFile.name.split(".").pop();
				const fileName = `${user.id}-${Date.now()}.${fileExt}`;

				const { error: uploadError } = await supabase.storage
					.from("chat_attachments")
					.upload(`avatars/${fileName}`, avatarFile, { upsert: true });

				if (!uploadError) {
					const { data } = supabase.storage
						.from("chat_attachments")
						.getPublicUrl(`avatars/${fileName}`);
					uploadedAvatarUrl = data.publicUrl;
					avatarUploadSuccess = true;
				} else {
					console.warn("Avatar upload failed:", uploadError);
				}
			}

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

			setSaved(true);
			setAvatarFile(null);
			setTimeout(() => setSaved(false), 3000);
		} catch (error) {
			console.error("Failed to update profile", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSignOut = async () => {
		const supabase = createClient();
		await supabase.auth.signOut();
		router.push("/");
	};

	const initials =
		firstName && lastName
			? `${firstName[0]}${lastName[0]}`.toUpperCase()
			: user?.email
				? user.email.substring(0, 2).toUpperCase()
				: "?";

	return (
		<div
			className="flex-1 flex flex-col bg-white min-w-0 min-h-0 overflow-y-auto"
			style={{
				fontFamily: "'-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Inter', sans-serif",
			}}
		>
			<div className="min-h-full p-6 md:p-10 mx-auto w-full max-w-[680px]">
				{/* Header */}
				<h1 className="text-[28px] font-bold text-gray-900 tracking-tight mb-1">Account</h1>
				<p className="text-[14px] text-gray-500 mb-8">Manage your profile and account settings</p>

				{/* Profile Card */}
				<form onSubmit={handleSave}>
					<div className="bg-white/60 backdrop-blur-3xl rounded-[24px] border border-gray-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 mb-6">
						<div className="flex items-center gap-2 mb-6">
							<User className="w-5 h-5 text-gray-400" />
							<h2 className="text-[16px] font-semibold text-gray-900 tracking-tight">
								Profile Information
							</h2>
						</div>

						{/* Avatar */}
						<div className="flex items-center gap-6 mb-8">
							<button
								type="button"
								className="relative group cursor-pointer focus:outline-none rounded-full shrink-0"
								onClick={() => fileInputRef.current?.click()}
							>
								<Avatar className="w-20 h-20 ring-4 ring-gray-100 group-hover:ring-gray-200 transition-all">
									<AvatarImage src={avatarPreviewUrl || undefined} className="object-cover" />
									<AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-2xl font-semibold">
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
							<div>
								<p className="text-[14px] font-semibold text-gray-900">
									{firstName || "Your"} {lastName || "Name"}
								</p>
								<p className="text-[13px] text-gray-500">{user?.email}</p>
								<p className="text-[12px] text-gray-400 mt-1">Click avatar to upload a new photo</p>
							</div>
						</div>

						{/* Form Fields */}
						<div className="grid grid-cols-2 gap-4 mb-5">
							<div className="space-y-1.5">
								<label
									htmlFor="account-firstName"
									className="text-[13px] font-medium text-gray-600"
								>
									First Name <span className="text-red-400">*</span>
								</label>
								<input
									id="account-firstName"
									type="text"
									value={firstName}
									onChange={(e) => setFirstName(e.target.value)}
									required
									placeholder="Jane"
									className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
								/>
							</div>
							<div className="space-y-1.5">
								<label htmlFor="account-lastName" className="text-[13px] font-medium text-gray-600">
									Last Name <span className="text-red-400">*</span>
								</label>
								<input
									id="account-lastName"
									type="text"
									value={lastName}
									onChange={(e) => setLastName(e.target.value)}
									required
									placeholder="Doe"
									className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
								/>
							</div>
						</div>

						<div className="space-y-1.5 mb-5">
							<label htmlFor="account-username" className="text-[13px] font-medium text-gray-600">
								Username
							</label>
							<input
								id="account-username"
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								placeholder="janedoe"
								className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
							/>
						</div>

						<div className="flex items-center justify-between">
							<div />
							<div className="flex items-center gap-3">
								{saved && (
									<span className="text-[13px] font-medium text-green-600 animate-pulse">
										✓ Saved
									</span>
								)}
								<button
									type="submit"
									disabled={!firstName.trim() || !lastName.trim() || isLoading}
									className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
								>
									{isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
									Save Changes
								</button>
							</div>
						</div>
					</div>
				</form>

				{/* Email Info Card */}
				<div className="bg-white/60 backdrop-blur-3xl rounded-[24px] border border-gray-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 mb-6">
					<div className="flex items-center gap-2 mb-4">
						<Mail className="w-5 h-5 text-gray-400" />
						<h2 className="text-[16px] font-semibold text-gray-900 tracking-tight">
							Email Address
						</h2>
					</div>
					<div className="flex items-center gap-4">
						<input
							type="text"
							value={user?.email || ""}
							disabled
							className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 text-gray-500 cursor-not-allowed rounded-xl text-[14px]"
						/>
						<div className="flex items-center gap-1.5 text-[12px] font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
							<Shield className="w-3.5 h-3.5" />
							Verified
						</div>
					</div>
				</div>

				{/* Danger Zone */}
				<div className="bg-white/60 backdrop-blur-3xl rounded-[24px] border border-red-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
					<div className="flex items-center gap-2 mb-4">
						<LogOut className="w-5 h-5 text-red-400" />
						<h2 className="text-[16px] font-semibold text-gray-900 tracking-tight">Sign Out</h2>
					</div>
					<p className="text-[13px] text-gray-500 mb-4">
						Sign out of your account on this device. You can always sign back in later.
					</p>
					<button
						type="button"
						onClick={handleSignOut}
						className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
					>
						<LogOut className="w-4 h-4" />
						Sign Out
					</button>
				</div>
			</div>
		</div>
	);
}
