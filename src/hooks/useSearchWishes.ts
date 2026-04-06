import { useState, useCallback } from "react";
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
const MAX_POLLS = 36; // 3 minutes

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

  const search = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setHasSearched(true);
    setStatusMessage("Starting search…");

    try {
      // Initial call — starts the run or returns cached data
      const { data, error: fnError } = await supabase.functions.invoke("search-wishes", {
        body: { query, maxItems: 50 },
      });

      if (fnError) throw new Error(fnError.message);

      // If we got posts directly (cached), we're done
      if (data.posts && data.posts.length > 0) {
        finishWithPosts(data.posts, data.fromCache);
        return;
      }

      // If run started, poll for results
      if (data.status === "running" && data.runId && data.datasetId) {
        setStatusMessage("Mining X posts… this takes 1-2 minutes");
        await pollForResults(query, data.runId, data.datasetId);
        return;
      }

      // Error or no results
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
  }, []);

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

  return { wishes, setWishes, loading, statusMessage, error, fromCache, hasSearched, search };
}
