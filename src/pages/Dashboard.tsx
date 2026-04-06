import { useEffect } from "react";
import { Outlet, useNavigate, useSearchParams } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Star } from "lucide-react";
import { usePlanTier } from "@/hooks/usePlanTier";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { tier, isLifetime, isPaid } = usePlanTier();

  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      const tierName = searchParams.get("tier");
      toast.success(`🎉 Welcome to ${tierName === "lifetime" ? "Lifetime" : tierName === "pro" ? "Pro" : "Founder's Pass"}! Your plan is now active.`);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
  <div className="dark">
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between border-b border-border/50 px-4 bg-background/80 backdrop-blur-sm">
            <div className="flex items-center">
              <SidebarTrigger className="mr-4" />
              <span className="text-sm text-muted-foreground">Dashboard</span>
              {isLifetime && (
                <Badge className="ml-3 bg-amber-500/20 text-amber-400 border-amber-500/30">
                  <Star className="h-3 w-3 mr-1 fill-amber-400" />
                  Founding Member
                </Badge>
              )}
            </div>
            {!isPaid && (
              <Button size="sm" onClick={() => navigate("/pricing")} className="gap-1.5">
                <Crown className="h-3.5 w-3.5" />
                Upgrade
              </Button>
            )}
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  </div>
);

};

export default Dashboard;
