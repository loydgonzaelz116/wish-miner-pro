import { Download, FileText, Code, Table, Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { usePlanTier } from "@/hooks/usePlanTier";
import { fetchSavedIdeas } from "@/lib/savedIdeas";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

function exportToCSV(ideas: any[]) {
  const headers = [
    "Wish Text", "Author", "Handle", "Likes", "Replies", "Retweets",
    "Demand Level", "Cluster", "AI Product Name", "AI Description",
    "Priority Score", "Built", "Date Saved"
  ];

  const escape = (val: any) => {
    const str = String(val ?? "");
    return str.includes(",") || str.includes('"') || str.includes("\n")
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };

  const rows = ideas.map(i => [
    i.wish_text, i.author, i.handle, i.likes, i.replies, i.retweets,
    i.demand_level, i.cluster, i.ai_product_name, i.ai_description,
    i.priority_score, i.built_status ? "Yes" : "No",
    new Date(i.created_at).toLocaleDateString()
  ].map(escape).join(","));

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `wishminer-ideas-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const exportOptions = [
  { icon: Table, title: "CSV Export", desc: "Download ideas as CSV for Notion or Airtable", format: "csv" },
  { icon: FileText, title: "Formatted Summary", desc: "Google Docs-style document with feature lists", format: "doc" },
  { icon: Code, title: "Landing Page HTML", desc: "Basic landing page preview with buy button", format: "html" },
];

const Exports = () => {
  const { user } = useAuth();
  const { isPaid, loading: planLoading } = usePlanTier();
  const navigate = useNavigate();

  const handleExport = async (format: string) => {
    if (!isPaid) {
      toast.error("Upgrade to export your ideas", {
        action: { label: "Upgrade", onClick: () => navigate("/pricing") },
      });
      return;
    }

    if (!user) return;

    if (format === "csv") {
      try {
        const ideas = await fetchSavedIdeas(user.id);
        if (!ideas || ideas.length === 0) {
          toast.error("No saved ideas to export");
          return;
        }
        exportToCSV(ideas);
        toast.success(`Exported ${ideas.length} ideas to CSV`);
      } catch {
        toast.error("Failed to export ideas");
      }
    } else {
      toast.info("Coming soon!");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Download className="h-6 w-6 text-primary" /> Export Tools
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Export your saved ideas in multiple formats</p>
      </div>

      {!planLoading && !isPaid && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Exports require a paid plan</p>
              <p className="text-xs text-muted-foreground">Upgrade to unlock CSV, summary, and HTML exports</p>
            </div>
          </div>
          <Button size="sm" onClick={() => navigate("/pricing")} className="gap-1.5">
            <Crown className="h-3.5 w-3.5" />
            Upgrade
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {exportOptions.map((opt) => (
          <div key={opt.format} className="bg-card rounded-xl border border-border/50 p-5 flex items-center justify-between shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <opt.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-card-foreground">{opt.title}</h3>
                <p className="text-sm text-muted-foreground">{opt.desc}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-border/50"
              onClick={() => handleExport(opt.format)}
            >
              {isPaid ? "Export" : <><Lock className="h-3 w-3 mr-1" /> Export</>}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Exports;
