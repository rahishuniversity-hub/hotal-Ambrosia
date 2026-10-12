"use client";

import type { BookingStatus, BanquetEnquiryStatus, RoomStatus } from "@/lib/types";

type Status = BookingStatus | BanquetEnquiryStatus | RoomStatus;

interface StatusBadgeProps {
  status: Status;
}

const statusConfig: Record<Status, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-amber-100", text: "text-amber-800", label: "Pending" },
  confirmed: { bg: "bg-green-100", text: "text-green-800", label: "Confirmed" },
  "checked-in": { bg: "bg-blue-100", text: "text-blue-800", label: "Checked In" },
  "checked-out": { bg: "bg-gray-100", text: "text-gray-800", label: "Checked Out" },
  cancelled: { bg: "bg-red-100", text: "text-red-800", label: "Cancelled" },
  available: { bg: "bg-green-100", text: "text-green-800", label: "Available" },
  occupied: { bg: "bg-orange-100", text: "text-orange-800", label: "Occupied" },
  maintenance: { bg: "bg-gray-100", text: "text-gray-800", label: "Maintenance" },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || { bg: "bg-gray-100", text: "text-gray-800", label: status };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}