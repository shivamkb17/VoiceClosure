import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorks from "@/components/landing/HowItWorks";
import DemoPreview from "@/components/landing/DemoPreview";
import Testimonials from "@/components/landing/Testimonials";
import PricingPreview from "@/components/landing/PricingPreview";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <DemoPreview />
      <Testimonials />
      <PricingPreview />
      <FinalCTA />
      <Footer />
    </main>
  );
}
