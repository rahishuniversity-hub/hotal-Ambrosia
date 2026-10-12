"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { login } from "@/lib/auth";
import { useAuth } from "@/components/admin/AuthProvider";
import "@/lib/store"; // Triggers seed data initialization

interface LoginFormData {
  email: string;
  password: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const { isAuthenticated, loading: isAuthLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  // Check if already logged in
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.push("/admin/dashboard");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError("");

      const success = await login(data.email, data.password);
      if (success) {
        router.push("/admin/dashboard");
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError("An error occurred during login");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Image
              src="/images/logo/Main-Logo-White.svg"
              alt="Hotel Ambrosia"
              width={200}
              height={60}
              className="h-16 w-auto"
            />
          </div>
          <h1 className="font-heading text-3xl font-bold text-white mb-2">
            Admin Portal
          </h1>
          <p className="text-warm-gray-light text-sm">
            Hotel Ambrosia Management System
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-charcoal-light rounded-xl p-8 shadow-2xl border border-charcoal-lighter">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email address",
                  },
                })}
                className={`w-full px-4 py-3 rounded-lg border-2 bg-charcoal text-white placeholder-warm-gray-light transition-colors ${
                  errors.email ? "border-red-500" : "border-charcoal-lighter focus:border-gold"
                } focus:outline-none`}
                placeholder="admin@hotel-ambrosia.com"
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <input
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" },
                })}
                className={`w-full px-4 py-3 rounded-lg border-2 bg-charcoal text-white placeholder-warm-gray-light transition-colors ${
                  errors.password ? "border-red-500" : "border-charcoal-lighter focus:border-gold"
                } focus:outline-none`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gold hover:bg-gold-light text-charcoal font-semibold uppercase tracking-wider text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Logging in..." : "Sign In"}
            </button>
          </form>

          {/* Footer Note */}
          <p className="text-center text-warm-gray-light text-xs mt-6">
            Default credentials:<br />
            Email: admin@hotel-ambrosia.com<br />
            Password: admin123
          </p>
        </div>
      </motion.div>
    </div>
  );
}
