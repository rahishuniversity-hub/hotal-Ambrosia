"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { adminStore } from "@/lib/store";
import type { MenuItem, DiningSession, RunningBill, RestaurantOrder } from "@/lib/types";
import RestaurantReceipt from "@/components/restaurant/RestaurantReceipt";
import DeliveryLocationPicker from "@/components/restaurant/DeliveryLocationPicker";
import {
  ShoppingBagIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  MapPinIcon,
  ClockIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ReceiptPercentIcon,
  LockClosedIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { MENU_CATEGORIES, AMBROSIA_MENU_ITEMS } from "@/lib/menuData";

const CATEGORIES = MENU_CATEGORIES;

const TABLES = Array.from({ length: 20 }, (_, i) => `Table ${i + 1}`);

export default function RestaurantMenuPage() {
  const router = useRouter();
  const {
    items,
    orderType,
    orderDetails,
    specialInstructions,
    isCartOpen,
    activeSession,
    setActiveSession,
    clearActiveSession,
    addItem,
    updateQuantity,
    clearCart,
    setOrderType,
    updateOrderDetails,
    setSpecialInstructions,
    setIsCartOpen,
    itemCount,
    subtotal,
    tax,
    deliveryFee,
    totalAmount,
  } = useCart();

  const [menuItems, setMenuItems] = useState<MenuItem[]>(AMBROSIA_MENU_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [orderTypeModalOpen, setOrderTypeModalOpen] = useState<boolean>(false);

  // Dining Sessions & Running Bill states
  const [activeSessions, setActiveSessions] = useState<DiningSession[]>([]);
  const [runningBillModalOpen, setRunningBillModalOpen] = useState(false);
  const [runningBillData, setRunningBillData] = useState<RunningBill | null>(null);
  const [isLoadingBill, setIsLoadingBill] = useState(false);

  // Customer order history states
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyPhoneInput, setHistoryPhoneInput] = useState("");
  const [customerOrdersHistory, setCustomerOrdersHistory] = useState<RestaurantOrder[]>([]);
  const [isSearchingHistory, setIsSearchingHistory] = useState(false);
  const [historySearched, setHistorySearched] = useState(false);
  const [selectedHistoryBill, setSelectedHistoryBill] = useState<RunningBill | null>(null);

  // Customer details form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [deliveryAddressInput, setDeliveryAddressInput] = useState(orderDetails.deliveryAddress || "");
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Delivery location validation check
  const isDeliveryLocationValid =
    orderType !== "delivery" ||
    (Boolean(deliveryAddressInput.trim()) &&
      orderDetails.deliveryDistanceKm > 0 &&
      orderDetails.deliveryDistanceKm <= 10 &&
      orderDetails.isDeliveryEligible === true);

  // Sync deliveryAddressInput if orderDetails.deliveryAddress is reset
  useEffect(() => {
    if (!orderDetails.deliveryAddress && deliveryAddressInput) {
      setDeliveryAddressInput("");
    }
  }, [orderDetails.deliveryAddress, deliveryAddressInput]);


  // Load menu items and active dining sessions
  useEffect(() => {
    async function fetchMenu() {
      const data = await adminStore.getMenuItems();
      if (data && data.length > 0) {
        setMenuItems(data);
      }
    }
    fetchMenu();

    async function loadSessions() {
      const sessions = await adminStore.getActiveDiningSessions();
      setActiveSessions(sessions);
    }
    loadSessions();

    const unsubSessions = adminStore.subscribeToDiningSessions(() => {
      loadSessions();
    });

    return () => unsubSessions();
  }, []);

  // Sync active session details into customer input fields
  useEffect(() => {
    if (activeSession) {
      if (activeSession.status === "closed") {
        clearActiveSession();
      } else {
        setCustomerName(activeSession.customerName || "");
        setCustomerPhone(activeSession.customerPhone || "");
        setCustomerEmail(activeSession.customerEmail || "");
        if (activeSession.tableNumber) {
          updateOrderDetails({ tableNumber: activeSession.tableNumber });
        }
      }
    }
  }, [activeSession]);

  // Filter menu items
  const filteredItems = menuItems.filter((item) => {
    const matchesCat =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });



  // Open Running Bill for current active session
  const handleOpenRunningBill = async () => {
    if (!activeSession) return;
    setIsLoadingBill(true);
    try {
      const bill = await adminStore.getRunningBill(activeSession.id);
      if (bill) {
        setRunningBillData(bill);
        setRunningBillModalOpen(true);
      }
    } catch (err) {
      console.error("Failed to load running bill:", err);
    } finally {
      setIsLoadingBill(false);
    }
  };

  // Search Customer History
  const handleSearchCustomerHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = historyPhoneInput.replace(/\D/g, "");
    if (!cleaned || cleaned.length < 10) return;
    setIsSearchingHistory(true);
    setHistorySearched(true);
    try {
      const allOrders = await adminStore.getRestaurantOrders();
      const matched = allOrders.filter(
        (o) => o.customerPhone.replace(/\D/g, "") === cleaned
      );
      setCustomerOrdersHistory(matched);
    } catch (err) {
      console.error("Failed to load customer orders:", err);
    } finally {
      setIsSearchingHistory(false);
    }
  };

  // View specific bill from history
  const handleViewHistoricalBill = async (order: RestaurantOrder) => {
    if (order.sessionId) {
      const bill = await adminStore.getRunningBill(order.sessionId);
      if (bill) {
        setSelectedHistoryBill(bill);
        return;
      }
    }
    // Fallback single order bill
    setSelectedHistoryBill({
      session: {
        id: order.id,
        sessionNumber: order.orderNumber,
        tableNumber: order.tableNumber || "Direct Order",
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail,
        status: "closed",
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
        orders: [{ orderNumber: order.orderNumber, quantity: it.quantity, time: order.createdAt }],
      })),
      subtotal: order.subtotal,
      tax: order.tax,
      totalAmount: order.totalAmount,
      billNumber: `AMB-${order.orderNumber}`,
      billDate: order.createdAt,
    });
  };

  // Validate and submit order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!customerName.trim()) {
      errors.name = "Please enter your name";
    }

    const cleanedPhone = customerPhone.replace(/\D/g, "");
    if (!cleanedPhone || cleanedPhone.length < 10) {
      errors.phone = "Please enter a valid 10-digit mobile number";
    }

    if (orderType === "delivery") {
      if (!deliveryAddressInput.trim()) {
        errors.address = "Please enter your delivery address";
      }
      if (!orderDetails.isDeliveryEligible) {
        errors.delivery =
          orderDetails.deliveryCheckMessage ||
          "Delivery is only available within 10 km radius of Hotel Ambrosia.";
      }
    }

    if (items.length === 0) {
      errors.cart = "Your cart is empty. Please add items to proceed.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    try {
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `AMB-${randomDigits}`;

      const createdOrder = await adminStore.createRestaurantOrder({
        orderNumber,
        sessionId: orderType === "dine-in" && activeSession ? activeSession.id : undefined,
        orderType,
        status: "new",
        customerName: customerName.trim(),
        customerPhone: cleanedPhone,
        customerEmail: customerEmail.trim(),
        tableNumber: orderType === "dine-in" ? orderDetails.tableNumber : undefined,
        pickupTime: orderType === "takeaway" ? orderDetails.pickupTime : undefined,
        deliveryAddress: orderType === "delivery" ? deliveryAddressInput.trim() : undefined,
        deliveryDistanceKm: orderType === "delivery" ? orderDetails.deliveryDistanceKm : undefined,
        items,
        subtotal,
        tax,
        deliveryFee,
        totalAmount,
        specialInstructions: specialInstructions.trim(),
      });

      if (createdOrder) {
        if (orderType === "dine-in") {
          let sess: DiningSession | null = null;
          if (createdOrder.sessionId) {
            sess = await adminStore.getDiningSessionById(createdOrder.sessionId);
          } else if (orderDetails.tableNumber) {
            sess = await adminStore.getActiveSessionByTable(orderDetails.tableNumber);
          }
          if (sess) {
            setActiveSession(sess);
          }
        }
        // ── CUSTOMER DATA RESET FOR NEXT CUSTOMER ──
        setCustomerName("");
        setCustomerPhone("");
        setCustomerEmail("");
        setDeliveryAddressInput("");
        setFormErrors({});

        clearCart();
        setIsCartOpen(false);
        router.push(`/restaurant/order/${createdOrder.id}`);
      } else {
        setFormErrors({ submit: "Failed to place order. Please try again." });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setFormErrors({ submit: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream/40 pt-20 pb-28">
      {/* Header Banner */}
      <section className="relative py-12 bg-charcoal text-white overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <Image
            src="/images/restaurant/REASTURANT-191-1-1024x670.jpg"
            alt="Ambrosia Restaurant"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gold text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] mb-2">
            Hotel Ambrosia Fine Dining
          </p>
          <h1 className="font-heading text-3xl sm:text-5xl font-bold text-white mb-3">
            Digital Restaurant Menu
          </h1>
          <p className="text-warm-gray-light max-w-2xl mx-auto text-sm sm:text-base">
            Select your dining preference, explore multi-cuisine specialties, and place your order directly.
          </p>

          {/* Phase 1 Notice Badge */}
          <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/15 border border-gold/40 text-gold text-xs font-medium">
            <span>✨ Phase 1 Ordering System — Instant Kitchen Order Routing</span>
          </div>
        </div>
      </section>

      {/* Order Type Selector Bar */}
      <section className="sticky top-20 z-30 bg-white/95 backdrop-blur-md border-b border-cream shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Order Type Tabs */}
            <div className="flex items-center gap-1 bg-cream/70 p-1 rounded-xl w-full sm:w-auto justify-center">
              <button
                onClick={() => {
                  setOrderType("dine-in");
                  setOrderTypeModalOpen(true);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  orderType === "dine-in"
                    ? "bg-gold text-charcoal shadow-sm"
                    : "text-charcoal/80 hover:text-charcoal hover:bg-white/50"
                }`}
              >
                <BuildingStorefrontIcon className="w-4 h-4" />
                Dine-In
              </button>
              <button
                onClick={() => {
                  setOrderType("takeaway");
                  setOrderTypeModalOpen(true);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  orderType === "takeaway"
                    ? "bg-gold text-charcoal shadow-sm"
                    : "text-charcoal/80 hover:text-charcoal hover:bg-white/50"
                }`}
              >
                <ClockIcon className="w-4 h-4" />
                Takeaway
              </button>
              <button
                onClick={() => {
                  setOrderType("delivery");
                  setOrderTypeModalOpen(true);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  orderType === "delivery"
                    ? "bg-gold text-charcoal shadow-sm"
                    : "text-charcoal/80 hover:text-charcoal hover:bg-white/50"
                }`}
              >
                <MapPinIcon className="w-4 h-4" />
                Delivery (≤10 km)
              </button>
            </div>

            {/* Current Active Details Pill & History button */}
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setHistoryModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream hover:bg-cream-dark text-charcoal border border-cream font-semibold text-xs transition-colors"
                title="Find previous bills and orders"
              >
                <DocumentTextIcon className="w-3.5 h-3.5 text-gold-dark" />
                <span>Find My Bills</span>
              </button>

              <span className="text-warm-gray">Preference:</span>
              <button
                onClick={() => setOrderTypeModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-charcoal text-white font-medium hover:bg-charcoal/90 transition-colors"
              >
                {orderType === "dine-in" && (
                  <>
                    <span>🍽️ {orderDetails.tableNumber}</span>
                    <span className="text-gold underline ml-1">Edit</span>
                  </>
                )}
                {orderType === "takeaway" && (
                  <>
                    <span>🛍️ Pickup: {orderDetails.pickupTime}</span>
                    <span className="text-gold underline ml-1">Edit</span>
                  </>
                )}
                {orderType === "delivery" && (
                  <>
                    <span>🛵 {orderDetails.isDeliveryEligible ? `Eligible (~${orderDetails.deliveryDistanceKm} km)` : "Check Address"}</span>
                    <span className="text-gold underline ml-1">Configure</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Active Dining Session Banner for Dine-In */}
          {activeSession && orderType === "dine-in" && (
            <div className="mt-3 p-3 bg-gradient-to-r from-amber-500/10 via-gold/15 to-amber-500/10 border border-gold/40 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-charcoal">
                  Active Dining Session: <span className="text-gold-dark">{activeSession.tableNumber}</span> • {activeSession.customerName}
                </span>
                <span className="text-[11px] text-warm-gray hidden md:inline">
                  (Round {(activeSession.orderIds?.length || 0) + 1} • Auto-added to running bill)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenRunningBill}
                  disabled={isLoadingBill}
                  className="px-3 py-1.5 bg-charcoal hover:bg-charcoal-lighter text-gold font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <DocumentTextIcon className="w-3.5 h-3.5" />
                  <span>{isLoadingBill ? "Loading Bill..." : "View Running Bill"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Delivery Alert Banner if selected */}
          {orderType === "delivery" && (
            <div className="mt-2 text-xs">
              {orderDetails.deliveryDistanceKm > 0 ? (
                orderDetails.isDeliveryEligible ? (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                    <span>{orderDetails.deliveryCheckMessage}</span>
                  </div>
                ) : (
                  <div className="p-2 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-start gap-2">
                    <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-semibold">{orderDetails.deliveryCheckMessage}</p>
                      <button
                        onClick={() => {
                          setOrderType("takeaway");
                          setOrderTypeModalOpen(false);
                        }}
                        className="mt-1 text-xs text-red-700 underline font-bold"
                      >
                        Switch to Takeaway (Pickup) instead →
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="p-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg flex items-center justify-between">
                  <span>Please confirm your delivery address or landmark to verify distance (≤ 10 KM).</span>
                  <button
                    onClick={() => setOrderTypeModalOpen(true)}
                    className="text-amber-900 font-bold underline ml-2"
                  >
                    Set Location Now
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Category Filter */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-gold text-charcoal shadow-sm"
                    : "bg-white text-charcoal/70 border border-cream hover:bg-cream"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative min-w-[240px]">
            <MagnifyingGlassIcon className="w-4 h-4 text-warm-gray absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-cream rounded-full text-sm focus:outline-none focus:border-gold"
            />
          </div>
        </div>

        {/* Food Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-cream shadow-sm p-8">
            <p className="text-warm-gray text-lg mb-2">No menu items found.</p>
            <p className="text-xs text-warm-gray">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const inCart = items.find((i) => i.menuItemId === item.id);
              const qty = inCart ? inCart.quantity : 0;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-cream p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Header with Vegetarian indicator & Category Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-charcoal bg-cream/70 border border-cream">
                        <span className="w-2 h-2 rounded-full bg-green-600 inline-block" />
                        {item.category}
                      </span>
                      {!item.available && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700">
                          Sold Out
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className="font-heading text-lg font-bold text-charcoal mb-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-warm-gray leading-relaxed mb-3">
                        {item.description || "Prepared fresh by Hotel Ambrosia chef."}
                      </p>
                    </div>
                  </div>

                  {/* Pricing & Add to Cart Controls */}
                  <div className="pt-3 flex items-center justify-between border-t border-cream/50 mt-2">
                    <div>
                      <span className="text-[11px] text-warm-gray block">Price</span>
                      <p className="font-heading text-xl font-bold text-charcoal">
                        ₹{item.price}
                      </p>
                    </div>

                    {item.available ? (
                      qty > 0 ? (
                        <div className="flex items-center gap-2 bg-charcoal text-white rounded-lg px-2 py-1 shadow-sm">
                          <button
                            onClick={() => updateQuantity(item.id, qty - 1)}
                            className="p-1 hover:text-gold transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <MinusIcon className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm font-bold w-4 text-center">
                            {qty}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, qty + 1)}
                            className="p-1 hover:text-gold transition-colors"
                            aria-label="Increase quantity"
                          >
                            <PlusIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addItem(item, 1)}
                          className="px-4 py-2 bg-gold hover:bg-gold-light text-charcoal text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-sm"
                        >
                          + Add
                        </button>
                      )
                    ) : (
                      <span className="text-xs text-warm-gray italic">Unavailable</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar */}
      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-white/95 backdrop-blur-md border-t border-cream shadow-2xl">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gold text-charcoal flex items-center justify-center font-bold text-sm shadow-md">
                {itemCount}
              </div>
              <div>
                <p className="text-xs text-warm-gray uppercase tracking-wider font-semibold">
                  Total ({orderType})
                </p>
                <p className="font-heading text-xl font-bold text-charcoal">
                  ₹{totalAmount}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-charcoal hover:bg-charcoal-lighter text-gold font-bold text-sm rounded-xl uppercase tracking-wider shadow-lg transition-all"
            >
              <ShoppingBagIcon className="w-5 h-5" />
              <span>View Cart & Checkout</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ORDER TYPE CONFIGURATION MODAL (Dine-in / Takeaway / Delivery)
          ───────────────────────────────────────────────────────────── */}
      {orderTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl relative border border-cream max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setOrderTypeModalOpen(false)}
              className="absolute top-4 right-4 text-warm-gray hover:text-charcoal p-1"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <h2 className="font-heading text-2xl font-bold text-charcoal mb-1">
              Choose Order Type
            </h2>
            <p className="text-xs text-warm-gray mb-6">
              Select how you would like to receive your meal from Hotel Ambrosia.
            </p>

            {/* Type selector tabs */}
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-cream rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setOrderType("dine-in")}
                className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                  orderType === "dine-in"
                    ? "bg-gold text-charcoal shadow-sm"
                    : "text-charcoal/70 hover:text-charcoal"
                }`}
              >
                🍽️ Dine-In
              </button>
              <button
                type="button"
                onClick={() => setOrderType("takeaway")}
                className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                  orderType === "takeaway"
                    ? "bg-gold text-charcoal shadow-sm"
                    : "text-charcoal/70 hover:text-charcoal"
                }`}
              >
                🛍️ Takeaway
              </button>
              <button
                type="button"
                onClick={() => setOrderType("delivery")}
                className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                  orderType === "delivery"
                    ? "bg-gold text-charcoal shadow-sm"
                    : "text-charcoal/70 hover:text-charcoal"
                }`}
              >
                🛵 Delivery
              </button>
            </div>

            {/* Sub-form 1: DINE-IN */}
            {orderType === "dine-in" && (
              <div className="space-y-4">
                {activeSession ? (
                  <div className="p-4 bg-cream/70 border border-gold/40 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-charcoal flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active Seated Dining Session
                      </span>
                      <span className="text-[11px] font-extrabold text-gold-dark bg-gold/20 px-2 py-0.5 rounded-full">
                        {activeSession.tableNumber}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal font-medium">
                      Guest: <span className="font-bold">{activeSession.customerName}</span> ({activeSession.customerPhone})
                    </p>
                    <p className="text-[11px] text-warm-gray">
                      Orders placed will be appended to your table&apos;s running bill.
                    </p>
                    <div className="pt-2 flex items-center gap-2 border-t border-cream">
                      <button
                        type="button"
                        onClick={() => {
                          clearActiveSession();
                        }}
                        className="text-xs text-red-600 hover:text-red-700 font-semibold underline"
                      >
                        Change Table / Start Fresh Session
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-charcoal">
                        Choose Available Table
                      </label>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Available
                        </span>
                        <span className="inline-flex items-center gap-1 text-amber-700">
                          <span className="w-2 h-2 rounded-full bg-amber-500" /> Occupied
                        </span>
                      </div>
                    </div>

                    {/* Visual Table Grid */}
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-56 overflow-y-auto p-1 border border-cream rounded-xl bg-cream/20">
                      {TABLES.map((t) => {
                        const occupied = activeSessions.find(
                          (s) => s.tableNumber.toLowerCase() === t.toLowerCase()
                        );
                        const isSelected = orderDetails.tableNumber === t;

                        return (
                          <button
                            key={t}
                            type="button"
                            disabled={!!occupied}
                            onClick={() => updateOrderDetails({ tableNumber: t })}
                            className={`p-2 rounded-xl text-center flex flex-col items-center justify-center transition-all ${
                              occupied
                                ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-75"
                                : isSelected
                                ? "bg-charcoal text-gold border-2 border-gold shadow-sm"
                                : "bg-white text-charcoal border border-cream hover:border-gold hover:bg-cream/40"
                            }`}
                          >
                            <span className="text-xs font-bold">{t}</span>
                            {occupied ? (
                              <span className="text-[9px] text-amber-700 font-semibold flex items-center gap-0.5 mt-0.5">
                                <LockClosedIcon className="w-2.5 h-2.5 inline" /> Busy
                              </span>
                            ) : (
                              <span className="text-[9px] text-emerald-600 font-medium mt-0.5">
                                Free
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                    Estimated Guests
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={orderDetails.guestCount}
                    onChange={(e) => updateOrderDetails({ guestCount: Number(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-white border border-cream rounded-lg text-sm focus:outline-none focus:border-gold"
                  />
                </div>
              </div>
            )}

            {/* Sub-form 2: TAKEAWAY */}
            {orderType === "takeaway" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                    Pickup Schedule
                  </label>
                  <select
                    value={orderDetails.pickupTime}
                    onChange={(e) => updateOrderDetails({ pickupTime: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-cream rounded-lg text-sm focus:outline-none focus:border-gold"
                  >
                    <option value="ASAP (~25–30 mins)">ASAP (Ready in ~25–30 mins)</option>
                    <option value="Within 45 mins">Within 45 mins</option>
                    <option value="Within 1 hour">Within 1 hour</option>
                    <option value="Lunch Service (1:00 PM)">Lunch Service (1:00 PM)</option>
                    <option value="Dinner Service (7:30 PM)">Dinner Service (7:30 PM)</option>
                    <option value="Dinner Service (8:30 PM)">Dinner Service (8:30 PM)</option>
                  </select>
                </div>
                <p className="text-xs text-warm-gray bg-cream/50 p-3 rounded-lg">
                  Pickup Location: Hotel Ambrosia Restaurant Counter, Borsad Char Rasta, Anand.
                </p>
              </div>
            )}

            {/* Sub-form 3: DELIVERY (≤ 10 KM CHECK & ADDRESS SEARCH) */}
            {orderType === "delivery" && (
              <DeliveryLocationPicker
                initialAddress={deliveryAddressInput}
                initialDistanceKm={orderDetails.deliveryDistanceKm}
                isDeliveryEligible={orderDetails.isDeliveryEligible}
                deliveryCheckMessage={orderDetails.deliveryCheckMessage}
                onLocationApproved={(data) => {
                  setDeliveryAddressInput(data.address);
                  updateOrderDetails({
                    deliveryAddress: data.address,
                    deliveryDistanceKm: data.distanceKm,
                  });
                }}
                onLocationRejected={(data) => {
                  setDeliveryAddressInput(data.address);
                  updateOrderDetails({
                    deliveryAddress: data.address,
                    deliveryDistanceKm: data.distanceKm,
                  });
                }}
                onAddressChange={(addr) => {
                  setDeliveryAddressInput(addr);
                  updateOrderDetails({
                    deliveryAddress: addr,
                  });
                }}
                onSwitchToTakeaway={() => {
                  setOrderType("takeaway");
                  setOrderTypeModalOpen(false);
                }}
              />
            )}

            <div className="mt-6 pt-4 border-t border-cream flex flex-col sm:flex-row items-center justify-between gap-3">
              {orderType === "delivery" && !isDeliveryLocationValid && (
                <div className="w-full sm:w-auto flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                  <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0 text-red-500" />
                  <span>
                    {!deliveryAddressInput.trim()
                      ? "Please search and select a delivery address to continue."
                      : orderDetails.deliveryDistanceKm === 0
                      ? "Please select a location from search or verify your address."
                      : `Delivery unavailable (~${orderDetails.deliveryDistanceKm} km exceeds our 10 km limit).`}
                  </span>
                </div>
              )}
              <div className="flex justify-end gap-2 ml-auto w-full sm:w-auto">
                <button
                  type="button"
                  disabled={orderType === "delivery" && !isDeliveryLocationValid}
                  onClick={() => {
                    if (orderType === "delivery" && !isDeliveryLocationValid) return;
                    setOrderTypeModalOpen(false);
                  }}
                  className={`w-full sm:w-auto px-5 py-2.5 font-bold text-xs uppercase tracking-wider rounded-lg transition-all ${
                    orderType === "delivery" && !isDeliveryLocationValid
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300 shadow-none"
                      : "bg-gold hover:bg-gold-light text-charcoal shadow-sm cursor-pointer"
                  }`}
                >
                  Confirm & Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          CART & CHECKOUT SLIDE-OUT DRAWER
          ───────────────────────────────────────────────────────────── */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
              {/* Drawer Header */}
              <div className="p-5 border-b border-cream flex items-center justify-between bg-cream/40">
                <div className="flex items-center gap-2">
                  <ShoppingBagIcon className="w-6 h-6 text-gold" />
                  <h2 className="font-heading text-xl font-bold text-charcoal">
                    Your Order
                  </h2>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 text-warm-gray hover:text-charcoal transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Drawer Scrollable Body */}
              <div className="p-5 overflow-y-auto flex-1 space-y-6">
                {/* Order Type Banner */}
                <div className="p-3 bg-cream/60 rounded-xl border border-cream flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-warm-gray block">
                      Order Mode
                    </span>
                    <span className="text-xs font-bold text-charcoal uppercase">
                      {orderType === "dine-in" && `🍽️ Dine-in: ${orderDetails.tableNumber}`}
                      {orderType === "takeaway" && `🛍️ Takeaway: ${orderDetails.pickupTime}`}
                      {orderType === "delivery" && `🛵 Delivery (${orderDetails.deliveryDistanceKm} km)`}
                    </span>
                  </div>
                  <button
                    onClick={() => setOrderTypeModalOpen(true)}
                    className="text-xs font-bold text-gold hover:underline"
                  >
                    Change
                  </button>
                </div>

                {/* Delivery check warning if delivery not eligible */}
                {orderType === "delivery" && !orderDetails.isDeliveryEligible && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-start gap-2">
                    <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-bold">Delivery address verification required</p>
                      <p className="mt-0.5">{orderDetails.deliveryCheckMessage}</p>
                      <button
                        onClick={() => setOrderTypeModalOpen(true)}
                        className="mt-1 text-red-700 font-bold underline"
                      >
                        Click here to verify address / distance (≤ 10 KM)
                      </button>
                    </div>
                  </div>
                )}

                {/* Items List */}
                {items.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-warm-gray text-sm mb-3">Your cart is empty.</p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="px-4 py-2 bg-gold text-charcoal font-semibold text-xs rounded-lg uppercase"
                    >
                      Browse Menu
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-warm-gray">
                        Selected Items ({itemCount})
                      </span>
                      <button
                        onClick={clearCart}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Clear All
                      </button>
                    </div>

                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-cream/30 rounded-xl border border-cream"
                      >
                        <div className="flex-1 pr-3">
                          <p className="font-semibold text-charcoal text-sm line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-xs text-warm-gray">₹{item.price} each</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 bg-white border border-cream rounded-lg px-2 py-1">
                            <button
                              onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                              className="text-charcoal hover:text-gold"
                            >
                              <MinusIcon className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                              className="text-charcoal hover:text-gold"
                            >
                              <PlusIcon className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="font-bold text-sm text-charcoal min-w-[50px] text-right">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Special Instructions */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                    Special Cooking Instructions
                  </label>
                  <input
                    type="text"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="e.g. Less spicy, extra onions, no coriander..."
                    className="w-full px-3 py-2 bg-cream/20 border border-cream rounded-lg text-xs focus:outline-none focus:border-gold"
                  />
                </div>

                {/* Customer Details Form */}
                <div className="pt-2 border-t border-cream space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal">
                    Customer Details
                  </h3>

                  {orderType === "dine-in" && activeSession ? (
                    <div className="p-3.5 bg-cream/70 rounded-xl border border-gold/40 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Active Dining Session
                        </span>
                        <span className="text-[10px] font-extrabold text-gold-dark bg-gold/20 px-2 py-0.5 rounded-full">
                          Round {(activeSession.orderIds?.length || 0) + 1}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-charcoal">
                        {activeSession.customerName} • {activeSession.tableNumber}
                      </div>
                      <div className="text-[11px] text-warm-gray font-mono">
                        +91 {activeSession.customerPhone}
                      </div>
                      <p className="text-[10px] text-emerald-700 font-semibold pt-1 border-t border-cream">
                        ✓ Repeat order linked to your running bill. No need to re-enter details.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-[11px] font-semibold text-warm-gray mb-1">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="e.g. Rajesh Patel"
                          className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none ${
                            formErrors.name ? "border-red-500" : "border-cream focus:border-gold"
                          }`}
                        />
                        {formErrors.name && (
                          <p className="text-[11px] text-red-500 mt-0.5">{formErrors.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-warm-gray mb-1">
                          Mobile Number (10 digits) *
                        </label>
                        <div className="flex items-center">
                          <span className="px-2.5 py-2 bg-cream border border-r-0 border-cream rounded-l-lg text-xs text-charcoal font-semibold">
                            +91
                          </span>
                          <input
                            type="tel"
                            maxLength={10}
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="98765 43210"
                            className={`w-full px-3 py-2 border rounded-r-lg text-xs focus:outline-none ${
                              formErrors.phone ? "border-red-500" : "border-cream focus:border-gold"
                            }`}
                          />
                        </div>
                        {formErrors.phone && (
                          <p className="text-[11px] text-red-500 mt-0.5">{formErrors.phone}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-warm-gray mb-1">
                          Email Address (Optional)
                        </label>
                        <input
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="rajesh@example.com"
                          className="w-full px-3 py-2 border border-cream rounded-lg text-xs focus:outline-none focus:border-gold"
                        />
                      </div>
                    </>
                  )}

                  {orderType === "delivery" && (
                    <div>
                      <label className="block text-[11px] font-semibold text-warm-gray mb-1">
                        Delivery Address *
                      </label>
                      <textarea
                        rows={2}
                        value={deliveryAddressInput}
                        onChange={(e) => setDeliveryAddressInput(e.target.value)}
                        placeholder="House no, Street, Landmark, Area"
                        className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none ${
                          formErrors.address ? "border-red-500" : "border-cream focus:border-gold"
                        }`}
                      />
                      {formErrors.address && (
                        <p className="text-[11px] text-red-500 mt-0.5">{formErrors.address}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Bill Summary */}
                <div className="pt-2 border-t border-cream space-y-2 text-xs">
                  <div className="flex justify-between text-warm-gray">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-charcoal">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-warm-gray">
                    <span>GST (5%)</span>
                    <span className="font-semibold text-charcoal">₹{tax}</span>
                  </div>
                  {orderType === "delivery" && (
                    <div className="flex justify-between text-warm-gray">
                      <span>Delivery Fee</span>
                      <span className="font-semibold text-charcoal">
                        {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-charcoal pt-2 border-t border-cream">
                    <span>Grand Total</span>
                    <span className="font-heading text-lg text-gold-dark">₹{totalAmount}</span>
                  </div>
                </div>

                {/* Phase 1 Zero-Payment Notice */}
                <div className="p-3 bg-gold/10 border border-gold/30 rounded-xl text-[11px] text-charcoal leading-relaxed">
                  <p className="font-bold text-charcoal mb-0.5">
                    💳 Phase 1 Payment Policy:
                  </p>
                  <p className="text-warm-gray">
                    No online payment required now. Pay directly at your table, at the pickup counter, or upon delivery.
                  </p>
                </div>

                {formErrors.submit && (
                  <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                    {formErrors.submit}
                  </p>
                )}
              </div>

              {/* Drawer Footer CTA */}
              <div className="p-5 border-t border-cream bg-white">
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={
                    isSubmitting ||
                    items.length === 0 ||
                    (orderType === "delivery" && !orderDetails.isDeliveryEligible)
                  }
                  className="w-full py-3.5 bg-gold hover:bg-gold-light text-charcoal font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Place Order • ₹{totalAmount}</span>
                      <ArrowRightIcon className="w-4 h-4" />
                    </>
                  )}
                </button>
                {orderType === "delivery" && !orderDetails.isDeliveryEligible && (
                  <p className="text-[11px] text-center text-red-600 mt-2 font-medium">
                    Delivery address outside 10 km zone. Please verify address or choose Takeaway.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          RUNNING BILL MODAL (Customer View)
          ───────────────────────────────────────────────────────────── */}
      {runningBillModalOpen && runningBillData && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-cream mb-4 no-print">
              <h3 className="font-heading text-xl font-bold text-charcoal flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-gold" />
                <span>Your Active Running Bill</span>
              </h3>
              <button
                onClick={() => setRunningBillModalOpen(false)}
                className="p-1 text-warm-gray hover:text-charcoal rounded-lg hover:bg-cream"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <RestaurantReceipt bill={runningBillData} />

            <div className="mt-4 pt-3 border-t border-cream flex justify-end no-print">
              <button
                onClick={() => setRunningBillModalOpen(false)}
                className="px-5 py-2 bg-cream text-charcoal hover:bg-cream-dark font-semibold text-xs rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          CUSTOMER ORDER & BILL HISTORY LOOKUP MODAL
          ───────────────────────────────────────────────────────────── */}
      {historyModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-cream mb-4">
              <div>
                <h3 className="font-heading text-xl font-bold text-charcoal">
                  Find My Bills & Orders
                </h3>
                <p className="text-xs text-warm-gray mt-0.5">
                  Enter your 10-digit mobile number to access your active and previous bills.
                </p>
              </div>
              <button
                onClick={() => {
                  setHistoryModalOpen(false);
                  setSelectedHistoryBill(null);
                }}
                className="p-1 text-warm-gray hover:text-charcoal rounded-lg hover:bg-cream"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {selectedHistoryBill ? (
              <div className="space-y-4">
                <button
                  onClick={() => setSelectedHistoryBill(null)}
                  className="text-xs text-gold-dark font-bold hover:underline mb-2 inline-flex items-center gap-1"
                >
                  ← Back to Order List
                </button>
                <RestaurantReceipt bill={selectedHistoryBill} />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Search Input Form */}
                <form onSubmit={handleSearchCustomerHistory} className="flex gap-2">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-warm-gray">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={historyPhoneInput}
                      onChange={(e) => setHistoryPhoneInput(e.target.value)}
                      placeholder="Enter 10-digit mobile number"
                      className="w-full pl-12 pr-4 py-2.5 bg-cream/30 border border-cream rounded-xl text-sm focus:outline-none focus:border-gold font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSearchingHistory || historyPhoneInput.replace(/\D/g, "").length < 10}
                    className="px-5 py-2.5 bg-gold hover:bg-gold-light text-charcoal font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isSearchingHistory ? "Searching..." : "Search"}
                  </button>
                </form>

                {/* Search Results */}
                {historySearched && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-warm-gray">
                        Found {customerOrdersHistory.length} Order{customerOrdersHistory.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    {customerOrdersHistory.length === 0 ? (
                      <div className="text-center py-8 bg-cream/20 rounded-xl border border-cream p-4">
                        <p className="text-xs text-warm-gray">
                          No orders found under this phone number.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-cream/60 border border-cream rounded-xl overflow-hidden">
                        {customerOrdersHistory.map((ord) => (
                          <div
                            key={ord.id}
                            className="p-3.5 bg-white hover:bg-cream/20 flex items-center justify-between transition-colors text-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-charcoal">
                                  #{ord.orderNumber}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cream text-charcoal">
                                  {ord.orderType}
                                </span>
                                <span className="text-[11px] text-warm-gray">
                                  {new Date(ord.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-warm-gray text-[11px]">
                                {ord.items.length} items • ₹{ord.totalAmount}
                                {ord.tableNumber && ` • ${ord.tableNumber}`}
                              </p>
                            </div>

                            <button
                              onClick={() => handleViewHistoricalBill(ord)}
                              className="px-3 py-1.5 bg-charcoal text-gold font-bold text-xs rounded-lg hover:bg-charcoal/90 transition-colors"
                            >
                              View Bill
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
