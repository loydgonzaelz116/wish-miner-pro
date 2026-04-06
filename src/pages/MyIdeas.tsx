import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lightbulb, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { fetchSavedIdeas, deleteIdea, updateIdeaBuiltStatus } from "@/lib/savedIdeas";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type SavedIdea = Database["public"]["Tables"]["saved_ideas"]["Row"];

const MyIdeas = () => {
  const [ideas, setIdeas] = useState<SavedIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    fetchSavedIdeas(user.id).then(data => {
      setIdeas(data || []);
      setLoading(false);
    }).catch(() => {
      toast.error("Failed to load ideas");
      setLoading(false);
    });
  }, [user]);

  const handleDelete = async (id: string) => {
    try {
      await deleteIdea(id);
      setIdeas(prev => prev.filter(i => i.id !== id));
      toast.success("Idea removed");
    } catch {
      toast.error("Failed to remove idea");
    }
  };

  const toggleBuilt = async (id: string, current: boolean) => {
    try {
      await updateIdeaBuiltStatus(id, !current);
      setIdeas(prev => prev.map(i => i.id === id ? { ...i, built_status: !current } : i));
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground animate-pulse-glow">Loading your ideas...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-primary" /> My Ideas
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Your saved product opportunities — {ideas.length} ideas</p>
      </div>

      {ideas.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No saved ideas yet. Start mining to find opportunities!</p>
          <Button variant="outline" className="mt-4 border-border/50" onClick={() => navigate("/dashboard")}>
            Go mining
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {ideas.map(idea => (
            <div key={idea.id} className="bg-card rounded-xl border border-border/50 p-5 shadow-card">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={
                    idea.demand_level === "high" 
                      ? "bg-primary/10 text-primary border-primary/20" 
                      : "bg-warning/10 text-warning border-warning/20"
                  }>
                    {idea.demand_level === "high" ? "🔥 High Demand" : "⚡ Medium"}
                  </Badge>
                  {idea.cluster && (
                    <Badge variant="outline" className="bg-secondary/50 text-muted-foreground border-border/50 text-xs">
                      {idea.cluster}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(idea.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <p className="text-sm text-card-foreground leading-relaxed mb-3 line-clamp-3">{idea.wish_text}</p>

              {idea.ai_product_name && (
                <p className="text-sm font-semibold text-primary mb-2">💡 {idea.ai_product_name}</p>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <span>❤️ {idea.likes?.toLocaleString()}</span>
                <span>💬 {idea.replies}</span>
                <span>{idea.author} {idea.handle}</span>
              </div>

              <div className="flex items-center justify-between border-t border-border/50 pt-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`text-xs ${idea.built_status ? "text-primary" : "text-muted-foreground"}`}
                  onClick={() => toggleBuilt(idea.id, idea.built_status || false)}
                >
                  {idea.built_status ? "✅ Built" : "🔲 Mark as built"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyIdeas;
