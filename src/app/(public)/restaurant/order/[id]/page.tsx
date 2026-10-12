"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { adminStore } from "@/lib/store";
import type { RestaurantOrder, OrderStatus, RunningBill } from "@/lib/types";
import RestaurantReceipt from "@/components/restaurant/RestaurantReceipt";
import {
  CheckCircleIcon,
  ClockIcon,
  PhoneIcon,
  ShoppingBagIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  PrinterIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const STATUS_STEPS: { key: OrderStatus; label: string; desc: string }[] = [
  {
    key: "new",
    label: "New Order",
    desc: "Received by Hotel Ambrosia. Awaiting confirmation.",
  },
  {
    key: "accepted",
    label: "Accepted",
    desc: "Order confirmed by the restaurant team.",
  },
  {
    key: "preparing",
    label: "Preparing",
    desc: "Chef is crafting your fresh, authentic dishes.",
  },
  {
    key: "ready",
    label: "Ready",
    desc: "Your order is freshly prepared and ready.",
  },
  {
    key: "completed",
    label: "Completed",
    desc: "Order completed. Thank you for choosing Hotel Ambrosia!",
  },
];

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<RestaurantOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [runningBillData, setRunningBillData] = useState<RunningBill | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [loadingBill, setLoadingBill] = useState(false);

  const loadOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      const data = await adminStore.getRestaurantOrderById(orderId);
      if (data) {
        setOrder(data);
      } else {
        setError("Order not found.");
      }
    } catch {
      setError("Failed to load order.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();

    // Subscribe to realtime changes
    const unsubscribe = adminStore.subscribeToRestaurantOrders((updatedOrder) => {
      if (updatedOrder.id === orderId || updatedOrder.orderNumber === orderId) {
        setOrder(updatedOrder);
      }
    });

    // Also poll every 5 seconds as a safety net
    const interval = setInterval(loadOrder, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [orderId, loadOrder]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream/40 pt-28 pb-16 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" />
          <p className="text-sm text-warm-gray font-medium">Fetching your order status...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-cream/40 pt-28 pb-16">
        <div className="max-w-xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl p-8 border border-cream shadow-sm space-y-4">
            <h1 className="font-heading text-2xl font-bold text-charcoal">
              Order Not Found
            </h1>
            <p className="text-sm text-warm-gray">
              We couldn&apos;t locate an order with ID: <code className="text-charcoal font-bold">{orderId}</code>
            </p>
            <div className="pt-4">
              <Link
                href="/restaurant/menu"
                className="px-6 py-2.5 bg-gold text-charcoal font-semibold text-sm rounded-lg uppercase tracking-wider inline-block"
              >
                Back to Restaurant Menu
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleLoadRunningBill = async () => {
    if (!order) return;
    setLoadingBill(true);
    try {
      if (order.sessionId) {
        const bill = await adminStore.getRunningBill(order.sessionId);
        if (bill) {
          setRunningBillData(bill);
          setIsReceiptModalOpen(true);
          return;
        }
      }
      // Single order bill fallback
      setRunningBillData({
        session: {
          id: order.id,
          sessionNumber: order.orderNumber,
          tableNumber: order.tableNumber || "Direct",
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          customerEmail: order.customerEmail,
          status: "active",
          orderIds: [order.id],
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        },
        orders: [order],
        items: order.items.map((it) => ({
          id: it.id,
          menuItemId: it.menuItemId,
          name: it.name,
          category: it.category,
          unitPrice: it.price,
          quantity: it.quantity,
          lineTotal: it.price * it.quantity,
          orders: [{ orderNumber: order.orderNumber, quantity: it.quantity, time: order.createdAt, round: order.orderRound }],
        })),
        subtotal: order.subtotal,
        tax: order.tax,
        totalAmount: order.totalAmount,
        billNumber: `AMB-${order.orderNumber}`,
        billDate: order.createdAt,
      });
      setIsReceiptModalOpen(true);
    } catch (err) {
      console.error("Failed to load running bill:", err);
    } finally {
      setLoadingBill(false);
    }
  };

  // Determine active step index
  const statusIndexMap: Record<OrderStatus, number> = {
    new: 0,
    accepted: 1,
    preparing: 2,
    ready: 3,
    completed: 4,
    cancelled: -1,
  };

  const currentStep = statusIndexMap[order.status] ?? 0;
  const isCancelled = order.status === "cancelled";

  return (
    <div className="min-h-screen bg-cream/30 pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-cream shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-cream pb-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-gold/15 text-gold-dark text-xs font-bold uppercase tracking-wider">
                  Phase 1 Live Tracker
                </span>
                {order.orderType === "dine-in" && (
                  <span className="px-3 py-1 rounded-full bg-charcoal text-gold text-xs font-bold uppercase tracking-wider">
                    {order.tableNumber || "Dine-In"} • Round {order.orderRound || 1}
                  </span>
                )}
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-charcoal">
                Order #{order.orderNumber}
              </h1>
              <p className="text-xs text-warm-gray mt-1">
                Placed on {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}, {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Status Pill & Running Bill Quick Button */}
            <div className="flex flex-col sm:items-end gap-2">
              {isCancelled ? (
                <span className="px-4 py-2 rounded-full bg-red-100 text-red-800 font-bold text-sm">
                  Cancelled
                </span>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-charcoal text-gold font-bold text-sm shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-gold animate-ping" />
                  <span className="uppercase tracking-wider">
                    {order.status === "new" && "New Order"}
                    {order.status === "accepted" && "Accepted"}
                    {order.status === "preparing" && "Preparing in Kitchen"}
                    {order.status === "ready" && "Ready!"}
                    {order.status === "completed" && "Completed"}
                  </span>
                </div>
              )}

              {order.orderType === "dine-in" && (
                <button
                  type="button"
                  onClick={handleLoadRunningBill}
                  disabled={loadingBill}
                  className="text-xs text-gold-dark font-bold hover:underline inline-flex items-center gap-1 mt-1"
                >
                  <DocumentTextIcon className="w-3.5 h-3.5" />
                  <span>{loadingBill ? "Loading Bill..." : "View Table Running Bill →"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Stepper Timeline */}
          {!isCancelled && (
            <div className="pt-8">
              <h2 className="text-xs font-bold uppercase tracking-widest text-warm-gray mb-6">
                Live Kitchen Progression
              </h2>

              <div className="relative">
                {/* Horizontal Progress Bar Line (desktop) */}
                <div className="hidden sm:block absolute top-4 left-6 right-6 h-1 bg-cream -z-0">
                  <div
                    className="h-full bg-gold transition-all duration-700"
                    style={{
                      width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%`,
                    }}
                  />
                </div>

                {/* Steps */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-2 relative z-10">
                  {STATUS_STEPS.map((step, idx) => {
                    const isCompleted = currentStep > idx;
                    const isCurrent = currentStep === idx;

                    return (
                      <div
                        key={step.key}
                        className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-2"
                      >
                        {/* Dot / Icon */}
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                            isCompleted
                              ? "bg-gold text-charcoal ring-4 ring-gold/20"
                              : isCurrent
                              ? "bg-charcoal text-gold ring-4 ring-gold/40 animate-pulse"
                              : "bg-white border-2 border-cream text-warm-gray"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircleIcon className="w-5 h-5" />
                          ) : (
                            idx + 1
                          )}
                        </div>

                        {/* Text */}
                        <div>
                          <p
                            className={`text-xs font-bold uppercase tracking-wider ${
                              isCurrent
                                ? "text-charcoal"
                                : isCompleted
                                ? "text-gold-dark"
                                : "text-warm-gray"
                            }`}
                          >
                            {step.label}
                          </p>
                          <p className="text-[11px] text-warm-gray leading-tight mt-0.5 max-w-[120px] hidden sm:block">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {isCancelled && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs mt-6">
              This order was cancelled by the restaurant or customer. Please contact Hotel Ambrosia for assistance.
            </div>
          )}
        </div>

        {/* Order Details & Summary Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-cream shadow-sm space-y-6">
          {/* Order Mode Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-cream/40 rounded-xl border border-cream">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-warm-gray block">
                Dining Preference
              </span>
              <p className="text-sm font-bold text-charcoal mt-1 flex items-center gap-1.5">
                {order.orderType === "dine-in" && (
                  <>
                    <BuildingStorefrontIcon className="w-4 h-4 text-gold" />
                    Dine-In • {order.tableNumber || "Table Assigned"} (Round {order.orderRound || 1})
                  </>
                )}
                {order.orderType === "takeaway" && (
                  <>
                    <ClockIcon className="w-4 h-4 text-gold" />
                    Takeaway • {order.pickupTime || "Standard Pickup"}
                  </>
                )}
                {order.orderType === "delivery" && (
                  <>
                    <MapPinIcon className="w-4 h-4 text-gold" />
                    Home Delivery (~{order.deliveryDistanceKm} km)
                  </>
                )}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-warm-gray block">
                Customer Contact
              </span>
              <p className="text-sm font-semibold text-charcoal mt-1">
                {order.customerName} ({order.customerPhone})
              </p>
              {order.deliveryAddress && (
                <p className="text-xs text-warm-gray mt-0.5 line-clamp-1">
                  📍 {order.deliveryAddress}
                </p>
              )}
            </div>
          </div>

          {/* Items Breakdown */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-warm-gray mb-3">
              Ordered Items (Round {order.orderRound || 1})
            </h3>
            <div className="divide-y divide-cream/60">
              {order.items.map((item, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-cream text-charcoal font-bold text-xs flex items-center justify-center">
                      {item.quantity}x
                    </span>
                    <span className="font-semibold text-charcoal">{item.name}</span>
                  </div>
                  <span className="font-bold text-charcoal">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {order.specialInstructions && (
              <div className="mt-3 p-3 bg-amber-50/60 border border-amber-200/60 rounded-lg text-xs text-charcoal">
                <span className="font-bold text-amber-900">Note: </span>
                {order.specialInstructions}
              </div>
            )}
          </div>

          {/* Total */}
          <div className="pt-4 border-t border-cream space-y-2 text-xs">
            <div className="flex justify-between text-warm-gray">
              <span>Subtotal</span>
              <span className="font-semibold text-charcoal">₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-warm-gray">
              <span>GST (5%)</span>
              <span className="font-semibold text-charcoal">₹{order.tax}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-warm-gray">
                <span>Delivery Fee</span>
                <span className="font-semibold text-charcoal">₹{order.deliveryFee}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-charcoal pt-2 border-t border-cream">
              <span>This Order Total</span>
              <span className="font-heading text-xl text-gold-dark">
                ₹{order.totalAmount}
              </span>
            </div>
            <p className="text-[11px] text-warm-gray pt-1">
              * Phase 1: To be settled in person (at table / pickup counter / upon delivery).
            </p>
          </div>

          {/* Support Actions */}
          <div className="pt-4 border-t border-cream flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="tel:+912692261215"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-cream text-charcoal font-semibold text-xs hover:bg-cream transition-colors"
              >
                <PhoneIcon className="w-4 h-4 text-gold" />
                Call (+91 26922 61215)
              </a>

              <button
                type="button"
                onClick={handleLoadRunningBill}
                disabled={loadingBill}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gold/50 bg-gold/10 text-charcoal font-semibold text-xs hover:bg-gold/20 transition-colors"
              >
                <DocumentTextIcon className="w-4 h-4 text-gold-dark" />
                <span>{loadingBill ? "Loading..." : "View Running / Final Bill"}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadOrder}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-warm-gray hover:text-charcoal"
              >
                <ArrowPathIcon className="w-3.5 h-3.5" />
                Refresh
              </button>
              <Link
                href="/restaurant/menu"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gold hover:bg-gold-light text-charcoal text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-sm"
              >
                <ShoppingBagIcon className="w-4 h-4" />
                Order More Items
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bill & Receipt Modal */}
      {isReceiptModalOpen && runningBillData && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-cream mb-4 no-print">
              <h3 className="font-heading text-xl font-bold text-charcoal flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-gold" />
                <span>{order.orderType === "dine-in" ? "Combined Table Running Bill" : "Order Receipt"}</span>
              </h3>
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="p-1 text-warm-gray hover:text-charcoal rounded-lg hover:bg-cream"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <RestaurantReceipt bill={runningBillData} />

            <div className="mt-4 pt-3 border-t border-cream flex justify-end no-print">
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="px-5 py-2 bg-cream text-charcoal hover:bg-cream-dark font-semibold text-xs rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
