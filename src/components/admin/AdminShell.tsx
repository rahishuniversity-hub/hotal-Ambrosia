"use client";

import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import {
  HomeIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  CakeIcon,
  PhotoIcon,
  EnvelopeIcon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { adminStore } from "@/lib/store";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: <HomeIcon className="w-5 h-5" /> },
  { label: "Orders", href: "/admin/orders", icon: <ShoppingBagIcon className="w-5 h-5" /> },
  { label: "Bookings", href: "/admin/bookings", icon: <CalendarDaysIcon className="w-5 h-5" /> },
  { label: "Rooms", href: "/admin/rooms", icon: <BuildingOfficeIcon className="w-5 h-5" /> },
  { label: "Restaurant", href: "/admin/restaurant", icon: <CakeIcon className="w-5 h-5" /> },
  { label: "Banquet", href: "/admin/banquet", icon: <BuildingOfficeIcon className="w-5 h-5" /> },
  { label: "Gallery", href: "/admin/gallery", icon: <PhotoIcon className="w-5 h-5" /> },
  { label: "Enquiries", href: "/admin/enquiries", icon: <EnvelopeIcon className="w-5 h-5" /> },
  { label: "Settings", href: "/admin/settings", icon: <Cog6ToothIcon className="w-5 h-5" /> },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading, logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);

  useEffect(() => {
    const fetchOrderCount = async () => {
      const orders = await adminStore.getRestaurantOrders();
      const active = orders.filter((o) => o.status === "new" || o.status === "accepted" || o.status === "preparing").length;
      setActiveOrdersCount(active);
    };
    fetchOrderCount();
    const unsub = adminStore.subscribeToRestaurantOrders(() => {
      fetchOrderCount();
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/admin");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    router.push("/admin");
  };

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-charcoal text-white transform transition-transform duration-300 lg:translate-x-0 lg:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-charcoal-lighter">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <Image
              src="/images/logo/Main-Logo-White.svg"
              alt="Hotel Ambrosia"
              width={140}
              height={40}
              className="h-8 w-auto"
            />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-warm-gray-light hover:text-white"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gold/20 text-gold"
                    : "text-warm-gray-light hover:bg-charcoal-lighter hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  {item.label}
                </div>
                {item.href === "/admin/orders" && activeOrdersCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gold text-charcoal animate-pulse">
                    {activeOrdersCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div className="px-3 py-4 border-t border-charcoal-lighter">
          <div className="px-3 py-2 text-xs text-warm-gray-light truncate mb-2">
            {user?.email || "Admin"}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-warm-gray-light hover:bg-charcoal-lighter hover:text-white transition-colors"
          >
            <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-cream flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-charcoal hover:text-gold"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          <div className="hidden lg:block" />

          <Link
            href="/"
            target="_blank"
            className="text-xs font-semibold text-warm-gray hover:text-gold uppercase tracking-wider"
          >
            View Website →
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
