import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WishCard from "@/components/dashboard/WishCard";
import { mockWishes } from "@/data/mockWishes";
import { Lightbulb } from "lucide-react";

const MyIdeas = () => {
  const [ideas, setIdeas] = useState(mockWishes.slice(0, 3).map(w => ({ ...w, saved: true })));
  const navigate = useNavigate();

  const toggleSave = (id: string) => {
    setIdeas(prev => prev.filter(w => w.id !== id));
  };

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
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {ideas.map(wish => (
            <WishCard key={wish.id} wish={wish} onSave={toggleSave} onViewDetail={(id) => navigate(`/dashboard/idea/${id}`)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyIdeas;
