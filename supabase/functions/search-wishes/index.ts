import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check cache
    const cacheThreshold = new Date(Date.now() - CACHE_HOURS * 60 * 60 * 1000).toISOString();
    const { data: cached } = await supabase
      .from("x_posts")
      .select("*")
      .eq("query_hash", queryHash)
      .gte("fetched_at", cacheThreshold)
      .order("like_count", { ascending: false });

    if (cached && cached.length > 0) {
      return json({ posts: cached.map(formatPost), fromCache: true });
    }

    // Call Apify
    const apifyToken = Deno.env.get("APIFY_API_TOKEN");
    if (!apifyToken) {
      return json({ error: "APIFY_API_TOKEN not configured" }, 500);
    }

    const runUrl = `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/run-sync-get-dataset-items?token=${apifyToken}`;

    const apifyResponse = await fetch(runUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        searchTerms: [query],
        sort: "Top",
        tweetLanguage: "en",
        maxItems,
      }),
    });

    if (!apifyResponse.ok) {
      const errText = await apifyResponse.text();
      console.error("Apify error:", errText);
      return await fallbackToStale(supabase, queryHash, maxItems, errText);
    }

    const tweets = await apifyResponse.json();

    // Filter out noResults entries and map fields
    const validTweets = (tweets as any[]).filter((t: any) => !t.noResults && (t.full_text || t.text));

    if (validTweets.length === 0) {
      // No real results — try stale cache
      return await fallbackToStale(supabase, queryHash, maxItems, "No results from Apify");
    }

    // Clear old cache
    await supabase.from("x_posts").delete().eq("query_hash", queryHash);

    // Map Apify tweet fields to our schema
    const rows = validTweets.map((t: any) => ({
      query_hash: queryHash,
      post_text: t.full_text || t.text || "",
      author: t.user?.screen_name || t.author?.userName || t.author?.name || "",
      like_count: t.favorite_count ?? t.likeCount ?? t.favoriteCount ?? 0,
      reply_count: t.reply_count ?? t.replyCount ?? 0,
      quote_count: t.quote_count ?? t.quoteCount ?? 0,
      post_timestamp: t.created_at || t.createdAt || t.timestamp || null,
      raw_data: t,
    }));

    if (rows.length > 0) {
      await supabase.from("x_posts").insert(rows);
    }

    return json({ posts: rows.map(formatPost), fromCache: false });
  } catch (err) {
    console.error("search-wishes error:", err);
    return json({ error: "Internal server error" }, 500);
  }
});

async function fallbackToStale(supabase: any, queryHash: string, maxItems: number, reason: string) {
  const { data: stale } = await supabase
    .from("x_posts")
    .select("*")
    .eq("query_hash", queryHash)
    .order("like_count", { ascending: false })
    .limit(maxItems);

  if (stale && stale.length > 0) {
    return json({ posts: stale.map(formatPost), fromCache: true, stale: true });
  }
  return json({ error: "No results found", details: reason, posts: [] }, 200);
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

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
