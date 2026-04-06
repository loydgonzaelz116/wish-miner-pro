import { supabase } from "@/integrations/supabase/client";
import type { Wish } from "@/data/mockWishes";

export async function saveIdea(userId: string, wish: Wish) {
  const { error } = await supabase.from("saved_ideas").insert({
    user_id: userId,
    wish_text: wish.text,
    author: wish.author,
    handle: wish.handle,
    likes: wish.likes,
    replies: wish.replies,
    retweets: wish.retweets,
    date: wish.date,
    cluster: wish.cluster,
    demand_level: wish.demandLevel,
    quote_suggestions: wish.quoteSuggestions,
    ai_product_name: wish.aiProductName,
    ai_description: wish.aiDescription,
    competitor_gaps: wish.competitorGaps,
  });
  if (error) throw error;
}

export async function deleteIdea(ideaId: string) {
  const { error } = await supabase.from("saved_ideas").delete().eq("id", ideaId);
  if (error) throw error;
}

export async function fetchSavedIdeas(userId: string) {
  const { data, error } = await supabase
    .from("saved_ideas")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateIdeaNotes(ideaId: string, notes: string) {
  const { error } = await supabase.from("saved_ideas").update({ notes }).eq("id", ideaId);
  if (error) throw error;
}

export async function updateIdeaBuiltStatus(ideaId: string, built_status: boolean) {
  const { error } = await supabase.from("saved_ideas").update({ built_status }).eq("id", ideaId);
  if (error) throw error;
}
