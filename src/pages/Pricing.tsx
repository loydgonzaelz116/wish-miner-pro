import { Check, Crown, Zap, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const tiers = [
  {
    id: "founder",
    name: "Founder's Pass",
    price: "$9",
    period: "one-time",
    description: "30 days of unlimited access",
    icon: Zap,
    features: [
      "Unlimited searches for 30 days",
      "CSV export",
      "Priority support",
    ],
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "Everything you need to build",
    icon: Crown,
    features: [
      "Unlimited searches",
      "Saved ideas folder",
      "Weekly Goldmine Report email",
      "CSV & PDF exports",
      "Priority support",
    ],
    popular: true,
  },
  {
    id: "lifetime",
    name: "Lifetime",
    price: "$200",
    period: "one-time",
    description: "Everything, forever",
    icon: Star,
    features: [
      "Everything in Pro",
      "Lifetime access — never pay again",
      "\"Founding Member\" badge",
      "Early access to new features",
      "Direct founder support",
    ],
    popular: false,
  },
];

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleCheckout = async (tier: string) => {
    if (!user) {
      navigate("/login");
      return;
    }

    setLoadingTier(tier);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { tier },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Choose Your Plan
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Stop guessing what to build. Start mining validated product ideas from real demand.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <Card
              key={tier.id}
              className={`relative flex flex-col ${
                tier.popular
                  ? "border-primary shadow-lg shadow-primary/10 scale-105"
                  : "border-border/50"
              }`}
            >
              {tier.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <tier.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                  <span className="text-muted-foreground ml-1">{tier.period}</span>
                </div>
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={tier.popular ? "default" : "outline"}
                  onClick={() => handleCheckout(tier.id)}
                  disabled={loadingTier !== null}
                >
                  {loadingTier === tier.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    `Get ${tier.name}`
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Payments powered by Stripe. Cancel anytime.
        </p>
      </div>
    </div>
  );
};

export default Pricing;
