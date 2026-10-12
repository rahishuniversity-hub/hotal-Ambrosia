"use client";

import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color?: "default" | "success" | "warning" | "danger";
}

const colorMap = {
  default: { bg: "bg-gold/10", text: "text-gold" },
  success: { bg: "bg-green-50", text: "text-green-600" },
  warning: { bg: "bg-amber-50", text: "text-amber-600" },
  danger: { bg: "bg-red-50", text: "text-red-600" },
};

export default function StatCard({ title, value, icon, color = "default" }: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-cream">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-warm-gray">{title}</p>
          <p className="text-2xl font-bold text-charcoal mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colors.bg} ${colors.text}`}>{icon}</div>
      </div>
    </div>
  );
}
