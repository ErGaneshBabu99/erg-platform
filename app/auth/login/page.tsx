"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Mail, Eye, EyeOff, Shield } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      totp: data.totp,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold font-display text-xl">E</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Er G Admin</h1>
          <p className="text-navy-300 mt-1 text-sm">Sign in to the control panel</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
                <Shield className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              {...register("email")}
              error={errors.email?.message}
              placeholder="admin@erg.com.np"
              autoComplete="email"
              leftAddon={<Mail className="w-4 h-4" />}
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                error={errors.password?.message}
                placeholder="••••••••••••"
                autoComplete="current-password"
                leftAddon={<Lock className="w-4 h-4" />}
                rightAddon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                required
              />
            </div>

            <Button
              type="submit"
              loading={isSubmitting}
              className="w-full"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              ← Back to Er G website
            </Link>
          </div>
        </div>

        <p className="text-center text-navy-500 text-xs mt-6">
          Protected by Er G Security · All login attempts are logged
        </p>
      </div>
    </div>
  );
}
