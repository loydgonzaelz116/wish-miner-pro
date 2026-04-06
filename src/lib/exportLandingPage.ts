interface IdeaData {
  ai_product_name?: string | null;
  ai_description?: string | null;
  wish_text: string;
  cluster?: string | null;
  demand_level?: string | null;
  likes?: number | null;
  replies?: number | null;
}

export function exportLandingPageHTML(idea: IdeaData) {
  const name = idea.ai_product_name || "My Product";
  const desc = idea.ai_description || idea.wish_text;
  const cluster = idea.cluster || "";
  const demand = idea.demand_level
    ? idea.demand_level.charAt(0).toUpperCase() + idea.demand_level.slice(1)
    : "";
  const likes = idea.likes ?? 0;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(name)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0a; color: #fafafa; min-height: 100vh;
    }
    .hero {
      max-width: 720px; margin: 0 auto; padding: 80px 24px; text-align: center;
    }
    .badge {
      display: inline-block; background: rgba(52,211,153,0.1); color: #34d399;
      font-size: 13px; font-weight: 600; padding: 6px 16px; border-radius: 999px;
      border: 1px solid rgba(52,211,153,0.2); margin-bottom: 32px;
    }
    h1 {
      font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800;
      line-height: 1.1; margin-bottom: 20px;
    }
    .highlight { color: #34d399; }
    .subtitle {
      font-size: 1.125rem; color: #a1a1aa; line-height: 1.6; margin-bottom: 40px;
      max-width: 560px; margin-left: auto; margin-right: auto;
    }
    .cta-btn {
      display: inline-block; background: #34d399; color: #0a0a0a;
      font-size: 1rem; font-weight: 700; padding: 14px 36px;
      border-radius: 12px; text-decoration: none; transition: opacity .2s;
    }
    .cta-btn:hover { opacity: 0.85; }
    .quote-section {
      max-width: 640px; margin: 60px auto 0; padding: 0 24px;
    }
    .quote-card {
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px; padding: 28px 32px; text-align: left;
    }
    .quote-text {
      font-size: 1rem; color: #d4d4d8; line-height: 1.6;
      font-style: italic; margin-bottom: 16px;
    }
    .quote-meta { display: flex; gap: 16px; font-size: 13px; color: #71717a; }
    .stats {
      display: flex; justify-content: center; gap: 40px;
      max-width: 480px; margin: 48px auto 0; padding: 0 24px;
    }
    .stat { text-align: center; }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: #34d399; }
    .stat-label { font-size: 13px; color: #71717a; margin-top: 4px; }
    .footer {
      text-align: center; padding: 60px 24px 32px;
      font-size: 13px; color: #52525b;
    }
  </style>
</head>
<body>
  <section class="hero">
    ${cluster ? `<span class="badge">${escapeHtml(cluster)}</span>` : ""}
    <h1>${escapeHtml(name)}</h1>
    <p class="subtitle">${escapeHtml(desc)}</p>
    <a href="#buy" class="cta-btn">Get Early Access →</a>
  </section>

  <section class="quote-section">
    <div class="quote-card">
      <p class="quote-text">"${escapeHtml(idea.wish_text)}"</p>
      <div class="quote-meta">
        ${demand ? `<span>🔥 ${escapeHtml(demand)} demand</span>` : ""}
        ${likes ? `<span>❤️ ${likes.toLocaleString()} likes</span>` : ""}
      </div>
    </div>
  </section>

  <div class="stats">
    ${demand ? `<div class="stat"><div class="stat-value">${escapeHtml(demand)}</div><div class="stat-label">Demand</div></div>` : ""}
    ${likes ? `<div class="stat"><div class="stat-value">${likes.toLocaleString()}</div><div class="stat-label">Likes</div></div>` : ""}
    ${idea.replies ? `<div class="stat"><div class="stat-value">${idea.replies.toLocaleString()}</div><div class="stat-label">Replies</div></div>` : ""}
  </div>

  <footer class="footer">
    Built with <a href="https://wishminer.com" style="color:#34d399;text-decoration:none;">WishMiner</a>
  </footer>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slugify(name)}-landing.html`;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
