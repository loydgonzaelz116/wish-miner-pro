import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.49.1/cors";

const APIFY_ACTOR_ID = "61RPP7dywgiy0JPD0";
const CACHE_HOURS = 24;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { query, maxItems = 50 } = await req.json();
    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "query is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const queryHash = await hashQuery(query);

    // Create service-role client for cache operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check cache (posts fetched within last 24 hours)
    const cacheThreshold = new Date(Date.now() - CACHE_HOURS * 60 * 60 * 1000).toISOString();
    const { data: cached } = await supabase
      .from("x_posts")
      .select("*")
      .eq("query_hash", queryHash)
      .gte("fetched_at", cacheThreshold)
      .order("like_count", { ascending: false });

    if (cached && cached.length > 0) {
      return new Response(
        JSON.stringify({ posts: cached.map(formatPost), fromCache: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Apify API
    const apifyToken = Deno.env.get("APIFY_API_TOKEN");
    if (!apifyToken) {
      return new Response(JSON.stringify({ error: "APIFY_API_TOKEN not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const runUrl = `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/run-sync-get-dataset-items?token=${apifyToken}`;

    const apifyResponse = await fetch(runUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        searchTerms: [query],
        searchMode: "live",
        maxItems,
        lang: "en",
        sort: "Top",
        tweetLanguage: "en",
      }),
    });

    if (!apifyResponse.ok) {
      const errText = await apifyResponse.text();
      console.error("Apify error:", errText);

      // Fallback to any cached data (even stale)
      const { data: stale } = await supabase
        .from("x_posts")
        .select("*")
        .eq("query_hash", queryHash)
        .order("like_count", { ascending: false })
        .limit(maxItems);

      if (stale && stale.length > 0) {
        return new Response(
          JSON.stringify({ posts: stale.map(formatPost), fromCache: true, stale: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(JSON.stringify({ error: "Failed to fetch from Apify", details: errText }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tweets = await apifyResponse.json();

    // Clear old cache for this query
    await supabase.from("x_posts").delete().eq("query_hash", queryHash);

    // Insert new results
    const rows = (tweets as any[]).map((t: any) => ({
      query_hash: queryHash,
      post_text: t.full_text || t.text || "",
      author: t.user?.screen_name || t.author?.userName || "",
      like_count: t.favorite_count ?? t.likeCount ?? 0,
      reply_count: t.reply_count ?? t.replyCount ?? 0,
      quote_count: t.quote_count ?? t.quoteCount ?? 0,
      post_timestamp: t.created_at || t.createdAt || null,
      raw_data: t,
    }));

    if (rows.length > 0) {
      await supabase.from("x_posts").insert(rows);
    }

    return new Response(
      JSON.stringify({ posts: rows.map(formatPost), fromCache: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("search-wishes error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function formatPost(row: any) {
  return {
    text: row.post_text,
    author: row.author,
    likeCount: row.like_count,
    replyCount: row.reply_count,
    quoteCount: row.quote_count,
    timestamp: row.post_timestamp,
  };
}

async function hashQuery(query: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(query.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
