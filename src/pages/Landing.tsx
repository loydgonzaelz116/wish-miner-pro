import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FooterSection from "@/components/landing/FooterSection";

const Landing = () => (
  <div className="min-h-screen bg-background dark">
    <LandingNav />
    <HeroSection />
    <FeaturesSection />
    <TestimonialsSection />
    <FooterSection />
  </div>
);

export default Landing;
