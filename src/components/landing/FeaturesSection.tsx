import { Search, Layers, Download, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Mine Real Wishes",
    description: 'Search "I wish there was..." posts with filters for likes, date, and niche. Only validated demand.',
  },
  {
    icon: Layers,
    title: "Auto-Cluster Themes",
    description: "Similar wishes grouped automatically — see that 200+ people want the same meal prep tool.",
  },
  {
    icon: TrendingUp,
    title: "Feature Lists from Replies",
    description: "Quote replies become your feature spec. Users literally tell you what to build.",
  },
  {
    icon: Download,
    title: "Export & Launch Same Day",
    description: "One-click export to CSV, formatted doc, or landing page preview. Ship on Gumroad today.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          From complaint to product in 4 steps
        </h2>
        <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
          Stop guessing. Start building what people are already begging for.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="group p-6 rounded-xl border border-border/50 hover:border-primary/30 transition-all hover:shadow-elevated">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
