import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Figtree, Geist_Mono, Inter } from "next/font/google";
import type React from "react";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

const figtree = Figtree({
	subsets: ["latin"],
	variable: "--font-figtree",
	weight: ["400", "500", "600"],
});

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
});

const geistMono = Geist_Mono({
	subsets: ["latin"],
	variable: "--font-geist-mono",
	weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
	title: "TeamUp - The Intelligence Layer for Modern Management",
	description:
		"Real-time insights, tone analysis, and team alignment across your favorite collaboration tools.",
	icons: {
		icon: "/icon.svg",
	},
};

import { Toaster } from "sonner";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${inter.variable} ${figtree.variable} ${geistMono.variable} font-sans antialiased`}
			>
				<QueryProvider>{children}</QueryProvider>
				<Toaster position="bottom-right" richColors />
				<Analytics />
			</body>
		</html>
	);
}
