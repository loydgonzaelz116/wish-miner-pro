import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Jake Morrison",
    role: "Indie Maker",
    text: "Found a freelance expense template idea with 1.4k likes → sold $5k first month on Gumroad. WishMiner paid for itself 100x over.",
    avatar: "JM",
  },
  {
    name: "Aisha Patel",
    role: "Solo Developer",
    text: "Built a niche directory in 2 days after WishMiner surfaced the demand. Already getting 50 submissions a week and charging for featured listings.",
    avatar: "AP",
  },
  {
    name: "Chris Yang",
    role: "Product Builder",
    text: "I used to spend hours scrolling X for ideas. Now I get validated demand with feature lists in seconds. Game changer for solo builders.",
    avatar: "CY",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 px-6 bg-secondary/30">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Builders are already shipping with WishMiner
        </h2>
        <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
          Real indie makers finding real demand and launching real products.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-card rounded-xl p-6 shadow-card border border-border/50">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-card-foreground mb-6 leading-relaxed">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
