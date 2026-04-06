import { TrendingUp, Lightbulb, DollarSign } from "lucide-react";

const kpis = [
  { label: "Trending Wishes Today", value: "42", icon: TrendingUp, change: "+12 from yesterday" },
  { label: "Total Opportunities Found", value: "1,284", icon: Lightbulb, change: "+86 this week" },
  { label: "Potential Revenue Ideas", value: "18", icon: DollarSign, change: "3 high demand" },
];

const KPICards = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    {kpis.map((kpi, i) => (
      <div key={i} className="bg-card rounded-xl border border-border/50 p-5 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{kpi.label}</span>
          <kpi.icon className="h-4 w-4 text-primary" />
        </div>
        <p className="text-3xl font-bold text-card-foreground">{kpi.value}</p>
        <p className="text-xs text-muted-foreground mt-1">{kpi.change}</p>
      </div>
    ))}
  </div>
);

export default KPICards;
