import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, MessageCircle, Repeat2, Bookmark, Share2, Download, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockWishes } from "@/data/mockWishes";
import { useAuth } from "@/hooks/useAuth";
import { saveIdea } from "@/lib/savedIdeas";
import { toast } from "sonner";

const IdeaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const wish = mockWishes.find(w => w.id === id);

  if (!wish) return <div className="p-8 text-muted-foreground">Idea not found.</div>;

  const handleSave = async () => {
    if (!user) return;
    try {
      await saveIdea(user.id, wish);
      toast.success("Saved to My Ideas!");
    } catch {
      toast.error("Failed to save — may already be saved");
    }
  };

  const shareText = encodeURIComponent(`🔥 Found a hot product idea on WishMiner:\n\n"${wish.text.slice(0, 100)}..."\n\n${wish.likes.toLocaleString()} likes. Someone should build this!`);

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="bg-card rounded-xl border border-border/50 p-6 shadow-card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Badge className="bg-primary/10 text-primary border-primary/20">{wish.cluster}</Badge>
          <Badge variant="outline" className={wish.demandLevel === "high" ? "bg-primary/10 text-primary border-primary/20" : "bg-warning/10 text-warning border-warning/20"}>
            {wish.demandLevel === "high" ? "🔥 High Demand" : "⚡ Medium Demand"}
          </Badge>
        </div>

        <p className="text-lg text-card-foreground leading-relaxed mb-4">{wish.text}</p>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <span className="font-medium text-card-foreground">{wish.author}</span>
          <span>{wish.handle}</span>
          <span>· {wish.date}</span>
        </div>

        <div className="flex items-center gap-5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Heart className="h-4 w-4" />{wish.likes.toLocaleString()}</span>
          <span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" />{wish.replies}</span>
          <span className="flex items-center gap-1"><Repeat2 className="h-4 w-4" />{wish.retweets}</span>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-primary/20 p-6 shadow-card mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-card-foreground">AI-Suggested Product</h3>
        </div>
        <p className="text-xl font-bold text-primary mb-2">{wish.aiProductName}</p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{wish.aiDescription}</p>
        
        <h4 className="text-sm font-semibold text-card-foreground mb-2">Feature List (from replies)</h4>
        <ul className="space-y-2 mb-6">
          {wish.quoteSuggestions.map((s, i) => (
            <li key={i} className="text-sm text-card-foreground flex items-start gap-2">
              <span className="text-primary font-bold mt-0.5">✓</span> {s}
            </li>
          ))}
        </ul>

        {wish.competitorGaps && (
          <>
            <h4 className="text-sm font-semibold text-card-foreground mb-2">Competitor Gaps</h4>
            <ul className="space-y-1.5">
              {wish.competitorGaps.map((g, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-warning">⚠</span> {g}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleSave}>
          <Bookmark className="h-4 w-4 mr-2" /> Save to My Ideas
        </Button>
        <Button variant="outline" className="border-border/50" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${shareText}`, '_blank')}>
          <Share2 className="h-4 w-4 mr-2" /> Share on X
        </Button>
        <Button variant="outline" className="border-border/50">
          <Download className="h-4 w-4 mr-2" /> Export as CSV
        </Button>
        <Button variant="outline" className="border-border/50">
          <ExternalLink className="h-4 w-4 mr-2" /> Export Landing Page
        </Button>
      </div>
    </div>
  );
};

export default IdeaDetail;
