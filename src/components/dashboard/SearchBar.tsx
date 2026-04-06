import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const quickFilters = ["I wish there was", "Why isn't there", "Need an app for", "Someone should make"];
const nicheFilters = ["Freelance", "Parenting", "Fitness", "AI Tools", "Meal Prep", "No-Code"];

const SearchBar = ({ onSearch }: { onSearch?: (q: string) => void }) => {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onSearch?.(query)}
            placeholder='Search wishes... try "expense tracker" or "meal prep"'
            className="pl-10 bg-secondary/30 border-border/50 h-11 text-foreground"
          />
        </div>
        <Button variant="outline" size="icon" className="h-11 w-11 border-border/50" onClick={() => setShowFilters(!showFilters)}>
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
        <Button className="h-11 bg-primary hover:bg-primary/90 text-primary-foreground px-6" onClick={() => onSearch?.(query)}>
          Mine
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {quickFilters.map(f => (
          <Badge key={f} variant="outline" className="cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors text-xs"
            onClick={() => { setQuery(f); onSearch?.(f); }}>
            {f}
          </Badge>
        ))}
      </div>

      {showFilters && (
        <div className="p-4 bg-card rounded-xl border border-border/50 space-y-3 animate-fade-in">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground mr-2 self-center">Niche:</span>
            {nicheFilters.map(n => (
              <Badge key={n} variant="outline" className="cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors text-xs">
                {n}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Min likes: 50+</span>
            <span>Date: Last 30 days</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
