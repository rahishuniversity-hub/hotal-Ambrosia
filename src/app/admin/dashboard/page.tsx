"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/admin/StatusBadge";
import { adminStore } from "@/lib/store";
import type { Booking, Enquiry } from "@/lib/types";
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EnvelopeIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    todayBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    totalEnquiries: 0,
    unreadEnquiries: 0,
    totalOrders: 0,
    activeOrders: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [recentEnquiries, setRecentEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [dashboardStats, allBookings, allEnquiries] = await Promise.all([
          adminStore.getDashboardStats(),
          adminStore.getBookings(),
          adminStore.getEnquiries(),
        ]);

        setStats(dashboardStats);
        setRecentBookings(allBookings.slice(0, 5));
        setRecentEnquiries(allEnquiries.slice(0, 5));
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-8">
        {/* Page Title */}
        <div>
          <h1 className="font-heading text-3xl font-bold text-charcoal">
            Dashboard Overview
          </h1>
          <p className="text-warm-gray text-sm mt-1">
            Welcome to the Hotel Ambrosia management dashboard
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon={<CalendarDaysIcon className="w-6 h-6" />}
          />
          <StatCard
            title="Pending Bookings"
            value={stats.pendingBookings}
            icon={<ClockIcon className="w-6 h-6" />}
            color="warning"
          />
          <StatCard
            title="Confirmed Bookings"
            value={stats.confirmedBookings}
            icon={<CheckCircleIcon className="w-6 h-6" />}
            color="success"
          />
          <StatCard
            title="Cancelled Bookings"
            value={stats.cancelledBookings}
            icon={<XCircleIcon className="w-6 h-6" />}
            color="danger"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-cream flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-warm-gray">Today&apos;s Bookings</p>
              <p className="text-2xl font-bold text-charcoal mt-2">{stats.todayBookings}</p>
            </div>
            <div className="p-3 bg-gold/10 text-gold rounded-lg">
              <CalendarDaysIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-cream flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-warm-gray">Unread Enquiries</p>
              <p className="text-2xl font-bold text-charcoal mt-2">{stats.unreadEnquiries}</p>
            </div>
            <div className="p-3 bg-gold/10 text-gold rounded-lg">
              <EnvelopeIcon className="w-6 h-6" />
            </div>
          </div>
          <Link
            href="/admin/orders"
            className="bg-white p-6 rounded-xl shadow-md border border-cream flex items-center justify-between hover:border-gold transition-colors group"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-warm-gray">Active Kitchen Orders</p>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
              </div>
              <p className="text-2xl font-bold text-charcoal mt-2 group-hover:text-gold transition-colors">
                {stats.activeOrders ?? 0}
              </p>
              <p className="text-xs text-gold font-semibold mt-1">Manage Live Orders →</p>
            </div>
            <div className="p-3 bg-gold/10 text-gold rounded-lg group-hover:bg-gold group-hover:text-charcoal transition-colors">
              <ShoppingBagIcon className="w-6 h-6" />
            </div>
          </Link>
        </div>

        {/* Two-column layout for recent items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Bookings */}
          <div className="bg-white rounded-xl shadow-md border border-cream p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-bold text-charcoal">
                Recent Bookings
              </h2>
              <Link
                href="/admin/bookings"
                className="text-xs font-semibold text-gold hover:text-gold-dark uppercase tracking-wider"
              >
                View All
              </Link>
            </div>

            {recentBookings.length === 0 ? (
              <p className="text-sm text-warm-gray text-center py-8">
                No recent bookings found.
              </p>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-cream/50 border border-cream"
                  >
                    <div>
                      <p className="font-medium text-charcoal">{booking.guestName}</p>
                      <p className="text-xs text-warm-gray mt-0.5">
                        {booking.roomType} • {booking.checkIn} to {booking.checkOut}
                      </p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Enquiries */}
          <div className="bg-white rounded-xl shadow-md border border-cream p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-bold text-charcoal">
                Recent Enquiries
              </h2>
              <Link
                href="/admin/enquiries"
                className="text-xs font-semibold text-gold hover:text-gold-dark uppercase tracking-wider"
              >
                View All
              </Link>
            </div>

            {recentEnquiries.length === 0 ? (
              <p className="text-sm text-warm-gray text-center py-8">
                No recent enquiries found.
              </p>
            ) : (
              <div className="space-y-4">
                {recentEnquiries.map((enquiry) => (
                  <div
                    key={enquiry.id}
                    className="p-4 rounded-lg bg-cream/50 border border-cream"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-charcoal">{enquiry.name}</p>
                      <span className="text-xs text-warm-gray">{enquiry.createdAt}</span>
                    </div>
                    <p className="text-xs text-warm-gray mt-1 truncate">
                      {enquiry.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
