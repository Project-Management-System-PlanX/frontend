import { type NextRequest, NextResponse } from "next/server";

const AI_TASK_API = "https://task-assign-agent.onrender.com/process-task";

export async function POST(req: NextRequest) {
	const body = await req.json();

	if (!body.task_description || typeof body.task_description !== "string") {
		return NextResponse.json(
			{ detail: { error: "task_description is required", data: null } },
			{ status: 400 },
		);
	}

	const upstream = await fetch(AI_TASK_API, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ task_description: body.task_description }),
	});

	const data = await upstream.json().catch(() => null);

	if (!upstream.ok) {
		return NextResponse.json(data || { detail: { error: "Upstream request failed", data: null } }, {
			status: upstream.status,
		});
	}

	return NextResponse.json(data);
}
