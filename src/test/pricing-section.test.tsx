import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { PricingSection } from "@/components/PricingSection";

afterEach(() => {
	cleanup();
});

describe("PricingSection", () => {
	it("should render the section heading", () => {
		render(<PricingSection />);
		expect(screen.getByText("Choose Your Plan")).toBeInTheDocument();
	});

	it("should render the section description", () => {
		render(<PricingSection />);
		expect(screen.getByText(/TeamUp's communication intelligence platform/i)).toBeInTheDocument();
	});

	it("should render all three plan names", () => {
		render(<PricingSection />);
		// Plan card headings
		const starterElements = screen.getAllByText("Starter");
		const proElements = screen.getAllByText("Pro");
		const enterpriseElements = screen.getAllByText("Enterprise");

		expect(starterElements.length).toBeGreaterThan(0);
		expect(proElements.length).toBeGreaterThan(0);
		expect(enterpriseElements.length).toBeGreaterThan(0);
	});

	it("should render Monthly and Yearly billing toggle", () => {
		render(<PricingSection />);
		expect(screen.getByText("Monthly")).toBeInTheDocument();
		expect(screen.getByText("Yearly")).toBeInTheDocument();
	});

	it("should show save percentage on yearly toggle", () => {
		render(<PricingSection />);
		expect(screen.getByText("Save 17%")).toBeInTheDocument();
	});

	it("should display monthly prices by default", () => {
		render(<PricingSection />);
		expect(screen.getByText("$29")).toBeInTheDocument();
		expect(screen.getByText("$99")).toBeInTheDocument();
		expect(screen.getByText("$299")).toBeInTheDocument();
	});

	it("should switch to yearly prices when Yearly is clicked", async () => {
		const user = userEvent.setup();
		render(<PricingSection />);

		const yearlyButton = screen.getByText("Yearly").closest("button");
		if (!yearlyButton) throw new Error("Yearly button not found");
		await user.click(yearlyButton);

		expect(screen.getByText("$290")).toBeInTheDocument();
		expect(screen.getByText("$990")).toBeInTheDocument();
		expect(screen.getByText("$2990")).toBeInTheDocument();
	});

	it("should show /month for monthly billing", () => {
		render(<PricingSection />);
		const monthLabels = screen.getAllByText("/month");
		expect(monthLabels.length).toBe(3);
	});

	it("should show /year for yearly billing", async () => {
		const user = userEvent.setup();
		render(<PricingSection />);

		const yearlyButton = screen.getByText("Yearly").closest("button");
		if (!yearlyButton) throw new Error("Yearly button not found");
		await user.click(yearlyButton);

		const yearLabels = screen.getAllByText("/year");
		expect(yearLabels.length).toBe(3);
	});

	it("should show 'Most Popular' badge on Pro plan", () => {
		render(<PricingSection />);
		expect(screen.getByText("Most Popular")).toBeInTheDocument();
	});

	it("should have Pro plan selected by default", () => {
		render(<PricingSection />);
		// The Pro plan card should show "Selected" text
		expect(screen.getByText("Selected")).toBeInTheDocument();
		// And there should be "Select Plan" for the other two
		const selectPlanButtons = screen.getAllByText("Select Plan");
		expect(selectPlanButtons.length).toBe(2);
	});

	it("should render all feature names", () => {
		render(<PricingSection />);
		expect(screen.getByText("Real-time conversation analysis")).toBeInTheDocument();
		expect(screen.getByText("API access")).toBeInTheDocument();
		expect(screen.getByText("Team collaboration tools")).toBeInTheDocument();
		expect(screen.getByText("Custom AI model training")).toBeInTheDocument();
	});

	it("should render the CTA button with selected plan name", () => {
		render(<PricingSection />);
		expect(screen.getByText("Get started with Pro")).toBeInTheDocument();
	});

	it("should update CTA when a different plan is selected", async () => {
		const user = userEvent.setup();
		render(<PricingSection />);

		// Click on Enterprise plan card
		const enterpriseHeading = screen.getAllByText("Enterprise")[0];
		const enterpriseCard = enterpriseHeading.closest("button");
		if (!enterpriseCard) throw new Error("Enterprise card not found");
		await user.click(enterpriseCard);

		expect(screen.getByText("Get started with Enterprise")).toBeInTheDocument();
	});

	it("should render the Features table header", () => {
		render(<PricingSection />);
		expect(screen.getByText("Features")).toBeInTheDocument();
	});
});
