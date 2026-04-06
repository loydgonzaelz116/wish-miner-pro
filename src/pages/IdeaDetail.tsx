import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Heart, MessageCircle, Repeat2, Bookmark, Share2, ExternalLink, Sparkles, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { saveIdea } from "@/lib/savedIdeas";
import { toast } from "sonner";

interface IdeaData {
  id: string;
  text: string;
  author: string;
  handle: string;
  likes: number;
  replies: number;
  retweets: number;
  date: string;
  cluster: string;
  demandLevel: string;
  aiProductName?: string;
  aiDescription?: string;
  quoteSuggestions: string[];
  competitorGaps?: string[];
  tweetUrl?: string;
}

const clusters = ["AI Tools", "Freelance Finance", "Parenting Tech", "Meal Prep", "No-Code Tools", "Fitness Tech", "Fashion Tech", "Productivity"];

function classifyCluster(text: string): string {
  const lower = text.toLowerCase();
  if (lower.match(/ai|gpt|llm|automat|agent/)) return "AI Tools";
  if (lower.match(/freelanc|invoic|tax|expens|financ/)) return "Freelance Finance";
  if (lower.match(/parent|kid|child|baby|toddler/)) return "Parenting Tech";
  if (lower.match(/meal|cook|recipe|food|grocer/)) return "Meal Prep";
  if (lower.match(/no.?code|low.?code|template|build.*without/)) return "No-Code Tools";
  if (lower.match(/fit|gym|workout|exercise|health/)) return "Fitness Tech";
  if (lower.match(/fashion|cloth|wear|style|sizing/)) return "Fashion Tech";
  if (lower.match(/habit|product|calendar|task|focus/)) return "Productivity";
  return clusters[Math.floor(Math.random() * clusters.length)];
}

function classifyDemand(likes: number): string {
  if (likes >= 500) return "high";
  if (likes >= 100) return "medium";
  return "low";
}

const IdeaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [idea, setIdea] = useState<IdeaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchIdea(id);
  }, [id]);

  const fetchIdea = async (ideaId: string) => {
    setLoading(true);
    setNotFound(false);

    try {
      // Try x_posts table first (live search results)
      const { data: xPost } = await supabase
        .from("x_posts")
        .select("*")
        .eq("id", ideaId)
        .maybeSingle();

      if (xPost) {
        const tweetId = (xPost.raw_data as any)?.id || (xPost.raw_data as any)?.id_str || null;
        const tweetUrl = (xPost.raw_data as any)?.url || (tweetId ? `https://x.com/i/web/status/${tweetId}` : undefined);
        
        setIdea({
          id: xPost.id,
          text: xPost.post_text,
          author: xPost.author || "Unknown",
          handle: `@${xPost.author || "user"}`,
          likes: xPost.like_count || 0,
          replies: xPost.reply_count || 0,
          retweets: xPost.quote_count || 0,
          date: xPost.post_timestamp ? new Date(xPost.post_timestamp).toLocaleDateString() : "Recent",
          cluster: classifyCluster(xPost.post_text),
          demandLevel: classifyDemand(xPost.like_count || 0),
          quoteSuggestions: [],
          tweetUrl,
        });
        setLoading(false);
        return;
      }

      // Try saved_ideas table
      const { data: savedIdea } = await supabase
        .from("saved_ideas")
        .select("*")
        .eq("id", ideaId)
        .maybeSingle();

      if (savedIdea) {
        setIdea({
          id: savedIdea.id,
          text: savedIdea.wish_text,
          author: savedIdea.author || "Unknown",
          handle: savedIdea.handle || "@user",
          likes: savedIdea.likes || 0,
          replies: savedIdea.replies || 0,
          retweets: savedIdea.retweets || 0,
          date: savedIdea.date || "Unknown",
          cluster: savedIdea.cluster || "General",
          demandLevel: savedIdea.demand_level || "medium",
          aiProductName: savedIdea.ai_product_name || undefined,
          aiDescription: savedIdea.ai_description || undefined,
          quoteSuggestions: savedIdea.quote_suggestions || [],
          competitorGaps: savedIdea.competitor_gaps || undefined,
        });
        setLoading(false);
        return;
      }

      setNotFound(true);
    } catch (err) {
      console.error("Error fetching idea:", err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !idea) return;
    try {
      await saveIdea(user.id, {
        id: idea.id,
        text: idea.text,
        author: idea.author,
        handle: idea.handle,
        likes: idea.likes,
        replies: idea.replies,
        retweets: idea.retweets,
        date: idea.date,
        cluster: idea.cluster,
        demandLevel: idea.demandLevel as "high" | "medium" | "low",
        quoteSuggestions: idea.quoteSuggestions,
        aiProductName: idea.aiProductName,
        aiDescription: idea.aiDescription,
        competitorGaps: idea.competitorGaps,
        saved: false,
      });
      toast.success("Saved to My Ideas!");
    } catch {
      toast.error("Failed to save — may already be saved");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Loading idea…</span>
      </div>
    );
  }

  if (notFound || !idea) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <AlertTriangle className="h-10 w-10 text-warning mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-2">This idea may have expired</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Live search results are cached for 24 hours. Try running a new search to find fresh ideas.
        </p>
        <Button onClick={() => navigate("/dashboard")} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          ← Back to Search
        </Button>
      </div>
    );
  }

  const shareText = encodeURIComponent(`🔥 Found a hot product idea on WishMiner:\n\n"${idea.text.slice(0, 100)}..."\n\n${idea.likes.toLocaleString()} likes. Someone should build this!`);

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Main tweet card */}
      <div className="bg-card rounded-xl border border-border/50 p-6 shadow-card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Badge className="bg-primary/10 text-primary border-primary/20">{idea.cluster}</Badge>
          <Badge variant="outline" className={idea.demandLevel === "high" ? "bg-primary/10 text-primary border-primary/20" : "bg-warning/10 text-warning border-warning/20"}>
            {idea.demandLevel === "high" ? "🔥 High Demand" : idea.demandLevel === "medium" ? "⚡ Medium Demand" : "Low Demand"}
          </Badge>
        </div>

        <p className="text-lg text-card-foreground leading-relaxed mb-4 whitespace-pre-wrap">{idea.text}</p>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <span className="font-medium text-card-foreground">{idea.author}</span>
          <span>{idea.handle}</span>
          <span>· {idea.date}</span>
        </div>

        <div className="flex items-center gap-5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Heart className="h-4 w-4" />{idea.likes.toLocaleString()}</span>
          <span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" />{idea.replies.toLocaleString()}</span>
          <span className="flex items-center gap-1"><Repeat2 className="h-4 w-4" />{idea.retweets.toLocaleString()}</span>
        </div>
      </div>

      {/* AI-suggested product (if available) */}
      {idea.aiProductName && (
        <div className="bg-card rounded-xl border border-primary/20 p-6 shadow-card mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-card-foreground">AI-Suggested Product</h3>
          </div>
          <p className="text-xl font-bold text-primary mb-2">{idea.aiProductName}</p>
          {idea.aiDescription && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{idea.aiDescription}</p>
          )}

          {idea.quoteSuggestions.length > 0 && (
            <>
              <h4 className="text-sm font-semibold text-card-foreground mb-2">Feature List (from replies)</h4>
              <ul className="space-y-2 mb-6">
                {idea.quoteSuggestions.map((s, i) => (
                  <li key={i} className="text-sm text-card-foreground flex items-start gap-2">
                    <span className="text-primary font-bold mt-0.5">✓</span> {s}
                  </li>
                ))}
              </ul>
            </>
          )}

          {idea.competitorGaps && idea.competitorGaps.length > 0 && (
            <>
              <h4 className="text-sm font-semibold text-card-foreground mb-2">Competitor Gaps</h4>
              <ul className="space-y-1.5">
                {idea.competitorGaps.map((g, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-warning">⚠</span> {g}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleSave}>
          <Bookmark className="h-4 w-4 mr-2" /> Save to My Ideas
        </Button>
        {idea.tweetUrl && (
          <Button variant="outline" className="border-border/50" onClick={() => window.open(idea.tweetUrl, '_blank')}>
            <ExternalLink className="h-4 w-4 mr-2" /> View Original Tweet
          </Button>
        )}
        <Button variant="outline" className="border-border/50" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${shareText}`, '_blank')}>
          <Share2 className="h-4 w-4 mr-2" /> Share on X
        </Button>
      </div>
    </div>
  );
};

export default IdeaDetail;
