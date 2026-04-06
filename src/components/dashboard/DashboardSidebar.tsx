import { Home, Search, Lightbulb, Download, Settings, Pickaxe, TrendingUp, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { trendingNiches } from "@/data/mockWishes";

const navItems = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Search Miner", url: "/dashboard/search", icon: Search },
  { title: "My Ideas", url: "/dashboard/ideas", icon: Lightbulb },
  { title: "Exports", url: "/dashboard/exports", icon: Download },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="p-4 flex items-center gap-2">
          <Pickaxe className="h-6 w-6 text-primary shrink-0" />
          {!collapsed && <span className="text-lg font-bold text-sidebar-accent-foreground">WishMiner</span>}
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel>
              <TrendingUp className="h-3 w-3 mr-1" />
              Trending Niches
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-3 space-y-2">
                {trendingNiches.slice(0, 5).map((n) => (
                  <div key={n.name} className="flex items-center justify-between text-xs">
                    <span className="text-sidebar-foreground truncate">{n.name}</span>
                    <span className="text-primary font-medium">{n.trend}</span>
                  </div>
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
