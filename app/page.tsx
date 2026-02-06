import { BankingScaleHero } from "@/components/BankingScaleHero";
import { CaseStudiesCarousel } from "@/components/CaseStudiesCarousel";
import { FAQSection } from "@/components/FAQSection";
import { Footer } from "@/components/Footer";
import { IntegrationCarousel } from "@/components/IntegrationCarousel";
import { PortfolioNavbar } from "@/components/PortfolioNavbar";
import { PricingSection } from "@/components/PricingSection";
import { ProductTeaserCard } from "@/components/ProductTeaserCard";

export default function Page() {
	return (
		<>
			<PortfolioNavbar />
			<ProductTeaserCard />
			<BankingScaleHero />
			<CaseStudiesCarousel />
			<IntegrationCarousel />
			<PricingSection />
			<FAQSection />
			<Footer />
		</>
	);
}
