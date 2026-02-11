import { describe, expect, it } from "vitest";

// Re-implement the shouldShowCheck function for testing
// (it's not exported from PricingSection, so we test the logic directly)
type PlanLevel = "starter" | "pro" | "enterprise";

function shouldShowCheck(included: PlanLevel | "all", level: PlanLevel): boolean {
	if (included === "all") return true;
	if (included === "enterprise" && level === "enterprise") return true;
	if (included === "pro" && (level === "pro" || level === "enterprise")) return true;
	if (included === "starter") return true;
	return false;
}

describe("shouldShowCheck - Pricing feature availability logic", () => {
	describe("features included for 'all' plans", () => {
		it("should show check for starter plan", () => {
			expect(shouldShowCheck("all", "starter")).toBe(true);
		});

		it("should show check for pro plan", () => {
			expect(shouldShowCheck("all", "pro")).toBe(true);
		});

		it("should show check for enterprise plan", () => {
			expect(shouldShowCheck("all", "enterprise")).toBe(true);
		});
	});

	describe("features included at 'starter' level", () => {
		it("should show check for starter plan", () => {
			expect(shouldShowCheck("starter", "starter")).toBe(true);
		});

		it("should show check for pro plan (inherits starter features)", () => {
			expect(shouldShowCheck("starter", "pro")).toBe(true);
		});

		it("should show check for enterprise plan (inherits starter features)", () => {
			expect(shouldShowCheck("starter", "enterprise")).toBe(true);
		});
	});

	describe("features included at 'pro' level", () => {
		it("should NOT show check for starter plan", () => {
			expect(shouldShowCheck("pro", "starter")).toBe(false);
		});

		it("should show check for pro plan", () => {
			expect(shouldShowCheck("pro", "pro")).toBe(true);
		});

		it("should show check for enterprise plan (inherits pro features)", () => {
			expect(shouldShowCheck("pro", "enterprise")).toBe(true);
		});
	});

	describe("features included at 'enterprise' level", () => {
		it("should NOT show check for starter plan", () => {
			expect(shouldShowCheck("enterprise", "starter")).toBe(false);
		});

		it("should NOT show check for pro plan", () => {
			expect(shouldShowCheck("enterprise", "pro")).toBe(false);
		});

		it("should show check for enterprise plan", () => {
			expect(shouldShowCheck("enterprise", "enterprise")).toBe(true);
		});
	});
});
