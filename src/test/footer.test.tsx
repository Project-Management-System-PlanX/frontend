import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Footer } from "@/components/Footer";

// Mock framer-motion
vi.mock("framer-motion", () => ({
	motion: {
		div: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => {
			const { initial, animate, exit, transition, whileInView, viewport, ...rest } =
				props as Record<string, unknown>;
			return <div {...(rest as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
		},
	},
}));

afterEach(() => {
	cleanup();
});

describe("Footer", () => {
	it("should render the default company name", () => {
		render(<Footer />);
		expect(screen.getByText("TeamUp")).toBeInTheDocument();
	});

	it("should render custom company name", () => {
		render(<Footer companyName="MyCompany" />);
		expect(screen.getByText("MyCompany")).toBeInTheDocument();
	});

	it("should render the default tagline", () => {
		render(<Footer />);
		expect(screen.getByText("The Intelligence Layer for Modern Management")).toBeInTheDocument();
	});

	it("should render custom tagline", () => {
		render(<Footer tagline="Custom Tagline" />);
		expect(screen.getByText("Custom Tagline")).toBeInTheDocument();
	});

	it("should render all default footer sections", () => {
		render(<Footer />);
		expect(screen.getByText("Product")).toBeInTheDocument();
		expect(screen.getByText("Company")).toBeInTheDocument();
		expect(screen.getByText("Resources")).toBeInTheDocument();
		expect(screen.getByText("Legal")).toBeInTheDocument();
	});

	it("should render default footer links", () => {
		render(<Footer />);
		expect(screen.getByText("Features")).toBeInTheDocument();
		expect(screen.getByText("Pricing")).toBeInTheDocument();
		expect(screen.getByText("About")).toBeInTheDocument();
		expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
		expect(screen.getByText("Terms of Service")).toBeInTheDocument();
	});

	it("should render social link icons with aria labels", () => {
		render(<Footer />);
		expect(screen.getByLabelText("Twitter")).toBeInTheDocument();
		expect(screen.getByLabelText("LinkedIn")).toBeInTheDocument();
		expect(screen.getByLabelText("GitHub")).toBeInTheDocument();
		expect(screen.getByLabelText("Email")).toBeInTheDocument();
	});

	it("should render copyright text with current year", () => {
		render(<Footer />);
		const year = new Date().getFullYear();
		expect(screen.getByText(`© ${year} TeamUp. All rights reserved.`)).toBeInTheDocument();
	});

	it("should render custom copyright text", () => {
		render(<Footer copyrightText="© 2025 Custom Corp." />);
		expect(screen.getByText("© 2025 Custom Corp.")).toBeInTheDocument();
	});

	it("should render bottom bar links", () => {
		render(<Footer />);
		expect(screen.getByText("Status")).toBeInTheDocument();
		expect(screen.getByText("Sitemap")).toBeInTheDocument();
	});

	it("should render custom sections", () => {
		const customSections = [
			{
				title: "Support",
				links: [
					{ label: "Help Desk", href: "#help" },
					{ label: "FAQ", href: "#faq" },
				],
			},
		];
		render(<Footer sections={customSections} />);
		expect(screen.getByText("Support")).toBeInTheDocument();
		expect(screen.getByText("Help Desk")).toBeInTheDocument();
		expect(screen.getByText("FAQ")).toBeInTheDocument();
	});

	it("should not render social icons when links are not provided", () => {
		render(<Footer socialLinks={{}} />);
		expect(screen.queryByLabelText("Twitter")).not.toBeInTheDocument();
		expect(screen.queryByLabelText("LinkedIn")).not.toBeInTheDocument();
		expect(screen.queryByLabelText("GitHub")).not.toBeInTheDocument();
		expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
	});
});
