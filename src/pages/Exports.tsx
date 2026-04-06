import { Download, FileText, Code, Table } from "lucide-react";
import { Button } from "@/components/ui/button";

const exportOptions = [
  { icon: Table, title: "CSV Export", desc: "Download ideas as CSV for Notion or Airtable", format: "csv" },
  { icon: FileText, title: "Formatted Summary", desc: "Google Docs-style document with feature lists", format: "doc" },
  { icon: Code, title: "Landing Page HTML", desc: "Basic landing page preview with buy button", format: "html" },
];

const Exports = () => (
  <div className="max-w-3xl mx-auto space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <Download className="h-6 w-6 text-primary" /> Export Tools
      </h1>
      <p className="text-sm text-muted-foreground mt-1">Export your saved ideas in multiple formats</p>
    </div>

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
          <Button variant="outline" size="sm" className="border-border/50">
            Export
          </Button>
        </div>
      ))}
    </div>
  </div>
);

export default Exports;
