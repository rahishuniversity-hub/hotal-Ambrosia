"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { MenuItem, OrderType, OrderItem, DiningSession } from "@/lib/types";
import { evaluateDeliveryDistance } from "@/lib/delivery";

export interface OrderTypeDetails {
  tableNumber: string;
  guestCount: number;
  pickupTime: string;
  deliveryAddress: string;
  deliveryDistanceKm: number;
  isDeliveryEligible: boolean;
  deliveryCheckMessage: string;
}

interface CartContextType {
  items: OrderItem[];
  orderType: OrderType;
  orderDetails: OrderTypeDetails;
  specialInstructions: string;
  isCartOpen: boolean;
  isOrderTypeModalOpen: boolean;
  activeSession: DiningSession | null;
  setActiveSession: (session: DiningSession | null) => void;
  clearActiveSession: () => void;
  addItem: (menuItem: MenuItem, quantity?: number) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  setOrderType: (type: OrderType) => void;
  updateOrderDetails: (details: Partial<OrderTypeDetails>) => void;
  setSpecialInstructions: (notes: string) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsOrderTypeModalOpen: (open: boolean) => void;
  itemCount: number;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  totalAmount: number;
}

const defaultOrderDetails: OrderTypeDetails = {
  tableNumber: "Table 1",
  guestCount: 2,
  pickupTime: "ASAP (~25–30 mins)",
  deliveryAddress: "",
  deliveryDistanceKm: 0,
  isDeliveryEligible: false,
  deliveryCheckMessage: "Please select or detect your delivery location.",
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "ha_cart_v1";
const SESSION_STORAGE_KEY = "ha_active_session_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [orderType, setOrderTypeState] = useState<OrderType>("dine-in");
  const [orderDetails, setOrderDetailsState] = useState<OrderTypeDetails>(defaultOrderDetails);
  const [specialInstructions, setSpecialInstructions] = useState<string>("");
  const [activeSession, setActiveSessionState] = useState<DiningSession | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isOrderTypeModalOpen, setIsOrderTypeModalOpen] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.items)) setItems(parsed.items);
        if (parsed.orderType) setOrderTypeState(parsed.orderType);
        if (parsed.orderDetails) setOrderDetailsState(parsed.orderDetails);
        if (parsed.specialInstructions) setSpecialInstructions(parsed.specialInstructions);
      }

      const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (savedSession) {
        const parsedSession: DiningSession = JSON.parse(savedSession);
        if (parsedSession && parsedSession.status !== "closed") {
          setActiveSessionState(parsedSession);
          setOrderDetailsState((prev) => ({
            ...prev,
            tableNumber: parsedSession.tableNumber || prev.tableNumber,
          }));
        } else {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
    } catch {
      // Ignore
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      if (items.length > 0) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            items,
            orderType,
            orderDetails,
            specialInstructions,
          })
        );
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore
    }
  }, [items, orderType, orderDetails, specialInstructions, isInitialized]);

  const addItem = (menuItem: MenuItem, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.menuItemId === menuItem.id);
      if (existing) {
        return prev.map((item) =>
          item.menuItemId === menuItem.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          menuItemId: menuItem.id,
          name: menuItem.name,
          category: menuItem.category,
          price: menuItem.price,
          quantity,
        },
      ];
    });
  };

  const removeItem = (menuItemId: string) => {
    setItems((prev) => prev.filter((item) => item.menuItemId !== menuItemId));
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.menuItemId === menuItemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setSpecialInstructions("");
    setOrderDetailsState(defaultOrderDetails);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const setOrderType = (type: OrderType) => {
    setOrderTypeState(type);
  };

  const updateOrderDetails = (details: Partial<OrderTypeDetails>) => {
    setOrderDetailsState((prev) => {
      const updated = { ...prev, ...details };
      // If distance changed, re-evaluate eligibility
      if (details.deliveryDistanceKm !== undefined) {
        const evalRes = evaluateDeliveryDistance(details.deliveryDistanceKm);
        updated.isDeliveryEligible = evalRes.isEligible;
        updated.deliveryCheckMessage = evalRes.message;
      }
      return updated;
    });
  };

  const setActiveSession = (session: DiningSession | null) => {
    setActiveSessionState(session);
    try {
      if (session) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
        if (session.tableNumber) {
          updateOrderDetails({ tableNumber: session.tableNumber });
        }
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {
      // Ignore
    }
  };

  const clearActiveSession = () => {
    setActiveSession(null);
  };

  // Computations
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.05); // 5% GST for restaurant
  const deliveryFee = orderType === "delivery" && subtotal > 0 ? (subtotal >= 600 ? 0 : 40) : 0;
  const totalAmount = subtotal + tax + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        items,
        orderType,
        orderDetails,
        specialInstructions,
        isCartOpen,
        isOrderTypeModalOpen,
        activeSession,
        setActiveSession,
        clearActiveSession,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        setOrderType,
        updateOrderDetails,
        setSpecialInstructions,
        setIsCartOpen,
        setIsOrderTypeModalOpen,
        itemCount,
        subtotal,
        tax,
        deliveryFee,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
