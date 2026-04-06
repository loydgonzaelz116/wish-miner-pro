import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const APIFY_ACTOR_ID = "61RPP7dywgiy0JPD0";
const CACHE_HOURS = 24;
const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 60; // 3 minutes max

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { query, maxItems = 50 } = await req.json();
    if (!query || typeof query !== "string") {
      return json({ error: "query is required" }, 400);
    }

    const queryHash = await hashQuery(query);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check cache (24h)
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

    const apifyToken = Deno.env.get("APIFY_API_TOKEN");
    if (!apifyToken) {
      return json({ error: "APIFY_API_TOKEN not configured" }, 500);
    }

    // Step 1: Start actor run — use startUrls with X search URL for better results
    const searchUrl = `https://x.com/search?q=${encodeURIComponent(query)}&src=typed_query&f=top`;
    const startUrl = `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/runs?token=${apifyToken}`;
    const inputBody = {
      startUrls: [searchUrl],
      maxItems,
      sort: "Top",
      tweetLanguage: "en",
    };
    console.log("Starting Apify run with input:", JSON.stringify(inputBody));
    const startRes = await fetch(startUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inputBody),
    });

    if (!startRes.ok) {
      const errText = await startRes.text();
      console.error("Apify start error:", startRes.status, errText);
      return await fallbackToStale(supabase, queryHash, maxItems, errText);
    }

    const runData = await startRes.json();
    console.log("Run response:", JSON.stringify(runData).substring(0, 500));
    const runId = runData?.data?.id;
    const datasetId = runData?.data?.defaultDatasetId;

    if (!runId) {
      console.error("No run ID returned:", JSON.stringify(runData));
      return await fallbackToStale(supabase, queryHash, maxItems, "No run ID");
    }

    // Step 2: Poll until finished
    let status = runData?.data?.status;
    let attempts = 0;

    while (status !== "SUCCEEDED" && status !== "FAILED" && status !== "ABORTED" && status !== "TIMED-OUT" && attempts < MAX_POLL_ATTEMPTS) {
      await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
      attempts++;

      const pollRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${apifyToken}`);
      if (!pollRes.ok) {
        const t = await pollRes.text();
        console.error("Poll error:", t);
        continue;
      }
      const pollData = await pollRes.json();
      status = pollData?.data?.status;
      console.log(`Poll attempt ${attempts}: status=${status}`);
    }

    if (status !== "SUCCEEDED") {
      console.error(`Actor run ended with status: ${status}`);
      return await fallbackToStale(supabase, queryHash, maxItems, `Run status: ${status}`);
    }

    // Step 3: Fetch dataset items
    const datasetUrl = `https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyToken}&format=json`;
    const datasetRes = await fetch(datasetUrl);
    if (!datasetRes.ok) {
      const errText = await datasetRes.text();
      console.error("Dataset fetch error:", errText);
      return await fallbackToStale(supabase, queryHash, maxItems, errText);
    }

    const tweets = await datasetRes.json();
    const validTweets = (tweets as any[]).filter((t: any) => !t.noResults && (t.full_text || t.text || t.tweetText));

    if (validTweets.length === 0) {
      console.log("No valid tweets found, raw count:", tweets.length);
      if (tweets.length > 0) {
        console.log("Sample raw item keys:", Object.keys(tweets[0]).join(", "));
        console.log("Sample raw item:", JSON.stringify(tweets[0]).substring(0, 500));
      }
      return await fallbackToStale(supabase, queryHash, maxItems, "No valid tweets in results");
    }

    // Clear old cache for this query
    await supabase.from("x_posts").delete().eq("query_hash", queryHash);

    // Map fields — handle various Apify actor output schemas
    const rows = validTweets.map((t: any) => ({
      query_hash: queryHash,
      post_text: t.full_text || t.text || t.tweetText || "",
      author: t.user?.screen_name || t.author?.userName || t.screen_name || t.userName || "",
      like_count: t.favorite_count ?? t.likeCount ?? t.favoriteCount ?? t.likes ?? 0,
      reply_count: t.reply_count ?? t.replyCount ?? t.replies ?? 0,
      quote_count: t.quote_count ?? t.quoteCount ?? t.quotes ?? 0,
      post_timestamp: t.created_at || t.createdAt || t.timestamp || t.date || null,
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
  return json({ error: "No results found", details: reason, posts: [] });
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
