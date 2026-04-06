import { ArrowRight, Sparkles, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-hero-gradient overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(hsl(152, 60%, 48%) 1px, transparent 1px), linear-gradient(90deg, hsl(152, 60%, 48%) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />
      
      {/* Glow orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-10 animate-pulse-glow" 
        style={{ background: 'radial-gradient(circle, hsl(152, 60%, 48%), transparent 70%)' }} />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-8">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm text-primary font-medium">Mining real demand from X — so you build what people beg for</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6" style={{ color: 'hsl(0, 0%, 95%)' }}>
          Turn X complaints into your next{" "}
          <span className="text-gradient">$5K product</span>{" "}
          in minutes
        </h1>

        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10" style={{ color: 'hsl(220, 10%, 55%)' }}>
          WishMiner discovers validated product ideas from real "I wish there was..." posts on X. 
          Clustered themes, feature lists from replies, and one-click export to launch day.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button 
            size="lg" 
            className="h-13 px-8 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
            onClick={() => navigate("/login")}
          >
            Start mining free <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="h-13 px-8 text-base rounded-xl border-border/50 bg-secondary/10 text-foreground hover:bg-secondary/20"
            onClick={() => navigate("/login")}
          >
            See demo dashboard
          </Button>
        </div>

        {/* Sample cards preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {[
            { text: '"I wish there was a simple expense tracker for freelancers..."', likes: "1.4k", tag: "Freelance Finance" },
            { text: '"Why isn\'t there a bra sizing tool that actually works?"', likes: "2.9k", tag: "Fashion Tech" },
            { text: '"Someone should make a meal prep planner with local sales..."', likes: "892", tag: "Meal Prep" },
          ].map((item, i) => (
            <div key={i} className="glass rounded-xl p-5 text-left opacity-0 animate-fade-in" style={{ animationDelay: `${i * 150}ms` }}>
              <p className="text-sm mb-3" style={{ color: 'hsl(220, 10%, 70%)' }}>{item.text}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium px-2 py-1 rounded-md bg-primary/10 text-primary">{item.tag}</span>
                <div className="flex items-center gap-1 text-xs" style={{ color: 'hsl(220, 10%, 50%)' }}>
                  <TrendingUp className="h-3 w-3 text-primary" />
                  {item.likes} likes
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
