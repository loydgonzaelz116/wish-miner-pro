import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  Header, Footer, PageNumber, LevelFormat,
} from "docx";
import { saveAs } from "file-saver";

interface IdeaRow {
  wish_text: string;
  author?: string | null;
  handle?: string | null;
  likes?: number | null;
  replies?: number | null;
  retweets?: number | null;
  demand_level?: string | null;
  cluster?: string | null;
  ai_product_name?: string | null;
  ai_description?: string | null;
  priority_score?: number | null;
  built_status?: boolean | null;
  notes?: string | null;
  created_at: string;
}

const BRAND_COLOR = "6D28D9"; // purple-700
const LIGHT_BG = "F3F0FF";
const BORDER = { style: BorderStyle.SINGLE, size: 1, color: "D4D4D8" };
const CELL_BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };
const CELL_MARGINS = { top: 60, bottom: 60, left: 100, right: 100 };

function demandBadge(level?: string | null) {
  if (!level) return "—";
  return level.charAt(0).toUpperCase() + level.slice(1);
}

function buildIdeaSection(idea: IdeaRow, idx: number): Paragraph[] {
  const items: Paragraph[] = [];

  // Idea heading
  items.push(
    new Paragraph({
      spacing: { before: 300, after: 100 },
      children: [
        new TextRun({ text: `${idx + 1}. `, bold: true, size: 26, font: "Arial", color: BRAND_COLOR }),
        new TextRun({ text: idea.ai_product_name || "Untitled Idea", bold: true, size: 26, font: "Arial" }),
      ],
    })
  );

  // Wish text (quote style)
  items.push(
    new Paragraph({
      spacing: { after: 100 },
      indent: { left: 360 },
      border: { left: { style: BorderStyle.SINGLE, size: 6, color: BRAND_COLOR, space: 8 } },
      children: [
        new TextRun({ text: `"${idea.wish_text}"`, italics: true, size: 22, font: "Arial", color: "52525B" }),
      ],
    })
  );

  // Author line
  if (idea.author || idea.handle) {
    items.push(
      new Paragraph({
        spacing: { after: 80 },
        indent: { left: 360 },
        children: [
          new TextRun({ text: `— ${idea.author || ""} ${idea.handle ? `(${idea.handle})` : ""}`, size: 20, font: "Arial", color: "71717A" }),
        ],
      })
    );
  }

  // Stats table
  const statsData = [
    ["Demand", demandBadge(idea.demand_level)],
    ["Cluster", idea.cluster || "—"],
    ["Priority", idea.priority_score != null ? String(idea.priority_score) : "—"],
    ["Likes", String(idea.likes ?? 0)],
    ["Replies", String(idea.replies ?? 0)],
    ["Status", idea.built_status ? "✅ Built" : "Not built"],
  ];

  items.push(
    new Table({
      width: { size: 8000, type: WidthType.DXA },
      columnWidths: [2400, 1400, 1400, 1400, 1400],
      rows: [
        new TableRow({
          children: statsData.slice(0, 5).map(
            ([label]) =>
              new TableCell({
                borders: CELL_BORDERS,
                margins: CELL_MARGINS,
                width: { size: 1600, type: WidthType.DXA },
                shading: { fill: LIGHT_BG, type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 18, font: "Arial", color: BRAND_COLOR })] })],
              })
          ),
        }),
        new TableRow({
          children: statsData.slice(0, 5).map(
            ([, val]) =>
              new TableCell({
                borders: CELL_BORDERS,
                margins: CELL_MARGINS,
                width: { size: 1600, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: val, size: 20, font: "Arial" })] })],
              })
          ),
        }),
      ],
    }) as unknown as Paragraph
  );

  // AI Description
  if (idea.ai_description) {
    items.push(
      new Paragraph({
        spacing: { before: 120, after: 60 },
        children: [new TextRun({ text: "AI Summary: ", bold: true, size: 20, font: "Arial" }), new TextRun({ text: idea.ai_description, size: 20, font: "Arial", color: "3F3F46" })],
      })
    );
  }

  // Notes
  if (idea.notes) {
    items.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: "Notes: ", bold: true, size: 20, font: "Arial" }), new TextRun({ text: idea.notes, size: 20, font: "Arial", color: "3F3F46" })],
      })
    );
  }

  // Separator
  items.push(
    new Paragraph({
      spacing: { before: 200, after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "E4E4E7", space: 1 } },
      children: [],
    })
  );

  return items;
}

export async function exportFormattedSummary(ideas: IdeaRow[]) {
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const children: (Paragraph | Table)[] = [];

  // Title
  children.push(
    new Paragraph({
      spacing: { after: 60 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "WishMiner", size: 40, bold: true, font: "Arial", color: BRAND_COLOR })],
    }),
    new Paragraph({
      spacing: { after: 40 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Saved Ideas Summary", size: 32, font: "Arial" })],
    }),
    new Paragraph({
      spacing: { after: 200 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `Generated ${date}  •  ${ideas.length} ideas`, size: 20, font: "Arial", color: "71717A" })],
    }),
    new Paragraph({
      spacing: { after: 300 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BRAND_COLOR, space: 1 } },
      children: [],
    })
  );

  // Quick stats overview
  const builtCount = ideas.filter((i) => i.built_status).length;
  const highDemand = ideas.filter((i) => i.demand_level === "high" || i.demand_level === "very high").length;

  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 120 },
      children: [new TextRun({ text: "Overview", size: 28, bold: true, font: "Arial" })],
    }),
    new Paragraph({
      spacing: { after: 60 },
      numbering: { reference: "bullets", level: 0 },
      children: [new TextRun({ text: `Total saved ideas: ${ideas.length}`, size: 22, font: "Arial" })],
    }),
    new Paragraph({
      spacing: { after: 60 },
      numbering: { reference: "bullets", level: 0 },
      children: [new TextRun({ text: `High demand ideas: ${highDemand}`, size: 22, font: "Arial" })],
    }),
    new Paragraph({
      spacing: { after: 200 },
      numbering: { reference: "bullets", level: 0 },
      children: [new TextRun({ text: `Marked as built: ${builtCount}`, size: 22, font: "Arial" })],
    })
  );

  // Each idea
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 160 },
      children: [new TextRun({ text: "Idea Details", size: 28, bold: true, font: "Arial" })],
    })
  );

  ideas.forEach((idea, idx) => {
    children.push(...buildIdeaSection(idea, idx));
  });

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "\u2022",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: "WishMiner Summary", size: 16, font: "Arial", color: "A1A1AA" })],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "Page ", size: 16, font: "Arial", color: "A1A1AA" }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 16, font: "Arial", color: "A1A1AA" }),
                ],
              }),
            ],
          }),
        },
        children: children as Paragraph[],
      },
    ],
  });

  const buffer = await Packer.toBlob(doc);
  saveAs(buffer, `wishminer-summary-${new Date().toISOString().split("T")[0]}.docx`);
}
