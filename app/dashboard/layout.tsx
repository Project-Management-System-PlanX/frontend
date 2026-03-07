"use client";

import type React from "react";
import { MeetingProvider } from "@/components/meeting/MeetingProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return <MeetingProvider>{children}</MeetingProvider>;
}
