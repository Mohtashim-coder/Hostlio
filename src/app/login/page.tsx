
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, loading: authLoading, refetch } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  // suppress setError unused lint warning
  void setError;

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/profile");
    }
  }, [isAuthenticated, authLoading, router]);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (!email) {
        toast({
          variant: "destructive",
          title: "Email Required",
          description: "Please enter your email address.",
        });
        setLoading(false);
        return;
      }

      if (!password) {
        toast({
          variant: "destructive",
          title: "Password Required",
          description: "Please enter your password.",
        });
        setLoading(false);
        return;
      }

      if (isSignUp && !fullName) {
        toast({
          variant: "destructive",
          title: "Name Required",
          description: "Please enter your full name.",
        });
        setLoading(false);
        return;
      }

      const endpoint = isSignUp ? "/api/auth/signup" : "/api/auth/login";
      const body = isSignUp
        ? { email, password, fullName }
        : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMessages: { [key: string]: { title: string; description: string } } = {
          INVALID_EMAIL: {
            title: "Invalid Email",
            description: "Please enter a valid email address.",
          },
          WEAK_PASSWORD: {
            title: "Password Too Short",
            description: "Your password must be at least 6 characters.",
          },
          USER_NOT_FOUND: {
            title: "Email Not Found",
            description: "This email isn't registered yet. Sign up to create an account.",
          },
          INVALID_PASSWORD: {
            title: "Wrong Password",
            description: "Check your password and try again.",
          },
          EMAIL_EXISTS: {
            title: "Email Already Registered",
            description: "This email is already registered. Log in instead or use a different email.",
          },
          MISSING_FIELDS: {
            title: "Missing Information",
            description: data.error || "Please fill in all required fields.",
          },
          INVALID_NAME: {
            title: "Invalid Name",
            description: "Please enter your full name.",
          },
          SERVER_ERROR: {
            title: "Something Went Wrong",
            description: "We couldn't process your request. Check your internet and try again.",
          },
        };

        const errorInfo = errorMessages[data.code] || {
          title: "Error",
          description: data.error || "Authentication failed. Try again.",
        };

        toast({
          variant: "destructive",
          title: errorInfo.title,
          description: errorInfo.description,
        });
        return;
      }

      if (isSignUp) {
        toast({
          title: "Account Created",
          description: "Welcome to Hostlio. Start searching for your room now.",
        });
        await refetch();
        setFullName("");
        setEmail("");
        setPassword("");
        setIsSignUp(false);
        router.push("/profile");
      } else {
        toast({
          title: "Welcome Back",
          description: `Hi ${data.user?.fullName || "there"}, you're logged in.`,
        });
        await refetch();
        router.push("/profile");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Something went wrong. Try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-brand-bg-warm flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-teal animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg-warm">
      <Navbar />
      <main className="max-w-md mx-auto py-20 px-4">
        <Card className="border-brand-border shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-headline font-bold">
              {isSignUp ? "Create an Account" : "Login to Hostlio"}
            </CardTitle>
            <CardDescription>
              {isSignUp
                ? "Join India's largest direct rental network"
                : "Enter your credentials to access your account"}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleAuth}>
            <CardContent className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-secondary hover:text-brand-text-primary transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full bg-brand-teal hover:bg-brand-teal-mid font-bold h-11"
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isSignUp ? "Register" : "Login"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-brand-text-secondary text-xs"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp
                  ? "Already have an account? Login"
                  : "Don't have an account? Sign up"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
