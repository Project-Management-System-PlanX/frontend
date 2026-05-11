import PortfolioNavbar from '@/components/PortfolioNavbar'
import BankingScaleHero from '@/components/BankingScaleHero'
import FeaturesSection from '@/components/FeatureSection'
import ServicesSection from '@/components/ServiceSection'
import IntegrationCarousel from '@/components/IntegrationCarousel'
import StatsAndCTA from '@/components/StatsAndCTA'
import Footer from '@/components/Footer'

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
	)
}