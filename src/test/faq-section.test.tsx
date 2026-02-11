import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FAQSection } from "@/components/FAQSection";

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
	motion: {
		div: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => {
			const { initial, animate, exit, transition, whileInView, viewport, ...rest } =
				props as Record<string, unknown>;
			return <div {...(rest as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
		},
	},
	AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

afterEach(() => {
	cleanup();
});

describe("FAQSection", () => {
	it("should render the default title", () => {
		render(<FAQSection />);
		expect(screen.getByText("Frequently asked questions")).toBeInTheDocument();
	});

	it("should render a custom title", () => {
		render(<FAQSection title="Help & Support" />);
		expect(screen.getByText("Help & Support")).toBeInTheDocument();
	});

	it("should render all default FAQ questions", () => {
		render(<FAQSection />);
		expect(screen.getByText("What is TeamUp and how does it work?")).toBeInTheDocument();
		expect(
			screen.getByText("How does TeamUp use my data to build a custom AI chat?"),
		).toBeInTheDocument();
		expect(
			screen.getByText("How do I get started with TeamUp and what are the pricing options?"),
		).toBeInTheDocument();
	});

	it("should render custom FAQs", () => {
		const customFaqs = [
			{ question: "Custom Q1?", answer: "Custom A1" },
			{ question: "Custom Q2?", answer: "Custom A2" },
		];
		render(<FAQSection faqs={customFaqs} />);
		expect(screen.getByText("Custom Q1?")).toBeInTheDocument();
		expect(screen.getByText("Custom Q2?")).toBeInTheDocument();
	});

	it("should have all FAQ buttons with aria-expanded attribute", () => {
		render(<FAQSection />);
		const buttons = screen.getAllByRole("button");
		for (const button of buttons) {
			expect(button).toHaveAttribute("aria-expanded");
		}
	});

	it("should expand FAQ answer when question is clicked", async () => {
		const user = userEvent.setup();
		const testFaqs = [{ question: "Test Question?", answer: "Test Answer content" }];
		render(<FAQSection faqs={testFaqs} />);

		const button = screen.getByText("Test Question?").closest("button");
		if (!button) throw new Error("Button not found");
		expect(button).toHaveAttribute("aria-expanded", "false");

		await user.click(button);
		expect(button).toHaveAttribute("aria-expanded", "true");
		expect(screen.getByText("Test Answer content")).toBeInTheDocument();
	});

	it("should collapse FAQ when clicked again", async () => {
		const user = userEvent.setup();
		const testFaqs = [{ question: "Toggle Q?", answer: "Toggle A" }];
		render(<FAQSection faqs={testFaqs} />);

		const button = screen.getByText("Toggle Q?").closest("button");
		if (!button) throw new Error("Button not found");

		// Open
		await user.click(button);
		expect(button).toHaveAttribute("aria-expanded", "true");

		// Close
		await user.click(button);
		expect(button).toHaveAttribute("aria-expanded", "false");
	});

	it("should only have one FAQ open at a time", async () => {
		const user = userEvent.setup();
		const testFaqs = [
			{ question: "First Q?", answer: "First A" },
			{ question: "Second Q?", answer: "Second A" },
		];
		render(<FAQSection faqs={testFaqs} />);

		const firstButton = screen.getByText("First Q?").closest("button");
		const secondButton = screen.getByText("Second Q?").closest("button");
		if (!firstButton || !secondButton) throw new Error("Buttons not found");

		// Open first
		await user.click(firstButton);
		expect(firstButton).toHaveAttribute("aria-expanded", "true");
		expect(secondButton).toHaveAttribute("aria-expanded", "false");

		// Open second (should close first)
		await user.click(secondButton);
		expect(firstButton).toHaveAttribute("aria-expanded", "false");
		expect(secondButton).toHaveAttribute("aria-expanded", "true");
	});
});
