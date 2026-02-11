import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility", () => {
	it("should merge class names correctly", () => {
		const result = cn("text-red-500", "bg-blue-500");
		expect(result).toBe("text-red-500 bg-blue-500");
	});

	it("should handle conditional classes", () => {
		const isActive = true;
		const result = cn("base-class", isActive && "active-class");
		expect(result).toContain("base-class");
		expect(result).toContain("active-class");
	});

	it("should handle false/undefined/null values", () => {
		const result = cn("base", false, undefined, null, "end");
		expect(result).toBe("base end");
	});

	it("should merge conflicting tailwind classes (last wins)", () => {
		const result = cn("text-red-500", "text-blue-500");
		expect(result).toBe("text-blue-500");
	});

	it("should handle empty arguments", () => {
		const result = cn();
		expect(result).toBe("");
	});

	it("should handle object syntax from clsx", () => {
		const result = cn({ "text-red-500": true, "bg-blue-500": false });
		expect(result).toBe("text-red-500");
	});
});
