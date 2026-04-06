import { useState } from "react";
import { useNavigate } from "react-router-dom";
import KPICards from "@/components/dashboard/KPICards";
import SearchBar from "@/components/dashboard/SearchBar";
import WishCard from "@/components/dashboard/WishCard";
import { mockWishes } from "@/data/mockWishes";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { saveIdea } from "@/lib/savedIdeas";
import { toast } from "sonner";
import { useSearchWishes } from "@/hooks/useSearchWishes";

const DashboardHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wishes: liveWishes, setWishes: setLiveWishes, loading, error, fromCache, hasSearched, search } = useSearchWishes();

  // Show mock wishes before first search, live wishes after
  const displayWishes = hasSearched ? liveWishes : mockWishes.map(w => ({ ...w }));

  const toggleSave = async (id: string) => {
    const wish = displayWishes.find(w => w.id === id);
    if (!wish || !user) return;

    try {
      await saveIdea(user.id, wish);
      if (hasSearched) {
        setLiveWishes(prev => prev.map(w => w.id === id ? { ...w, saved: true } : w));
      }
      toast.success("Idea saved!");
    } catch {
      toast.error("Failed to save idea");
    }
  };

  const displayName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Miner";

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold text-foreground">Good morning, {displayName}</h1>
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
      <SearchBar onSearch={search} />

      {loading && (
        <div className="flex items-center justify-center py-12 gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Mining real wishes from X… this may take a minute</span>
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-8">
          <p className="text-sm text-destructive">{error}</p>
          <p className="text-xs text-muted-foreground mt-1">Showing mock data below</p>
        </div>
      )}

      {!loading && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              {hasSearched ? "Live Wishes from X" : "Latest Validated Wishes"}
            </h2>
            {hasSearched && (
              <span className="text-xs text-muted-foreground">
                {fromCache ? "📦 Cached results" : "🔴 Live from X"} • Powered by Apify
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {displayWishes.map(wish => (
              <WishCard
                key={wish.id}
                wish={wish}
                onSave={toggleSave}
                onViewDetail={(id) => navigate(`/dashboard/idea/${id}`)}
              />
            ))}
          </div>
          {hasSearched && displayWishes.length === 0 && !error && (
            <p className="text-center text-sm text-muted-foreground py-8">No wishes found for this search. Try different keywords.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
