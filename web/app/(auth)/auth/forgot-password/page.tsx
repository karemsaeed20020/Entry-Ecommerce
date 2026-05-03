"use client";
import { ForgotPasswordSkeleton } from "@/components/pages/auth/AuthSkeletons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import authApi from "@/lib/authApi";
import { ArrowLeft, CheckCircle, Mail } from "lucide-react";
import Link from "next/link";
import React, { Suspense, useState } from "react";
import { toast } from "sonner";

function ForgotPasswordContent() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    setIsLoading(true);
    try {
      const response = await authApi.post("/auth/forgot-password", { email });

      if (response.success) {
        setIsSuccess(true);
        toast.success("Reset link sent!", {
          description: "Check your email for the password reset link",
        });
      } else {
        toast.error("Failed to send reset link", {
          description: response.error?.message || "Please try again",
        });
      }
    } catch (error) {
       toast.error("Something went wrong", {
        description: "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <div className="min-h-screen bg-muted/30">
      <main className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl">
          {!isSuccess ? (
            <>
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-4xl font-bold text-foreground mb-3">
                  Forgot Password?
                </h1>
                <p className="text-lg text-muted-foreground max-w-md mx-auto">
                  No worries! Enter your email and we will send you a link to
                  reset your password.
                </p>
              </div>
              <div className="bg-card shadow-lg rounded-3xl p-10 border border-border">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="text-sm text-foreground mb-2 block"
                    >
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="h-12 text-base"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full h-12 text-base bg-primary hover:bg-primary/90 transition-colors">
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>
              </div>
              <p className="text-center text-base text-muted-foreground mt-8">
                Remember your password?{" "}
                <Link
                  href="/auth/signin"
                  className="text-primary font-semibold hover:text-primary transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <div className="bg-card shadow-lg rounded-3xl border border-border p-10 text-center">
                <div className="inline-flex items-center justify-center bg-green-100 rounded-full w-20 h-20 mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-muted-foreground mb-4">Check Your Email</h2>
                 <p className="text-lg text-muted-foreground mb-8">
                We have sent a password reset link to{" "}
                <span className="font-semibold text-foreground">{email}</span>
              </p>
              <div className="bg-muted rounded-xl p-6 mb-6">
                <p className="text-sm text-muted-foreground">
                  Did not receive the email? Check your spam folder or {" "}
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="text-primary font-semibold hover:text-primary transition-colors"
                  >
                    try again
                  </button>
                </p>
              </div>
              <Link
                href="/auth/signin"
                className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<ForgotPasswordSkeleton />}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
