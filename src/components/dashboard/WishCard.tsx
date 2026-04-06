import { Heart, MessageCircle, Repeat2, Bookmark, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Wish } from "@/data/mockWishes";

interface WishCardProps {
  wish: Wish;
  onSave?: (id: string) => void;
  onViewDetail?: (id: string) => void;
}

const demandColors: Record<string, string> = {
  high: "bg-primary/10 text-primary border-primary/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-muted text-muted-foreground border-border",
};

const WishCard = ({ wish, onSave, onViewDetail }: WishCardProps) => (
  <div className="group bg-card rounded-xl border border-border/50 p-5 hover:border-primary/30 transition-all hover:shadow-elevated cursor-pointer"
    onClick={() => onViewDetail?.(wish.id)}>
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={demandColors[wish.demandLevel]}>
          {wish.demandLevel === "high" ? "🔥 High Demand" : wish.demandLevel === "medium" ? "⚡ Medium" : "Low"}
        </Badge>
        <Badge variant="outline" className="bg-secondary/50 text-muted-foreground border-border/50 text-xs">
          {wish.cluster}
        </Badge>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-primary"
        onClick={(e) => { e.stopPropagation(); onSave?.(wish.id); }}>
        <Bookmark className={`h-4 w-4 ${wish.saved ? "fill-primary text-primary" : ""}`} />
      </Button>
    </div>

    <p className="text-sm text-card-foreground leading-relaxed mb-3 line-clamp-3">{wish.text}</p>

    <div className="flex items-center gap-1 mb-4 text-xs text-muted-foreground">
      <span className="font-medium text-card-foreground">{wish.author}</span>
      <span>{wish.handle}</span>
      <span className="mx-1">·</span>
      <span>{wish.date}</span>
    </div>

    <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{wish.likes.toLocaleString()}</span>
      <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{wish.replies}</span>
      <span className="flex items-center gap-1"><Repeat2 className="h-3.5 w-3.5" />{wish.retweets}</span>
    </div>

    {wish.quoteSuggestions.length > 0 && (
      <div className="border-t border-border/50 pt-3">
        <p className="text-xs font-medium text-muted-foreground mb-2">Top feature suggestions from replies:</p>
        <ul className="space-y-1">
          {wish.quoteSuggestions.slice(0, 3).map((s, i) => (
            <li key={i} className="text-xs text-card-foreground flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span> {s}
            </li>
          ))}
        </ul>
      </div>
    )}

    <div className="mt-4 flex justify-end">
      <span className="text-xs text-primary font-medium flex items-center gap-1 group-hover:underline">
        View details <ArrowRight className="h-3 w-3" />
      </span>
    </div>
  </div>
);

export default WishCard;
