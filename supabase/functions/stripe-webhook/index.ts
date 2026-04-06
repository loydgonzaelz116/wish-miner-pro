import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200 });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
    const body = await req.text();
    
    // Parse event directly (webhook signature verification can be added with STRIPE_WEBHOOK_SECRET)
    const event = JSON.parse(body);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.supabase_user_id;
      const tier = session.metadata?.tier;

      if (!userId || !tier) {
        console.error("Missing metadata", session.metadata);
        return new Response("Missing metadata", { status: 400 });
      }

      const updateData: Record<string, any> = { plan_tier: tier };

      if (tier === "founder") {
        // 30 days from now
        const expires = new Date();
        expires.setDate(expires.getDate() + 30);
        updateData.plan_expires_at = expires.toISOString();
      } else if (tier === "lifetime") {
        updateData.plan_expires_at = null; // never expires
      }
      // pro is managed by subscription status

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", userId);

      if (error) {
        console.error("Profile update error:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
      }

      console.log(`Updated user ${userId} to ${tier}`);
    }

    if (event.type === "customer.subscription.deleted") {
      // Pro subscription cancelled
      const subscription = event.data.object;
      const customerId = subscription.customer;

      // Find user by customer ID
      const customer = await stripe.customers.retrieve(customerId as string);
      const userId = (customer as any).metadata?.supabase_user_id;

      if (userId) {
        await supabase
          .from("profiles")
          .update({ plan_tier: "free", plan_expires_at: null })
          .eq("user_id", userId);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
