import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import type React from "react";
import { Toaster } from "sonner";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

const dmSerifDisplay = DM_Serif_Display({
    subsets: ["latin"],
    variable: "--font-heading",
    weight: ["400"],
    style: ["normal", "italic"],
});

const dmSans = DM_Sans({
    subsets: ["latin"],
    variable: "--font-body",
    weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
    title: "TeamUp - The Intelligence Layer for Modern Management",
    description:
        "Real-time insights, tone analysis, and team alignment across your favorite collaboration tools.",
    icons: {
        icon: "/icon.svg",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${dmSerifDisplay.variable} ${dmSans.variable} antialiased`}
            >
                <QueryProvider>{children}</QueryProvider>
                <Toaster position="bottom-right" richColors />
                <Analytics />
            </body>
        </html>
    );
}