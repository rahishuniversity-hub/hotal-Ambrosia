"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { PrinterIcon, ArrowDownTrayIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import type { RunningBill } from "@/lib/types";

interface RestaurantReceiptProps {
  bill: RunningBill;
  showAdminActions?: boolean;
  onFinalize?: () => void;
  onCloseSession?: () => void;
  onAddMoreItems?: () => void;
}

export default function RestaurantReceipt({
  bill,
  showAdminActions = false,
  onFinalize,
  onCloseSession,
  onAddMoreItems,
}: RestaurantReceiptProps) {
  const { session, orders, items, subtotal, tax, totalAmount, billNumber, billDate } = bill;
  const receiptRef = useRef<HTMLDivElement>(null);

  const formattedDate = new Date(billDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const formattedTime = new Date(billDate).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    // Open print dialog with Save as PDF pre-selected or download
    window.print();
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Action Bar (Hidden when printing) */}
      <div className="no-print w-full flex flex-wrap items-center justify-between gap-3 mb-4 p-3 bg-cream/70 rounded-xl border border-cream">
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              session.status === "closed"
                ? "bg-gray-200 text-gray-800"
                : session.status === "finalized"
                ? "bg-blue-100 text-blue-800"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            ● {session.status === "closed" ? "Session Settled & Closed" : session.status === "finalized" ? "Bill Finalized" : "Running Bill (Active)"}
          </span>
          <span className="text-xs text-warm-gray font-medium">
            {orders.length} order {orders.length === 1 ? "round" : "rounds"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {showAdminActions && onAddMoreItems && session.status !== "closed" && (
            <button
              onClick={onAddMoreItems}
              className="px-3 py-1.5 bg-white border border-cream hover:border-gold text-charcoal font-semibold text-xs rounded-lg transition-colors"
            >
              + Add More Items
            </button>
          )}

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-charcoal hover:bg-charcoal-lighter text-gold font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <PrinterIcon className="w-4 h-4" />
            <span>Print Bill</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            className="px-3 py-1.5 bg-gold hover:bg-gold-light text-charcoal font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            title="Save or Download PDF"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>Download PDF</span>
          </button>

          {showAdminActions && session.status === "active" && onFinalize && (
            <button
              onClick={onFinalize}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
            >
              Finalize Bill
            </button>
          )}

          {showAdminActions && session.status !== "closed" && onCloseSession && (
            <button
              onClick={onCloseSession}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
            >
              Close Bill
            </button>
          )}
        </div>
      </div>

      {/* ── Printable Bill / Thermal Receipt Card ── */}
      <div
        id="restaurant-receipt-print-area"
        ref={receiptRef}
        className="restaurant-receipt-card w-full max-w-[420px] bg-white border border-cream shadow-md p-6 sm:p-7 text-charcoal font-sans text-xs"
        style={{
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}
      >
        {/* Receipt Header / Hotel Ambrosia Branding */}
        <div className="text-center pb-4 border-b border-dashed border-gray-300">
          <div className="flex justify-center mb-2">
            <div className="relative w-36 h-10">
              <Image
                src="/images/logo/Main-Logo-Charcoal.svg"
                alt="Hotel Ambrosia"
                fill
                className="object-contain"
                onError={(e) => {
                  // Fallback to text if svg not found
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
          </div>
          <h2 className="font-heading text-lg font-extrabold uppercase tracking-widest text-charcoal">
            Hotel Ambrosia
          </h2>
          <p className="text-[11px] text-gray-600 font-medium">
            Fine Dining & Multi-Cuisine Restaurant
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5">
            Near Borsad Char Rasta, Anand - 388001, Gujarat
          </p>
          <p className="text-[10px] text-gray-500">
            Phone: +91 26922 61215 • Web: hotelambrosia.com
          </p>
          <div className="flex justify-center gap-3 text-[9px] text-gray-400 mt-1 font-mono">
            <span>GSTIN: 24AAACH1234F1Z5</span>
            <span>FSSAI: 10721014000189</span>
          </div>
        </div>

        {/* Bill Meta Details */}
        <div className="py-3 border-b border-dashed border-gray-300 grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
          <div>
            <span className="text-gray-500 text-[10px] block uppercase font-bold">Bill No:</span>
            <span className="font-bold text-charcoal font-mono">{billNumber}</span>
          </div>
          <div className="text-right">
            <span className="text-gray-500 text-[10px] block uppercase font-bold">Table:</span>
            <span className="font-extrabold text-charcoal text-sm bg-cream/70 px-2 py-0.5 rounded">
              {session.tableNumber}
            </span>
          </div>
          <div>
            <span className="text-gray-500 text-[10px] block uppercase font-bold">Customer:</span>
            <span className="font-semibold text-charcoal">{session.customerName}</span>
          </div>
          <div className="text-right">
            <span className="text-gray-500 text-[10px] block uppercase font-bold">Mobile:</span>
            <span className="font-mono text-charcoal">{session.customerPhone}</span>
          </div>
          <div>
            <span className="text-gray-500 text-[10px] block uppercase font-bold">Date:</span>
            <span className="text-gray-700">{formattedDate}</span>
          </div>
          <div className="text-right">
            <span className="text-gray-500 text-[10px] block uppercase font-bold">Time:</span>
            <span className="text-gray-700">{formattedTime}</span>
          </div>
          {session.sessionNumber && (
            <div className="col-span-2 pt-1 flex justify-between text-[10px] text-gray-400 font-mono border-t border-dotted border-gray-200">
              <span>Session: {session.sessionNumber}</span>
              <span>Status: {session.status.toUpperCase()}</span>
            </div>
          )}
        </div>

        {/* Items Table Header */}
        <div className="pt-3 pb-1 border-b border-gray-300">
          <div className="grid grid-cols-12 gap-1 text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
            <div className="col-span-6">Item Description</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">Total</div>
          </div>
        </div>

        {/* Dynamic Itemized Bill Rows (No limit) */}
        <div className="py-2 divide-y divide-gray-100 border-b border-dashed border-gray-300">
          {items.length === 0 ? (
            <p className="text-center py-4 text-xs text-gray-400 italic">No items ordered yet.</p>
          ) : (
            items.map((item, idx) => (
              <div key={item.id || idx} className="py-1.5 grid grid-cols-12 gap-1 items-center text-[11px]">
                <div className="col-span-6 pr-1">
                  <span className="font-bold text-charcoal block leading-tight">{item.name}</span>
                  <span className="text-[9px] text-gray-400 block">{item.category}</span>
                </div>
                <div className="col-span-2 text-center font-bold text-charcoal">
                  {item.quantity}
                </div>
                <div className="col-span-2 text-right text-gray-600 font-mono">
                  ₹{item.unitPrice}
                </div>
                <div className="col-span-2 text-right font-extrabold text-charcoal font-mono">
                  ₹{item.lineTotal}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Subtotal & Tax Calculation */}
        <div className="py-2.5 border-b border-dashed border-gray-300 space-y-1 text-[11px]">
          <div className="flex justify-between text-gray-600">
            <span>Item Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
            <span className="font-bold font-mono text-charcoal">₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>GST (5% SGST + CGST)</span>
            <span className="font-bold font-mono text-charcoal">₹{tax}</span>
          </div>
        </div>

        {/* Grand Total */}
        <div className="py-3 border-b-2 border-charcoal flex justify-between items-baseline">
          <span className="font-heading text-sm font-extrabold uppercase tracking-wider text-charcoal">
            Grand Total
          </span>
          <span className="font-heading text-xl font-extrabold text-charcoal font-mono">
            ₹{totalAmount}
          </span>
        </div>

        {/* Order Rounds Tracking summary */}
        {orders.length > 0 && (
          <div className="py-2 border-b border-dashed border-gray-200 text-[10px] text-gray-500">
            <span className="font-bold block uppercase text-gray-400 mb-0.5">Order Rounds Breakdown:</span>
            <div className="space-y-0.5 font-mono">
              {orders.map((ord, idx) => (
                <div key={ord.id} className="flex justify-between">
                  <span>
                    Round {ord.orderRound || idx + 1} (#{ord.orderNumber})
                  </span>
                  <span>
                    {ord.items.reduce((acc, it) => acc + it.quantity, 0)} items • ₹{ord.totalAmount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Receipt Footer */}
        <div className="pt-4 text-center space-y-1 text-[10px] text-gray-500">
          <p className="font-bold text-charcoal uppercase tracking-widest">
            Thank you for dining at Hotel Ambrosia!
          </p>
          <p>Please visit again • Have a wonderful day</p>
          <div className="pt-2 flex items-center justify-center gap-1.5 text-[9px] text-gray-400 font-mono">
            <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600 inline" />
            <span>Digital Dining Session System • Authentic Quality</span>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          /* Hide everything except the receipt area */
          body * {
            visibility: hidden;
          }
          #restaurant-receipt-print-area,
          #restaurant-receipt-print-area * {
            visibility: visible;
          }
          #restaurant-receipt-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: 16px;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
