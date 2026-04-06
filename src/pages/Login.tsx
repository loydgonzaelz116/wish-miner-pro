import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pickaxe, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/dashboard",
      });
      if (result.error) {
        toast.error("Google sign-in failed");
      }
    } catch {
      toast.error("Google sign-in failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 dark">
      <div className="w-full max-w-sm">
        <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="flex items-center gap-2 mb-8">
          <Pickaxe className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-foreground">WishMiner</span>
        </div>

        <h1 className="text-2xl font-bold mb-2 text-foreground">{isSignUp ? "Create your account" : "Welcome back"}</h1>
        <p className="text-sm text-muted-foreground mb-8">{isSignUp ? "Start mining validated product ideas" : "Continue mining product ideas"}</p>

        <Button variant="outline" className="w-full mb-6 h-11 border-border/50 text-foreground hover:bg-secondary/50" onClick={handleGoogleLogin}>
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </Button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/50" /></div>
          <div className="relative flex justify-center text-xs"><span className="px-2 bg-background text-muted-foreground">or</span></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-sm text-foreground">Email</Label>
            <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-1 bg-secondary/30 border-border/50 text-foreground" placeholder="you@example.com" />
          </div>
          <div>
            <Label htmlFor="password" className="text-sm text-foreground">Password</Label>
            <Input id="password" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="mt-1 bg-secondary/30 border-border/50 text-foreground" placeholder="••••••••" />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
            {loading ? "Please wait..." : isSignUp ? "Create account" : "Sign in"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary hover:underline font-medium">
            {isSignUp ? "Sign in" : "Sign up free"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
