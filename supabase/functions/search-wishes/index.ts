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
    const body = await req.json();
    const { query, maxItems = 50, action } = body;

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

    // action=poll means check an existing run
    if (action === "poll" && body.runId && body.datasetId) {
      return await pollAndFetch(apifyToken, body.runId, body.datasetId, supabase, queryHash, maxItems);
    }

    // Step 1: Start actor run
    const startUrl = `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/runs?token=${apifyToken}`;
    const inputBody = {
      searchTerms: [query],
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
    const runId = runData?.data?.id;
    const datasetId = runData?.data?.defaultDatasetId;
    console.log("Run started:", runId, "dataset:", datasetId, "status:", runData?.data?.status);

    if (!runId) {
      return await fallbackToStale(supabase, queryHash, maxItems, "No run ID");
    }

    // Return runId so client can poll
    return json({ 
      status: "running",
      runId,
      datasetId,
      message: "Actor run started. Poll with action='poll' to check results."
    });

  } catch (err) {
    console.error("search-wishes error:", err);
    return json({ error: "Internal server error" }, 500);
  }
});

async function pollAndFetch(
  apifyToken: string,
  runId: string,
  datasetId: string,
  supabase: any,
  queryHash: string,
  maxItems: number
) {
  // Check run status
  const pollRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${apifyToken}`);
  if (!pollRes.ok) {
    const t = await pollRes.text();
    console.error("Poll error:", t);
    return json({ status: "error", error: t }, 502);
  }
  const pollData = await pollRes.json();
  const status = pollData?.data?.status;
  console.log("Poll status:", status);

  if (status === "RUNNING" || status === "READY") {
    return json({ status: "running", runId, datasetId });
  }

  if (status !== "SUCCEEDED") {
    console.error("Run failed:", status);
    return await fallbackToStale(supabase, queryHash, maxItems, `Run status: ${status}`);
  }

  // Fetch dataset items
  const datasetUrl = `https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyToken}&format=json`;
  const datasetRes = await fetch(datasetUrl);
  if (!datasetRes.ok) {
    const errText = await datasetRes.text();
    console.error("Dataset fetch error:", errText);
    return await fallbackToStale(supabase, queryHash, maxItems, errText);
  }

  const tweets = await datasetRes.json();
  console.log("Dataset items count:", tweets.length);
  if (tweets.length > 0) {
    console.log("Sample keys:", Object.keys(tweets[0]).join(", "));
    console.log("Sample item:", JSON.stringify(tweets[0]).substring(0, 1000));
  }

  const validTweets = (tweets as any[]).filter((t: any) => !t.noResults && (t.full_text || t.text || t.tweetText));

  if (validTweets.length === 0) {
    return await fallbackToStale(supabase, queryHash, maxItems, "No valid tweets in dataset");
  }

  // Clear old cache
  await supabase.from("x_posts").delete().eq("query_hash", queryHash);

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
}

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
