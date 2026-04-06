import { Settings, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SettingsPage = () => (
  <div className="max-w-2xl mx-auto space-y-8">
    <div>
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <Settings className="h-6 w-6 text-primary" /> Settings
      </h1>
    </div>

    <div className="bg-card rounded-xl border border-border/50 p-6 shadow-card">
      <h3 className="font-semibold text-card-foreground mb-4">Current Plan</h3>
      <div className="flex items-center justify-between">
        <div>
          <Badge variant="outline" className="bg-secondary/50 text-muted-foreground mb-2">Free Tier</Badge>
          <p className="text-sm text-muted-foreground">10 searches/day · Limited exports</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Crown className="h-4 w-4 mr-2" /> Upgrade to Pro — $19/mo
        </Button>
      </div>
    </div>

    <div className="bg-card rounded-xl border border-border/50 p-6 shadow-card">
      <h3 className="font-semibold text-card-foreground mb-4">Account</h3>
      <div className="text-sm text-muted-foreground space-y-2">
        <p>Email: user@example.com</p>
        <p>Member since: March 2024</p>
      </div>
    </div>
  </div>
);

export default SettingsPage;
