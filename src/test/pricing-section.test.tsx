import { cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { PricingSection } from "@/components/PricingSection";

afterEach(() => {
	cleanup();
});

describe("PricingSection", () => {
	it("should render the section heading", () => {
		const { getByText } = render(<PricingSection />);
		expect(getByText("Choose Your Plan")).toBeInTheDocument();
	});

	it("should render the section description", () => {
		const { getByText } = render(<PricingSection />);
		expect(getByText(/TeamUp's communication intelligence platform/i)).toBeInTheDocument();
	});

	it("should render all three plan names", () => {
		const { getAllByText } = render(<PricingSection />);
		// Plan card headings
		const starterElements = getAllByText("Starter");
		const proElements = getAllByText("Pro");
		const enterpriseElements = getAllByText("Enterprise");

		expect(starterElements.length).toBeGreaterThan(0);
		expect(proElements.length).toBeGreaterThan(0);
		expect(enterpriseElements.length).toBeGreaterThan(0);
	});

	it("should render Monthly and Yearly billing toggle", () => {
		const { getByText } = render(<PricingSection />);
		expect(getByText("Monthly")).toBeInTheDocument();
		expect(getByText("Yearly")).toBeInTheDocument();
	});

	it("should show save percentage on yearly toggle", () => {
		const { getByText } = render(<PricingSection />);
		expect(getByText("Save 17%")).toBeInTheDocument();
	});

	it("should display monthly prices by default", () => {
		const { getByText } = render(<PricingSection />);
		expect(getByText("$29")).toBeInTheDocument();
		expect(getByText("$99")).toBeInTheDocument();
		expect(getByText("$299")).toBeInTheDocument();
	});

	it("should switch to yearly prices when Yearly is clicked", async () => {
		const user = userEvent.setup();
		const { getByText } = render(<PricingSection />);

		const yearlyButton = getByText("Yearly").closest("button");
		if (!yearlyButton) throw new Error("Yearly button not found");
		await user.click(yearlyButton);

		expect(getByText("$290")).toBeInTheDocument();
		expect(getByText("$990")).toBeInTheDocument();
		expect(getByText("$2990")).toBeInTheDocument();
	});

	it("should show /month for monthly billing", () => {
		const { getAllByText } = render(<PricingSection />);
		const monthLabels = getAllByText("/month");
		expect(monthLabels.length).toBe(3);
	});

	it("should show /year for yearly billing", async () => {
		const user = userEvent.setup();
		const { getByText, getAllByText } = render(<PricingSection />);

		const yearlyButton = getByText("Yearly").closest("button");
		if (!yearlyButton) throw new Error("Yearly button not found");
		await user.click(yearlyButton);

		const yearLabels = getAllByText("/year");
		expect(yearLabels.length).toBe(3);
	});

	it("should show 'Most Popular' badge on Pro plan", () => {
		const { getByText } = render(<PricingSection />);
		expect(getByText("Most Popular")).toBeInTheDocument();
	});

	it("should have Pro plan selected by default", () => {
		const { getByText, getAllByText } = render(<PricingSection />);
		// The Pro plan card should show "Selected" text
		expect(getByText("Selected")).toBeInTheDocument();
		// And there should be "Select Plan" for the other two
		const selectPlanButtons = getAllByText("Select Plan");
		expect(selectPlanButtons.length).toBe(2);
	});

	it("should render all feature names", () => {
		const { getByText } = render(<PricingSection />);
		expect(getByText("Real-time conversation analysis")).toBeInTheDocument();
		expect(getByText("API access")).toBeInTheDocument();
		expect(getByText("Team collaboration tools")).toBeInTheDocument();
		expect(getByText("Custom AI model training")).toBeInTheDocument();
	});

	it("should render the CTA button with selected plan name", () => {
		const { getByText } = render(<PricingSection />);
		expect(getByText("Get started with Pro")).toBeInTheDocument();
	});

	it("should update CTA when a different plan is selected", async () => {
		const user = userEvent.setup();
		const { getByText, getAllByText } = render(<PricingSection />);

		// Click on Enterprise plan card
		const enterpriseHeading = getAllByText("Enterprise")[0];
		const enterpriseCard = enterpriseHeading.closest("button");
		if (!enterpriseCard) throw new Error("Enterprise card not found");
		await user.click(enterpriseCard);

		expect(getByText("Get started with Enterprise")).toBeInTheDocument();
	});

	it("should render the Features table header", () => {
		const { getByText } = render(<PricingSection />);
		expect(getByText("Features")).toBeInTheDocument();
	});
});
