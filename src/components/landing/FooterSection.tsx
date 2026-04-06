import { Pickaxe } from "lucide-react";

const FooterSection = () => (
  <footer className="py-16 px-6 border-t border-border/50">
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-2">
        <Pickaxe className="h-5 w-5 text-primary" />
        <span className="font-semibold">WishMiner</span>
      </div>
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <span>Free tier: 10 searches/day</span>
        <span className="text-primary font-medium">Pro: $19/mo unlimited</span>
      </div>
      <p className="text-xs text-muted-foreground">© 2024 WishMiner. All rights reserved.</p>
    </div>
  </footer>
);

export default FooterSection;
