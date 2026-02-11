import { describe, expect, it } from "vitest";
import { getQueryClient } from "@/lib/query-client";

describe("getQueryClient", () => {
	it("should return a QueryClient instance", () => {
		const client = getQueryClient();
		expect(client).toBeDefined();
		expect(client.getDefaultOptions).toBeDefined();
	});

	it("should return the same instance on subsequent calls (browser singleton)", () => {
		const client1 = getQueryClient();
		const client2 = getQueryClient();
		expect(client1).toBe(client2);
	});

	it("should have staleTime set to 60 seconds", () => {
		const client = getQueryClient();
		const defaults = client.getDefaultOptions();
		expect(defaults.queries?.staleTime).toBe(60 * 1000);
	});

	it("should have refetchOnWindowFocus disabled", () => {
		const client = getQueryClient();
		const defaults = client.getDefaultOptions();
		expect(defaults.queries?.refetchOnWindowFocus).toBe(false);
	});
});
