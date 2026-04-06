import { Pickaxe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const LandingNav = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pickaxe className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-foreground">WishMiner</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="text-muted-foreground hover:text-foreground">
            Log in
          </Button>
          <Button size="sm" onClick={() => navigate("/login")} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
            Sign up free
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default LandingNav;
