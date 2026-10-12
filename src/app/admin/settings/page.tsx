"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/AdminShell";
import FormField from "@/components/admin/FormField";
import { adminStore } from "@/lib/store";
import type { AdminSettings } from "@/lib/types";
import { useForm } from "react-hook-form";

export default function SettingsPage() {
  const [, setSettings] = useState<AdminSettings | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { register, handleSubmit, setValue } = useForm<{
    name: string;
    email: string;
    newPassword?: string;
  }>();

  useEffect(() => {
    const data = adminStore.getAdminSettings();
    if (data) {
      setSettings(data);
      setValue("name", data.name);
      setValue("email", data.email);
    }
  }, [setValue]);

  const onSubmit = async (data: { name: string; email: string; newPassword?: string }) => {
    setIsUpdating(true);
    setMessage(null);
    try {
      const success = await adminStore.updateAdminSettings(data);
      if (success) {
        setMessage({ type: "success", text: "Settings updated successfully." });
        setSettings(adminStore.getAdminSettings());
      } else {
        setMessage({ type: "error", text: "Failed to update settings." });
      }
    } catch {
      setMessage({ type: "error", text: "An error occurred." });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AdminShell>
      <div className="max-w-2xl space-y-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-charcoal">
            Settings
          </h1>
          <p className="text-warm-gray text-sm mt-1">
            Manage admin account details and security
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-xl shadow-md border border-cream space-y-6">
          <FormField label="Admin Name">
            <input
              type="text"
              {...register("name", { required: true })}
              className="w-full px-3 py-2 border border-cream rounded-lg focus:outline-none focus:border-gold"
            />
          </FormField>

          <FormField label="Email Address">
            <input
              type="email"
              {...register("email", { required: true })}
              className="w-full px-3 py-2 border border-cream rounded-lg focus:outline-none focus:border-gold"
            />
          </FormField>

          <FormField label="New Password (leave blank to keep current)">
            <input
              type="password"
              {...register("newPassword")}
              className="w-full px-3 py-2 border border-cream rounded-lg focus:outline-none focus:border-gold"
              placeholder="••••••••"
            />
          </FormField>

          {message && (
            <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-500"}`}>
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={isUpdating}
            className="px-6 py-2 bg-gold hover:bg-gold-light text-charcoal font-semibold rounded-lg disabled:opacity-50"
          >
            {isUpdating ? "Saving..." : "Save Settings"}
          </button>
        </form>
      </div>
    </AdminShell>
  );
}
