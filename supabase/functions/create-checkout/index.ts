import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid user" }), { status: 401, headers: corsHeaders });
    }

    const { tier } = await req.json();
    if (!["founder", "pro", "lifetime"].includes(tier)) {
      return new Response(JSON.stringify({ error: "Invalid tier" }), { status: 400, headers: corsHeaders });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });

    // Find or create Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
    }

    // Define products
    const products: Record<string, { name: string; amount: number; mode: "payment" | "subscription"; interval?: "month" }> = {
      founder: { name: "Founder's Pass", amount: 900, mode: "payment" },
      pro: { name: "Pro Plan", amount: 1900, mode: "subscription", interval: "month" },
      lifetime: { name: "Lifetime Access", amount: 20000, mode: "payment" },
    };

    const product = products[tier];
    const origin = req.headers.get("origin") || "https://lovable.dev";

    const lineItem: any = {
      price_data: {
        currency: "usd",
        product_data: { name: product.name },
        unit_amount: product.amount,
      },
      quantity: 1,
    };

    if (product.mode === "subscription" && product.interval) {
      lineItem.price_data.recurring = { interval: product.interval };
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [lineItem],
      mode: product.mode,
      success_url: `${origin}/dashboard?payment=success&tier=${tier}`,
      cancel_url: `${origin}/pricing?payment=cancelled`,
      metadata: { supabase_user_id: user.id, tier },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
