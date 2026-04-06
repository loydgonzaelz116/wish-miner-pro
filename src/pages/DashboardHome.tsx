import { useState } from "react";
import { useNavigate } from "react-router-dom";
import KPICards from "@/components/dashboard/KPICards";
import SearchBar from "@/components/dashboard/SearchBar";
import WishCard from "@/components/dashboard/WishCard";
import { mockWishes } from "@/data/mockWishes";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

const DashboardHome = () => {
  const [wishes, setWishes] = useState(mockWishes);
  const navigate = useNavigate();

  const toggleSave = (id: string) => {
    setWishes(prev => prev.map(w => w.id === id ? { ...w, saved: !w.saved } : w));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold text-foreground">Good morning, Miner</h1>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-xs">These are real validated demands from X users begging for solutions. Each card represents a product opportunity.</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <p className="text-sm text-muted-foreground">Here's what people are wishing for today</p>
      </div>

      <KPICards />
      <SearchBar />

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Latest Validated Wishes</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {wishes.map(wish => (
            <WishCard
              key={wish.id}
              wish={wish}
              onSave={toggleSave}
              onViewDetail={(id) => navigate(`/dashboard/idea/${id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
