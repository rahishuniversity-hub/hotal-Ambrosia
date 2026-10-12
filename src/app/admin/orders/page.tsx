"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/AdminShell";
import Modal from "@/components/admin/Modal";
import { adminStore } from "@/lib/store";
import { soundManager } from "@/lib/audioNotification";
import type { RestaurantOrder, OrderStatus, DiningSession, RunningBill, MenuItem } from "@/lib/types";
import RestaurantReceipt from "@/components/restaurant/RestaurantReceipt";
import { MENU_CATEGORIES } from "@/lib/menuData";
import {
  ShoppingBagIcon,
  CheckIcon,
  XMarkIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  PrinterIcon,
  PhoneIcon,
  ClockIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  TableCellsIcon,
  PlusIcon,
  DocumentTextIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  MinusIcon,
  CheckCircleIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

const TABLES = Array.from({ length: 20 }, (_, i) => `Table ${i + 1}`);

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewTab, setViewTab] = useState<"orders" | "tables">("orders");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<RestaurantOrder | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(soundManager.getIsMuted());
  const [newOrderAlert, setNewOrderAlert] = useState<RestaurantOrder | null>(null);

  // Persistent tracking of acknowledged/handled order IDs so notifications never repeat
  const getAcknowledgedOrderIds = (): Set<string> => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = localStorage.getItem("ha_acknowledged_orders");
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  };

  const markOrderAcknowledged = (orderId: string) => {
    if (typeof window === "undefined" || !orderId) return;
    try {
      const set = getAcknowledgedOrderIds();
      set.add(orderId);
      const arr = Array.from(set).slice(-300);
      localStorage.setItem("ha_acknowledged_orders", JSON.stringify(arr));
    } catch {
      // Ignore
    }
  };

  // Dining Sessions & Tables state
  const [diningSessions, setDiningSessions] = useState<DiningSession[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedBill, setSelectedBill] = useState<RunningBill | null>(null);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);

  // Add Items to Table Modal state
  const [isAddItemsModalOpen, setIsAddItemsModalOpen] = useState(false);
  const [targetSessionForItems, setTargetSessionForItems] = useState<DiningSession | null>(null);
  const [itemSearchQuery, setItemSearchQuery] = useState("");
  const [itemCategoryFilter, setItemCategoryFilter] = useState("All");
  const [itemsToAdd, setItemsToAdd] = useState<{ [menuItemId: string]: { item: MenuItem; quantity: number } }>({});
  const [isSubmittingItems, setIsSubmittingItems] = useState(false);

  // Walk-in Seating Modal state
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [targetTableForSeat, setTargetTableForSeat] = useState("");
  const [seatGuestName, setSeatGuestName] = useState("");
  const [seatGuestPhone, setSeatGuestPhone] = useState("");
  const [isSubmittingSeat, setIsSubmittingSeat] = useState(false);

  // Load orders, sessions, and menu
  const loadOrders = async () => {
    try {
      const data = await adminStore.getRestaurantOrders();
      setOrders(data);

      // Auto-acknowledge any non-new orders so they can never alert
      data.forEach((o) => {
        if (o.status !== "new") {
          markOrderAcknowledged(o.id);
        }
      });

      // Dismiss active banner immediately if that order is no longer genuinely "new" or already handled
      setNewOrderAlert((currentAlert) => {
        if (!currentAlert) return null;
        const fresh = data.find((o) => o.id === currentAlert.id);
        if (!fresh || fresh.status !== "new" || getAcknowledgedOrderIds().has(fresh.id)) {
          return null;
        }
        return currentAlert;
      });
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      const data = await adminStore.getDiningSessions();
      setDiningSessions(data);
    } catch (err) {
      console.error("Failed to load dining sessions:", err);
    }
  };

  const loadMenu = async () => {
    try {
      const data = await adminStore.getMenuItems();
      setMenuItems(data);
    } catch (err) {
      console.error("Failed to load menu items:", err);
    }
  };

  useEffect(() => {
    loadOrders();
    loadSessions();
    loadMenu();

    // Subscribe to realtime changes for orders
    const unsubscribeOrders = adminStore.subscribeToRestaurantOrders((incomingOrder, eventType) => {
      setOrders((prev) => {
        const exists = prev.find((o) => o.id === incomingOrder.id);
        if (exists) {
          return prev.map((o) => (o.id === incomingOrder.id ? incomingOrder : o));
        }
        return [incomingOrder, ...prev];
      });

      // ── CRITICAL NOTIFICATION RULES ──
      // 1. If an order is NOT "new" (accepted, preparing, ready, completed, rejected, cancelled):
      //    It must NEVER trigger the notification.
      //    If it's currently showing in newOrderAlert, dismiss it permanently!
      if (incomingOrder.status !== "new") {
        setNewOrderAlert((current) => (current?.id === incomingOrder.id ? null : current));
        markOrderAcknowledged(incomingOrder.id);
        return;
      }

      // 2. Only genuinely NEW orders trigger the notification.
      //    If already acknowledged or handled, ignore completely.
      const acknowledged = getAcknowledgedOrderIds();
      if (acknowledged.has(incomingOrder.id)) {
        return;
      }

      // 3. Genuinely new order received:
      soundManager.playNewOrderChime();
      soundManager.showBrowserNotification(
        `🔔 New Order Received: #${incomingOrder.orderNumber}`,
        {
          body: `${incomingOrder.orderType.toUpperCase()} • ₹${incomingOrder.totalAmount} • ${incomingOrder.customerName}`,
        }
      );
      setNewOrderAlert(incomingOrder);
    });

    // Subscribe to dining session changes
    const unsubscribeSessions = adminStore.subscribeToDiningSessions(() => {
      loadSessions();
    });

    // Fallback polling every 5 seconds
    const interval = setInterval(() => {
      loadOrders();
      loadSessions();
    }, 5000);

    return () => {
      unsubscribeOrders();
      unsubscribeSessions();
      clearInterval(interval);
    };
  }, []);

  const handleToggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsSoundMuted(muted);
  };

  const handleTestSound = () => {
    soundManager.playNewOrderChime();
  };

  // Status progression action
  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    // Immediately dismiss alert and mark permanently acknowledged
    markOrderAcknowledged(orderId);
    setNewOrderAlert((current) => (current?.id === orderId ? null : current));

    await adminStore.updateRestaurantOrderStatus(orderId, nextStatus);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }
  };

  // Table Session Actions
  const handleViewBill = async (session: DiningSession) => {
    const bill = await adminStore.getRunningBill(session.id);
    if (bill) {
      setSelectedBill(bill);
      setIsBillModalOpen(true);
    }
  };

  const handleFinalizeBill = async (sessionId: string) => {
    await adminStore.finalizeDiningSession(sessionId);
    await loadSessions();
    const updatedBill = await adminStore.getRunningBill(sessionId);
    if (updatedBill) {
      setSelectedBill(updatedBill);
    }
  };

  const handleCloseBill = async (sessionId: string) => {
    await adminStore.closeDiningSession(sessionId);
    await loadSessions();
    setIsBillModalOpen(false);
    setSelectedBill(null);
  };

  const handleOpenAddItems = (session: DiningSession) => {
    setTargetSessionForItems(session);
    setItemsToAdd({});
    setItemSearchQuery("");
    setItemCategoryFilter("All");
    setIsAddItemsModalOpen(true);
  };

  const handleUpdateItemQtyToAdd = (item: MenuItem, delta: number) => {
    setItemsToAdd((prev) => {
      const current = prev[item.id]?.quantity || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      }
      return {
        ...prev,
        [item.id]: { item, quantity: next },
      };
    });
  };

  const handleSaveAddMoreItems = async () => {
    if (!targetSessionForItems) return;
    const selectedEntries = Object.values(itemsToAdd);
    if (selectedEntries.length === 0) return;

    setIsSubmittingItems(true);
    try {
      const orderItems = selectedEntries.map((e) => ({
        id: `it-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        menuItemId: e.item.id,
        name: e.item.name,
        category: e.item.category,
        price: e.item.price,
        quantity: e.quantity,
      }));

      const subtotal = orderItems.reduce((s, it) => s + it.price * it.quantity, 0);
      const tax = Math.round(subtotal * 0.05);
      const totalAmount = subtotal + tax;
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `AMB-${randomDigits}`;

      await adminStore.createRestaurantOrder({
        orderNumber,
        sessionId: targetSessionForItems.id,
        orderType: "dine-in",
        status: "accepted",
        customerName: targetSessionForItems.customerName,
        customerPhone: targetSessionForItems.customerPhone,
        customerEmail: targetSessionForItems.customerEmail,
        tableNumber: targetSessionForItems.tableNumber,
        items: orderItems,
        subtotal,
        tax,
        deliveryFee: 0,
        totalAmount,
        specialInstructions: "Added by Restaurant Admin / Waitstaff",
      });

      soundManager.playNewOrderChime();
      await loadOrders();
      await loadSessions();

      // Refresh bill if bill modal is viewing this session
      if (selectedBill && selectedBill.session.id === targetSessionForItems.id) {
        const updatedBill = await adminStore.getRunningBill(targetSessionForItems.id);
        if (updatedBill) setSelectedBill(updatedBill);
      }

      setIsAddItemsModalOpen(false);
      setItemsToAdd({});
    } catch (err) {
      console.error("Failed to add items to table:", err);
    } finally {
      setIsSubmittingItems(false);
    }
  };

  // Quick Seat Walk-in Guest
  const handleOpenSeatModal = (tableName: string) => {
    setTargetTableForSeat(tableName);
    setSeatGuestName("");
    setSeatGuestPhone("");
    setIsSeatModalOpen(true);
  };

  const handleSeatWalkinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seatGuestName.trim() || !seatGuestPhone.trim()) return;

    setIsSubmittingSeat(true);
    try {
      await adminStore.createDiningSession({
        tableNumber: targetTableForSeat,
        customerName: seatGuestName.trim(),
        customerPhone: seatGuestPhone.replace(/\D/g, ""),
      });
      await loadSessions();
      setIsSeatModalOpen(false);
    } catch (err) {
      console.error("Failed to seat guest:", err);
    } finally {
      setIsSubmittingSeat(false);
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesType = typeFilter === "all" || order.orderType === typeFilter;
    if (!matchesType) return false;

    if (statusFilter === "all") return true;
    if (statusFilter === "active") {
      return (
        order.status === "new" ||
        order.status === "accepted" ||
        order.status === "preparing" ||
        order.status === "ready"
      );
    }
    return order.status === statusFilter;
  });

  // Status counts
  const newCount = orders.filter((o) => o.status === "new").length;
  const inKitchenCount = orders.filter(
    (o) => o.status === "accepted" || o.status === "preparing"
  ).length;
  const readyCount = orders.filter((o) => o.status === "ready").length;
  const completedCount = orders.filter((o) => o.status === "completed").length;

  // Active dining sessions
  const activeDiningSessions = diningSessions.filter(
    (s) => s.status === "active" || s.status === "finalized"
  );

  // Compute live running bill totals for each active table
  const tableSessionMap = new Map<string, { session: DiningSession; total: number; orderCount: number }>();
  activeDiningSessions.forEach((sess) => {
    const sessionOrders = orders.filter(
      (o) => o.sessionId === sess.id || (sess.orderIds && sess.orderIds.includes(o.id))
    );
    const total = sessionOrders.reduce((sum, ord) => sum + ord.totalAmount, 0);
    tableSessionMap.set(sess.tableNumber.toLowerCase(), {
      session: sess,
      total,
      orderCount: sessionOrders.length,
    });
  });

  const totalRunningSales = Array.from(tableSessionMap.values()).reduce((sum, it) => sum + it.total, 0);

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-cream shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-green-700 uppercase tracking-widest">
                Live Kitchen System (Phase 1)
              </span>
            </div>
            <h1 className="font-heading text-3xl font-bold text-charcoal">
              Restaurant Orders
            </h1>
            <p className="text-xs text-warm-gray mt-1">
              Manage incoming Dine-in, Takeaway, and Delivery orders with real-time status progression.
            </p>
          </div>

          {/* Sound Notification & Refresh Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleToggleSound}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isSoundMuted
                  ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
              }`}
              title={isSoundMuted ? "Sound alerts are muted" : "Sound alerts are active"}
            >
              {isSoundMuted ? (
                <>
                  <SpeakerXMarkIcon className="w-4 h-4 text-red-600" />
                  <span>Sound Muted</span>
                </>
              ) : (
                <>
                  <SpeakerWaveIcon className="w-4 h-4 text-emerald-600" />
                  <span>Sound On</span>
                </>
              )}
            </button>

            <button
              onClick={handleTestSound}
              className="px-3 py-2 bg-cream text-charcoal hover:bg-cream-dark rounded-xl text-xs font-semibold transition-colors"
            >
              🔔 Test Bell
            </button>

            <button
              onClick={loadOrders}
              className="p-2 border border-cream rounded-xl text-warm-gray hover:text-charcoal hover:bg-cream transition-colors"
              title="Refresh Orders"
            >
              <ArrowPathIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Primary View Switcher: Kitchen Queue vs Dine-In Tables */}
        <div className="flex items-center gap-2 p-1.5 bg-cream/60 rounded-2xl border border-cream w-fit">
          <button
            onClick={() => setViewTab("orders")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
              viewTab === "orders"
                ? "bg-charcoal text-gold shadow-sm"
                : "text-warm-gray hover:text-charcoal hover:bg-white/60"
            }`}
          >
            <ShoppingBagIcon className="w-4 h-4" />
            <span>Kitchen Orders Queue</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                viewTab === "orders" ? "bg-gold text-charcoal" : "bg-cream text-charcoal"
              }`}
            >
              {newCount + inKitchenCount + readyCount}
            </span>
          </button>

          <button
            onClick={() => setViewTab("tables")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
              viewTab === "tables"
                ? "bg-charcoal text-gold shadow-sm"
                : "text-warm-gray hover:text-charcoal hover:bg-white/60"
            }`}
          >
            <TableCellsIcon className="w-4 h-4" />
            <span>Dine-In Tables & Running Bills</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                viewTab === "tables" ? "bg-gold text-charcoal" : "bg-cream text-charcoal"
              }`}
            >
              {activeDiningSessions.length} Active
            </span>
          </button>
        </div>

        {/* Live Incoming Order Banner Notification */}
        {newOrderAlert && newOrderAlert.status === "new" && !getAcknowledgedOrderIds().has(newOrderAlert.id) && (
          <div className="p-4 bg-gold text-charcoal rounded-2xl shadow-lg border-2 border-gold-light animate-bounce flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔔</span>
              <div>
                <p className="text-sm font-bold uppercase tracking-wider">
                  New Order Received: #{newOrderAlert.orderNumber}
                </p>
                <p className="text-xs">
                  {newOrderAlert.customerName} ({newOrderAlert.customerPhone}) • {newOrderAlert.orderType.toUpperCase()} • ₹{newOrderAlert.totalAmount}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  markOrderAcknowledged(newOrderAlert.id);
                  setSelectedOrder(newOrderAlert);
                  setIsDetailModalOpen(true);
                  setNewOrderAlert(null);
                }}
                className="px-3 py-1.5 bg-charcoal text-gold font-bold text-xs rounded-lg uppercase tracking-wider hover:bg-charcoal/90 transition-colors"
              >
                View Details
              </button>
              <button
                onClick={() => {
                  const id = newOrderAlert.id;
                  markOrderAcknowledged(id);
                  setNewOrderAlert(null);
                  handleUpdateStatus(id, "accepted");
                }}
                className="px-3 py-1.5 bg-green-700 text-white font-bold text-xs rounded-lg uppercase tracking-wider hover:bg-green-800 transition-colors"
              >
                Accept Order
              </button>
              <button
                onClick={() => {
                  markOrderAcknowledged(newOrderAlert.id);
                  setNewOrderAlert(null);
                }}
                className="p-1 text-charcoal hover:text-black"
                title="Dismiss notification"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {viewTab === "tables" ? (
          /* ─────────────────────────────────────────────────────────────
             DINE-IN TABLES & RUNNING BILLS DASHBOARD
             ───────────────────────────────────────────────────────────── */
          <div className="space-y-6">
            {/* Table Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-cream shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-warm-gray block">
                  Total Tables
                </span>
                <span className="font-heading text-2xl font-bold text-charcoal mt-1 block">
                  20 Tables
                </span>
                <span className="text-[11px] text-warm-gray mt-0.5 block">Hotel Ambrosia Dining Hall</span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-blue-100 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
                  Occupied Tables
                </span>
                <span className="font-heading text-2xl font-bold text-blue-900 mt-1 block">
                  {activeDiningSessions.length}
                </span>
                <span className="text-[11px] text-warm-gray mt-0.5 block">Active dining sessions</span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">
                  Available Tables
                </span>
                <span className="font-heading text-2xl font-bold text-emerald-900 mt-1 block">
                  {20 - activeDiningSessions.length}
                </span>
                <span className="text-[11px] text-warm-gray mt-0.5 block">Ready for walk-ins / QR</span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-gold/40 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gold-dark block">
                  Running Dine-In Sales
                </span>
                <span className="font-heading text-2xl font-bold text-charcoal mt-1 block">
                  ₹{totalRunningSales.toLocaleString("en-IN")}
                </span>
                <span className="text-[11px] text-warm-gray mt-0.5 block">All active tables (GST incl.)</span>
              </div>
            </div>

            {/* 20 Tables Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {TABLES.map((tableName) => {
                const sessionInfo = tableSessionMap.get(tableName.toLowerCase());
                const isOccupied = !!sessionInfo;
                const session = sessionInfo?.session;
                const total = sessionInfo?.total || 0;
                const orderCount = sessionInfo?.orderCount || 0;
                const isFinalized = session?.status === "finalized";

                if (isOccupied && session) {
                  return (
                    <div
                      key={tableName}
                      className={`bg-white rounded-2xl border transition-all p-5 shadow-sm flex flex-col justify-between ${
                        isFinalized
                          ? "border-amber-400 bg-amber-50/20 ring-2 ring-amber-300/40"
                          : "border-blue-200 bg-white"
                      }`}
                    >
                      <div>
                        {/* Table Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-cream">
                          <div className="flex items-center gap-2">
                            <span className="font-heading text-lg font-bold text-charcoal">
                              {tableName}
                            </span>
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isFinalized
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {isFinalized ? "Bill Finalized" : "Occupied"}
                          </span>
                        </div>

                        {/* Customer Information */}
                        <div className="mt-3 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-warm-gray">Guest:</span>
                            <span className="font-bold text-charcoal">{session.customerName}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-warm-gray">Phone:</span>
                            <span className="font-medium text-charcoal flex items-center gap-1">
                              <PhoneIcon className="w-3 h-3 text-warm-gray" />
                              {session.customerPhone}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-warm-gray">Seated:</span>
                            <span className="text-warm-gray flex items-center gap-1">
                              <ClockIcon className="w-3 h-3" />
                              {new Date(session.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-warm-gray">Orders:</span>
                            <span className="font-semibold text-charcoal">
                              {orderCount} round{orderCount === 1 ? "" : "s"}
                            </span>
                          </div>
                        </div>

                        {/* Running Total Highlight */}
                        <div className="mt-4 p-3 bg-cream/40 rounded-xl border border-cream flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-warm-gray">
                            Running Total
                          </span>
                          <span className="font-heading text-lg font-bold text-charcoal">
                            ₹{total.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 pt-3 border-t border-cream space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleViewBill(session)}
                            className="px-3 py-2 bg-charcoal text-gold hover:bg-charcoal/90 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-sm"
                          >
                            <DocumentTextIcon className="w-3.5 h-3.5" />
                            <span>View Bill</span>
                          </button>
                          <button
                            onClick={() => handleOpenAddItems(session)}
                            className="px-3 py-2 bg-cream text-charcoal hover:bg-cream-dark rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                          >
                            <PlusIcon className="w-3.5 h-3.5" />
                            <span>+ Items</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {!isFinalized ? (
                            <button
                              onClick={() => handleFinalizeBill(session.id)}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                              title="Lock ordering and finalize bill"
                            >
                              <LockClosedIcon className="w-3.5 h-3.5" />
                              <span>Finalize</span>
                            </button>
                          ) : (
                            <div className="px-3 py-1.5 bg-amber-100 text-amber-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1">
                              <CheckCircleIcon className="w-3.5 h-3.5" />
                              <span>Finalized</span>
                            </div>
                          )}

                          <button
                            onClick={() => handleCloseBill(session.id)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-colors"
                            title="Close bill & free table for next customer"
                          >
                            Close Bill
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Available Table Card
                return (
                  <div
                    key={tableName}
                    className="bg-white rounded-2xl border border-cream p-5 shadow-sm flex flex-col justify-between hover:border-emerald-200 transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-cream">
                        <span className="font-heading text-lg font-bold text-charcoal">
                          {tableName}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Available
                        </span>
                      </div>

                      <div className="py-8 text-center text-warm-gray">
                        <TableCellsIcon className="w-8 h-8 mx-auto text-emerald-500/40 mb-1 group-hover:scale-110 transition-transform" />
                        <p className="text-xs font-semibold text-charcoal">Table is Empty</p>
                        <p className="text-[11px] text-warm-gray mt-0.5">Ready for QR scan or walk-in</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenSeatModal(tableName)}
                      className="w-full mt-2 py-2 px-3 border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <UserPlusIcon className="w-3.5 h-3.5" />
                      <span>+ Seat Walk-in Guest</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ─────────────────────────────────────────────────────────────
             KITCHEN ORDERS QUEUE
             ───────────────────────────────────────────────────────────── */
          <>
            {/* Filter Controls Bar */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-2 border-b border-cream">
              {/* Status Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setStatusFilter("active")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    statusFilter === "active"
                      ? "bg-charcoal text-gold shadow-sm"
                      : "bg-white text-warm-gray hover:bg-cream border border-cream"
                  }`}
                >
                  <span>Active Orders</span>
                  <span className="px-1.5 py-0.2 bg-gold/20 rounded-full text-[10px] font-extrabold">
                    {newCount + inKitchenCount + readyCount}
                  </span>
                </button>

                <button
                  onClick={() => setStatusFilter("new")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    statusFilter === "new"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-white text-warm-gray hover:bg-cream border border-cream"
                  }`}
                >
                  <span>New</span>
                  {newCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-white text-amber-800 rounded-full text-[10px] font-extrabold animate-pulse">
                      {newCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setStatusFilter("preparing")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    statusFilter === "preparing"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white text-warm-gray hover:bg-cream border border-cream"
                  }`}
                >
                  <span>In Kitchen</span>
                  <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded-full text-[10px]">
                    {inKitchenCount}
                  </span>
                </button>

                <button
                  onClick={() => setStatusFilter("ready")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    statusFilter === "ready"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-white text-warm-gray hover:bg-cream border border-cream"
                  }`}
                >
                  <span>Ready</span>
                  <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full text-[10px]">
                    {readyCount}
                  </span>
                </button>

                <button
                  onClick={() => setStatusFilter("completed")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    statusFilter === "completed"
                      ? "bg-charcoal text-white shadow-sm"
                      : "bg-white text-warm-gray hover:bg-cream border border-cream"
                  }`}
                >
                  Completed ({completedCount})
                </button>

                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    statusFilter === "all"
                      ? "bg-charcoal text-white shadow-sm"
                      : "bg-white text-warm-gray hover:bg-cream border border-cream"
                  }`}
                >
                  All Orders ({orders.length})
                </button>
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-warm-gray font-semibold">Type:</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-cream rounded-lg text-xs font-semibold text-charcoal focus:outline-none focus:border-gold"
                >
                  <option value="all">All Types</option>
                  <option value="dine-in">🍽️ Dine-In</option>
                  <option value="takeaway">🛍️ Takeaway</option>
                  <option value="delivery">🛵 Delivery (≤10 km)</option>
                </select>
              </div>
            </div>

            {/* Orders List / Cards */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-cream text-center shadow-sm">
                <ShoppingBagIcon className="w-12 h-12 text-warm-gray/40 mx-auto mb-3" />
                <p className="text-charcoal font-bold text-lg">No orders found</p>
                <p className="text-xs text-warm-gray mt-1">
                  No orders match the selected status or type filters.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const isNew = order.status === "new";

                  return (
                    <div
                      key={order.id}
                      className={`bg-white rounded-2xl border transition-all p-5 shadow-sm hover:shadow-md ${
                        isNew
                          ? "border-gold ring-2 ring-gold/30 bg-gold/5"
                          : "border-cream"
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Left: Info & Customer */}
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="font-heading text-lg font-bold text-charcoal">
                              #{order.orderNumber}
                            </span>

                            {/* Order Type Badge */}
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                order.orderType === "dine-in"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.orderType === "takeaway"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {order.orderType === "dine-in" && (
                                <>
                                  <BuildingStorefrontIcon className="w-3.5 h-3.5" />
                                  Dine-in • {order.tableNumber || "Table"}
                                </>
                              )}
                              {order.orderType === "takeaway" && (
                                <>
                                  <ShoppingBagIcon className="w-3.5 h-3.5" />
                                  Takeaway
                                </>
                              )}
                              {order.orderType === "delivery" && (
                                <>
                                  <MapPinIcon className="w-3.5 h-3.5" />
                                  Delivery
                                </>
                              )}
                            </span>

                            {/* Dine-in Round Tag */}
                            {order.orderType === "dine-in" && order.orderRound && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                Round {order.orderRound}
                              </span>
                            )}

                            {/* Status Pill */}
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                order.status === "new"
                                  ? "bg-amber-100 text-amber-800 animate-pulse"
                                  : order.status === "accepted"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.status === "preparing"
                                  ? "bg-indigo-100 text-indigo-800"
                                  : order.status === "ready"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : order.status === "completed"
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>

                          {/* Customer Details */}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-warm-gray">
                            <span className="font-bold text-charcoal">
                              👤 {order.customerName}
                            </span>
                            <span className="flex items-center gap-1">
                              <PhoneIcon className="w-3.5 h-3.5" />
                              {order.customerPhone}
                            </span>
                            <span className="flex items-center gap-1">
                              <ClockIcon className="w-3.5 h-3.5" />
                              {new Date(order.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {order.deliveryAddress && (
                              <span className="truncate max-w-xs" title={order.deliveryAddress}>
                                📍 {order.deliveryAddress}
                              </span>
                            )}
                          </div>

                          {/* Items Preview */}
                          <p className="text-xs text-warm-gray">
                            <span className="font-bold text-charcoal">Items: </span>
                            {order.items
                              .map((i) => `${i.quantity}x ${i.name}`)
                              .join(", ")}
                          </p>

                          {order.specialInstructions && (
                            <p className="text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md inline-block">
                              <span className="font-bold">Instructions:</span>{" "}
                              {order.specialInstructions}
                            </p>
                          )}
                        </div>

                        {/* Right: Bill Amount & Action Workflow Pipeline */}
                        <div className="flex flex-row lg:flex-col items-end justify-between lg:justify-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-cream">
                          <div className="text-left lg:text-right">
                            <span className="text-[10px] text-warm-gray uppercase tracking-widest block">
                              Total Amount
                            </span>
                            <span className="font-heading text-xl font-bold text-charcoal">
                              ₹{order.totalAmount}
                            </span>
                          </div>

                          {/* Status Workflow Progression Buttons & Table Bill */}
                          <div className="flex items-center gap-2">
                            {order.orderType === "dine-in" && (
                              <button
                                onClick={async () => {
                                  const session = activeDiningSessions.find(
                                    (s) => s.tableNumber.toLowerCase() === order.tableNumber?.toLowerCase()
                                  );
                                  if (session) {
                                    handleViewBill(session);
                                  } else if (order.sessionId) {
                                    const bill = await adminStore.getRunningBill(order.sessionId);
                                    if (bill) {
                                      setSelectedBill(bill);
                                      setIsBillModalOpen(true);
                                    }
                                  }
                                }}
                                className="px-2.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                                title="View Running Bill for Table"
                              >
                                <DocumentTextIcon className="w-4 h-4" />
                                <span>Table Bill</span>
                              </button>
                            )}

                            {order.status === "new" && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(order.id, "accepted")}
                                  className="px-3.5 py-2 bg-gold hover:bg-gold-light text-charcoal font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-sm flex items-center gap-1"
                                >
                                  <CheckIcon className="w-4 h-4" />
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(order.id, "cancelled")}
                                  className="px-2.5 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold text-xs rounded-lg transition-colors"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {order.status === "accepted" && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, "preparing")}
                                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-sm flex items-center gap-1"
                              >
                                <span>👨‍🍳 Start Preparing</span>
                              </button>
                            )}

                            {order.status === "preparing" && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, "ready")}
                                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-sm flex items-center gap-1"
                              >
                                <span>🔔 Mark Ready</span>
                              </button>
                            )}

                            {order.status === "ready" && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, "completed")}
                                className="px-3.5 py-2 bg-charcoal hover:bg-charcoal-lighter text-gold font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-sm flex items-center gap-1"
                              >
                                <CheckIcon className="w-4 h-4" />
                                <span>Mark Completed</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsDetailModalOpen(true);
                              }}
                              className="p-2 text-warm-gray hover:text-charcoal hover:bg-cream rounded-lg transition-colors"
                              title="View Full Order Details"
                            >
                              <ChevronRightIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ─────────────────────────────────────────────────────────────
            ORDER DETAIL MODAL & KOT (Kitchen Order Ticket) PRINT
            ───────────────────────────────────────────────────────────── */}
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Order #${selectedOrder?.orderNumber || ""}`}
        >
          {selectedOrder && (
            <div className="space-y-5 text-charcoal">
              {/* Order Meta */}
              <div className="p-4 bg-cream/50 rounded-xl border border-cream grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-warm-gray uppercase tracking-wider text-[10px] font-bold block">
                    Dining Type
                  </span>
                  <p className="font-bold text-charcoal capitalize">
                    {selectedOrder.orderType}
                    {selectedOrder.tableNumber && ` • ${selectedOrder.tableNumber}`}
                    {selectedOrder.pickupTime && ` • ${selectedOrder.pickupTime}`}
                  </p>
                </div>
                <div>
                  <span className="text-warm-gray uppercase tracking-wider text-[10px] font-bold block">
                    Current Status
                  </span>
                  <p className="font-bold text-charcoal uppercase">
                    {selectedOrder.status}
                  </p>
                </div>
                <div>
                  <span className="text-warm-gray uppercase tracking-wider text-[10px] font-bold block">
                    Customer
                  </span>
                  <p className="font-bold text-charcoal">
                    {selectedOrder.customerName}
                  </p>
                  <p className="text-warm-gray">{selectedOrder.customerPhone}</p>
                </div>
                <div>
                  <span className="text-warm-gray uppercase tracking-wider text-[10px] font-bold block">
                    Time Placed
                  </span>
                  <p className="font-semibold text-charcoal">
                    {new Date(selectedOrder.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {selectedOrder.deliveryAddress && (
                <div className="p-3 bg-cream/30 rounded-xl border border-cream text-xs">
                  <span className="text-warm-gray uppercase tracking-wider text-[10px] font-bold block">
                    Delivery Address (~{selectedOrder.deliveryDistanceKm} km)
                  </span>
                  <p className="text-charcoal mt-0.5">{selectedOrder.deliveryAddress}</p>
                </div>
              )}

              {/* Items Breakdown */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-warm-gray mb-2">
                  Kitchen Items
                </h4>
                <div className="divide-y divide-cream/60 border border-cream rounded-xl overflow-hidden">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 flex items-center justify-between text-xs bg-white"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-gold/20 text-charcoal font-bold flex items-center justify-center">
                          {item.quantity}x
                        </span>
                        <div>
                          <p className="font-bold text-charcoal">{item.name}</p>
                          <p className="text-[11px] text-warm-gray">{item.category}</p>
                        </div>
                      </div>
                      <span className="font-bold text-charcoal">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {selectedOrder.specialInstructions && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                    <span className="font-bold">Chef Note: </span>
                    {selectedOrder.specialInstructions}
                  </div>
                )}
              </div>

              {/* Financial Breakdown */}
              <div className="pt-3 border-t border-cream space-y-1.5 text-xs">
                <div className="flex justify-between text-warm-gray">
                  <span>Subtotal</span>
                  <span className="font-semibold text-charcoal">₹{selectedOrder.subtotal}</span>
                </div>
                <div className="flex justify-between text-warm-gray">
                  <span>GST (5%)</span>
                  <span className="font-semibold text-charcoal">₹{selectedOrder.tax}</span>
                </div>
                {selectedOrder.deliveryFee > 0 && (
                  <div className="flex justify-between text-warm-gray">
                    <span>Delivery Fee</span>
                    <span className="font-semibold text-charcoal">₹{selectedOrder.deliveryFee}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-charcoal pt-2 border-t border-cream">
                  <span>Grand Total</span>
                  <span className="font-heading text-lg text-gold-dark">
                    ₹{selectedOrder.totalAmount}
                  </span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-cream flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-cream text-charcoal hover:bg-cream rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <PrinterIcon className="w-4 h-4" />
                  <span>Print KOT Ticket</span>
                </button>

                {/* Next Step Action */}
                <div className="flex items-center gap-2">
                  {selectedOrder.status === "new" && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, "accepted")}
                      className="px-4 py-2 bg-gold hover:bg-gold-light text-charcoal font-bold text-xs uppercase tracking-wider rounded-lg"
                    >
                      Accept Order
                    </button>
                  )}
                  {selectedOrder.status === "accepted" && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, "preparing")}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg"
                    >
                      Start Preparing
                    </button>
                  )}
                  {selectedOrder.status === "preparing" && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, "ready")}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg"
                    >
                      Mark Ready
                    </button>
                  )}
                  {selectedOrder.status === "ready" && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, "completed")}
                      className="px-4 py-2 bg-charcoal hover:bg-charcoal-lighter text-gold font-bold text-xs uppercase tracking-wider rounded-lg"
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* ─────────────────────────────────────────────────────────────
            RUNNING / FINAL BILL MODAL WITH PRINT & PDF
            ───────────────────────────────────────────────────────────── */}
        <Modal
          isOpen={isBillModalOpen}
          onClose={() => setIsBillModalOpen(false)}
          title={
            selectedBill
              ? `Running Bill • ${selectedBill.session.tableNumber}`
              : "Table Bill"
          }
        >
          {selectedBill && (
            <div className="max-w-md mx-auto py-2">
              <RestaurantReceipt
                bill={selectedBill}
                showAdminActions={true}
                onFinalize={() => handleFinalizeBill(selectedBill.session.id)}
                onCloseSession={() => handleCloseBill(selectedBill.session.id)}
                onAddMoreItems={() => {
                  setIsBillModalOpen(false);
                  handleOpenAddItems(selectedBill.session);
                }}
              />
            </div>
          )}
        </Modal>

        {/* ─────────────────────────────────────────────────────────────
            ADD ITEMS TO TABLE MODAL (FULL DYNAMIC MENU)
            ───────────────────────────────────────────────────────────── */}
        <Modal
          isOpen={isAddItemsModalOpen}
          onClose={() => {
            setIsAddItemsModalOpen(false);
            setItemsToAdd({});
          }}
          title={
            targetSessionForItems
              ? `Add Items to ${targetSessionForItems.tableNumber} • ${targetSessionForItems.customerName}`
              : "Add Items to Table"
          }
        >
          {targetSessionForItems && (
            <div className="space-y-4 max-w-lg mx-auto">
              <p className="text-xs text-warm-gray">
                Add any dish or beverage from the active restaurant menu. Items will be added to this dining session and automatically combined into the running bill.
              </p>

              {/* Search & Category Filter */}
              <div className="space-y-2">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-4 h-4 text-warm-gray absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search menu items..."
                    value={itemSearchQuery}
                    onChange={(e) => setItemSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-cream/30 border border-cream rounded-xl text-xs text-charcoal placeholder-warm-gray focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {["All", ...MENU_CATEGORIES].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setItemCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
                        itemCategoryFilter === cat
                          ? "bg-charcoal text-gold"
                          : "bg-cream/50 text-warm-gray hover:bg-cream"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Menu Items List */}
              <div className="max-h-72 overflow-y-auto divide-y divide-cream/60 border border-cream rounded-xl">
                {menuItems
                  .filter((item) => {
                    const matchesCat =
                      itemCategoryFilter === "All" || item.category === itemCategoryFilter;
                    const matchesSearch =
                      !itemSearchQuery.trim() ||
                      item.name.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
                      item.description?.toLowerCase().includes(itemSearchQuery.toLowerCase());
                    return matchesCat && matchesSearch;
                  })
                  .map((item) => {
                    const currentQty = itemsToAdd[item.id]?.quantity || 0;
                    return (
                      <div
                        key={item.id}
                        className="p-3 flex items-center justify-between gap-3 hover:bg-cream/20 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs text-charcoal truncate">{item.name}</p>
                          <p className="text-[11px] text-warm-gray truncate">
                            {item.category} • ₹{item.price}
                          </p>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-1.5">
                          {currentQty > 0 ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setItemsToAdd((prev) => {
                                    const next = { ...prev };
                                    if (next[item.id].quantity <= 1) {
                                      delete next[item.id];
                                    } else {
                                      next[item.id] = { item, quantity: next[item.id].quantity - 1 };
                                    }
                                    return next;
                                  });
                                }}
                                className="w-7 h-7 rounded-lg bg-cream hover:bg-cream-dark text-charcoal font-bold flex items-center justify-center text-xs transition-colors"
                              >
                                <MinusIcon className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-6 text-center font-bold text-xs text-charcoal">
                                {currentQty}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setItemsToAdd((prev) => ({
                                    ...prev,
                                    [item.id]: {
                                      item,
                                      quantity: (prev[item.id]?.quantity || 0) + 1,
                                    },
                                  }));
                                }}
                                className="w-7 h-7 rounded-lg bg-gold hover:bg-gold-light text-charcoal font-bold flex items-center justify-center text-xs transition-colors"
                              >
                                <PlusIcon className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setItemsToAdd((prev) => ({
                                  ...prev,
                                  [item.id]: { item, quantity: 1 },
                                }));
                              }}
                              className="px-2.5 py-1 bg-cream hover:bg-gold hover:text-charcoal text-charcoal rounded-lg text-xs font-bold transition-colors"
                            >
                              + Add
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Selected Summary & Submit */}
              {(() => {
                const selectedList = Object.values(itemsToAdd).filter((e) => e.quantity > 0);
                const subtotal = selectedList.reduce(
                  (sum, it) => sum + it.item.price * it.quantity,
                  0
                );
                const tax = Math.round(subtotal * 0.05);
                const grandTotal = subtotal + tax;

                return (
                  <div className="pt-3 border-t border-cream space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-warm-gray">
                        {selectedList.reduce((s, it) => s + it.quantity, 0)} item(s) selected:
                      </span>
                      <span className="font-bold text-charcoal">
                        ₹{subtotal} + ₹{tax} GST = ₹{grandTotal}
                      </span>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddItemsModalOpen(false);
                          setItemsToAdd({});
                        }}
                        className="px-4 py-2 border border-cream text-charcoal hover:bg-cream rounded-xl text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveAddMoreItems}
                        disabled={selectedList.length === 0 || isSubmittingItems}
                        className="px-5 py-2 bg-gold hover:bg-gold-light text-charcoal font-bold text-xs rounded-xl uppercase tracking-wider disabled:opacity-50 transition-colors shadow-sm"
                      >
                        {isSubmittingItems
                          ? "Adding to Bill..."
                          : `Add to ${targetSessionForItems.tableNumber} Bill`}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </Modal>

        {/* ─────────────────────────────────────────────────────────────
            SEAT WALK-IN GUEST MODAL
            ───────────────────────────────────────────────────────────── */}
        <Modal
          isOpen={isSeatModalOpen}
          onClose={() => setIsSeatModalOpen(false)}
          title={`Seat Walk-in Guest at ${targetTableForSeat}`}
        >
          <form onSubmit={handleSeatWalkinSubmit} className="space-y-4 max-w-sm mx-auto">
            <p className="text-xs text-warm-gray">
              Open a new active dining session for this table. When the bill is closed later, the table will automatically return to available.
            </p>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">
                Guest Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Vikram Malhotra"
                value={seatGuestName}
                onChange={(e) => setSeatGuestName(e.target.value)}
                className="w-full px-3 py-2 bg-cream/30 border border-cream rounded-xl text-xs text-charcoal placeholder-warm-gray focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={seatGuestPhone}
                onChange={(e) => setSeatGuestPhone(e.target.value)}
                className="w-full px-3 py-2 bg-cream/30 border border-cream rounded-xl text-xs text-charcoal placeholder-warm-gray focus:outline-none focus:border-gold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsSeatModalOpen(false)}
                className="px-4 py-2 border border-cream text-charcoal hover:bg-cream rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingSeat || !seatGuestName.trim() || !seatGuestPhone.trim()}
                className="px-5 py-2 bg-gold hover:bg-gold-light text-charcoal font-bold text-xs rounded-xl uppercase tracking-wider disabled:opacity-50 transition-colors shadow-sm"
              >
                {isSubmittingSeat ? "Seating..." : "Start Dining Session"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminShell>
  );
}
