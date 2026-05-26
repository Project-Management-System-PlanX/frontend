import BankingScaleHero from "@/components/BankingScaleHero";
import FeaturesSection from "@/components/FeatureSection";
import Footer from "@/components/Footer";
import IntegrationCarousel from "@/components/IntegrationCarousel";
import PortfolioNavbar from "@/components/PortfolioNavbar";
import ServicesSection from "@/components/ServiceSection";
import StatsAndCTA from "@/components/StatsAndCTA";

export default function Page() {
	return (
		<>
			<PortfolioNavbar />
			<BankingScaleHero />
			<FeaturesSection />
			<ServicesSection />
			<IntegrationCarousel />
			<StatsAndCTA />
			<Footer />
		</>
	);
}
