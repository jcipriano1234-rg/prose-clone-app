import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import DemoSection from "@/components/landing/DemoSection";
import HowItWorks from "@/components/landing/HowItWorks";
import FeaturesSection from "@/components/landing/FeaturesSection";
import TestimonialSection from "@/components/landing/TestimonialSection";
import PricingSection from "@/components/landing/PricingSection";
import CtaSection from "@/components/landing/CtaSection";
import LandingFooter from "@/components/landing/LandingFooter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <LandingNav />
      <HeroSection />
      <DemoSection />
      <HowItWorks />
      <FeaturesSection />
      <TestimonialSection />
      <PricingSection />
      <CtaSection />
      <LandingFooter />
    </div>
  );
}
