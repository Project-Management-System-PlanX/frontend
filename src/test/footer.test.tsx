import { cleanup, render } from "@testing-library/react";
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
		const { getByText } = render(<Footer />);
		expect(getByText("TeamUp")).toBeInTheDocument();
	});

	it("should render custom company name", () => {
		const { getByText } = render(<Footer companyName="MyCompany" />);
		expect(getByText("MyCompany")).toBeInTheDocument();
	});

	it("should render the default tagline", () => {
		const { getByText } = render(<Footer />);
		expect(getByText("The Intelligence Layer for Modern Management")).toBeInTheDocument();
	});

	it("should render custom tagline", () => {
		const { getByText } = render(<Footer tagline="Custom Tagline" />);
		expect(getByText("Custom Tagline")).toBeInTheDocument();
	});

	it("should render all default footer sections", () => {
		const { getByText } = render(<Footer />);
		expect(getByText("Product")).toBeInTheDocument();
		expect(getByText("Company")).toBeInTheDocument();
		expect(getByText("Resources")).toBeInTheDocument();
		expect(getByText("Legal")).toBeInTheDocument();
	});

	it("should render default footer links", () => {
		const { getByText } = render(<Footer />);
		expect(getByText("Features")).toBeInTheDocument();
		expect(getByText("Pricing")).toBeInTheDocument();
		expect(getByText("About")).toBeInTheDocument();
		expect(getByText("Privacy Policy")).toBeInTheDocument();
		expect(getByText("Terms of Service")).toBeInTheDocument();
	});

	it("should render social link icons with aria labels", () => {
		const { getByLabelText } = render(<Footer />);
		expect(getByLabelText("Twitter")).toBeInTheDocument();
		expect(getByLabelText("LinkedIn")).toBeInTheDocument();
		expect(getByLabelText("GitHub")).toBeInTheDocument();
		expect(getByLabelText("Email")).toBeInTheDocument();
	});

	it("should render copyright text with current year", () => {
		const { getByText } = render(<Footer />);
		const year = new Date().getFullYear();
		expect(getByText(`© ${year} TeamUp. All rights reserved.`)).toBeInTheDocument();
	});

	it("should render custom copyright text", () => {
		const { getByText } = render(<Footer copyrightText="© 2025 Custom Corp." />);
		expect(getByText("© 2025 Custom Corp.")).toBeInTheDocument();
	});

	it("should render bottom bar links", () => {
		const { getByText } = render(<Footer />);
		expect(getByText("Status")).toBeInTheDocument();
		expect(getByText("Sitemap")).toBeInTheDocument();
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
		const { getByText } = render(<Footer sections={customSections} />);
		expect(getByText("Support")).toBeInTheDocument();
		expect(getByText("Help Desk")).toBeInTheDocument();
		expect(getByText("FAQ")).toBeInTheDocument();
	});

	it("should not render social icons when links are not provided", () => {
		const { queryByLabelText } = render(<Footer socialLinks={{}} />);
		expect(queryByLabelText("Twitter")).not.toBeInTheDocument();
		expect(queryByLabelText("LinkedIn")).not.toBeInTheDocument();
		expect(queryByLabelText("GitHub")).not.toBeInTheDocument();
		expect(queryByLabelText("Email")).not.toBeInTheDocument();
	});
});
