import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Wish } from "@/data/mockWishes";

interface RawPost {
  text: string;
  author: string;
  likeCount: number;
  replyCount: number;
  quoteCount: number;
  timestamp: string | null;
}

const POLL_INTERVAL = 5000;
const MAX_POLLS = 36;

const clusters = ["AI Tools", "Freelance Finance", "Parenting Tech", "Meal Prep", "No-Code Tools", "Fitness Tech", "Fashion Tech", "Productivity"];

function classifyCluster(text: string): string {
  const lower = text.toLowerCase();
  if (lower.match(/ai|gpt|llm|automat|agent/)) return "AI Tools";
  if (lower.match(/freelanc|invoic|tax|expens|financ/)) return "Freelance Finance";
  if (lower.match(/parent|kid|child|baby|toddler/)) return "Parenting Tech";
  if (lower.match(/meal|cook|recipe|food|grocer/)) return "Meal Prep";
  if (lower.match(/no.?code|low.?code|template|build.*without/)) return "No-Code Tools";
  if (lower.match(/fit|gym|workout|exercise|health/)) return "Fitness Tech";
  if (lower.match(/fashion|cloth|wear|style|sizing/)) return "Fashion Tech";
  if (lower.match(/habit|product|calendar|task|focus/)) return "Productivity";
  return clusters[Math.floor(Math.random() * clusters.length)];
}

function classifyDemand(likes: number): "high" | "medium" | "low" {
  if (likes >= 500) return "high";
  if (likes >= 100) return "medium";
  return "low";
}

function toWish(post: RawPost, index: number): Wish {
  return {
    id: `live-${index}-${Date.now()}`,
    text: post.text,
    author: post.author || "Unknown",
    handle: `@${post.author || "user"}`,
    likes: post.likeCount,
    replies: post.replyCount,
    retweets: post.quoteCount,
    date: post.timestamp ? new Date(post.timestamp).toLocaleDateString() : "Recent",
    cluster: classifyCluster(post.text),
    demandLevel: classifyDemand(post.likeCount),
    quoteSuggestions: [],
    saved: false,
  };
}

export function useSearchWishes() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchesRemaining, setSearchesRemaining] = useState<number>(5);
  const [limitReached, setLimitReached] = useState(false);

  // Fetch usage on mount
  useEffect(() => {
    checkUsage();
  }, []);

  const checkUsage = async () => {
    try {
      const { data } = await supabase.functions.invoke("search-wishes", {
        body: { action: "check-usage", query: "_" },
      });
      if (data?.searchesRemaining !== undefined) {
        setSearchesRemaining(data.searchesRemaining);
        setLimitReached(data.searchesRemaining <= 0);
      }
    } catch {
      // Ignore — default to 5
    }
  };

  const search = useCallback(async (query: string) => {
    if (!query.trim()) return;
    if (limitReached) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);
    setStatusMessage("Starting search…");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("search-wishes", {
        body: { query, maxItems: 50 },
      });

      if (fnError) throw new Error(fnError.message);

      // Handle rate limit
      if (data.limitReached) {
        setLimitReached(true);
        setSearchesRemaining(0);
        setError("You've reached your daily limit of 5 free searches. Upgrade for unlimited mining!");
        setWishes([]);
        setLoading(false);
        return;
      }

      if (data.searchesRemaining !== undefined) {
        setSearchesRemaining(data.searchesRemaining);
      }

      if (data.posts && data.posts.length > 0) {
        finishWithPosts(data.posts, data.fromCache);
        setLoading(false);
        return;
      }

      if (data.status === "running" && data.runId && data.datasetId) {
        setStatusMessage("Mining X posts… this takes 1-2 minutes");
        await pollForResults(query, data.runId, data.datasetId);
        return;
      }

      if (data.error) {
        setError(data.error);
      }
      setWishes([]);
    } catch (err: any) {
      console.error("Search error:", err);
      setError(err.message || "Search failed");
    } finally {
      setLoading(false);
      setStatusMessage("");
    }
  }, [limitReached]);

  const pollForResults = async (query: string, runId: string, datasetId: string) => {
    for (let i = 0; i < MAX_POLLS; i++) {
      await new Promise(r => setTimeout(r, POLL_INTERVAL));
      setStatusMessage(`Mining X posts… (${Math.round((i + 1) * POLL_INTERVAL / 1000)}s)`);

      try {
        const { data, error: fnError } = await supabase.functions.invoke("search-wishes", {
          body: { query, action: "poll", runId, datasetId },
        });

        if (fnError) throw new Error(fnError.message);
        if (data.status === "running") continue;

        if (data.posts && data.posts.length > 0) {
          finishWithPosts(data.posts, data.fromCache);
          return;
        }

        if (data.error) {
          setError(data.error);
          setWishes([]);
          return;
        }
      } catch (err: any) {
        console.error("Poll error:", err);
      }
    }

    setError("Search timed out. Try again later.");
    setWishes([]);
  };

  const finishWithPosts = (posts: RawPost[], cached: boolean) => {
    const mapped = posts
      .filter((p: RawPost) => p.text && p.text.length > 10)
      .map((p: RawPost, i: number) => toWish(p, i));
    setWishes(mapped);
    setFromCache(cached);
  };

  return { wishes, setWishes, loading, statusMessage, error, fromCache, hasSearched, search, searchesRemaining, limitReached };
}
