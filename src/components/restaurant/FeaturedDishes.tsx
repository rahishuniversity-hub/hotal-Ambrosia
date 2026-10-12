"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { AMBROSIA_MENU_ITEMS } from "@/lib/menuData";

// Select featured items from signature dishes and popular categories
const featuredItemIds = [
  "signature-1", // Ambrosia Special Paneer
  "sizzler-1", // Ambrosia Special Sizzler
  "mexican-app-1", // Mexican Platter
  "signature-2", // Rani Ki Pasand
  "indian-app-1", // SP Tandoori Platter
  "rice-8", // Ambrosia Sp. Dum Biryani
];

const placeholderImages = [
  "/images/restaurant/REASTURANT-191-1-1024x670.jpg",
  "/images/restaurant/REASTURANT-201.jpg",
  "/images/restaurant/REASTURANT-181.jpg",
  "/images/restaurant/REASTURANT-16-1024x683.jpg",
];

export default function FeaturedDishes() {
  const [activeIndex, setActiveIndex] = useState(0);

  const featuredItems = featuredItemIds
    .map((id) => AMBROSIA_MENU_ITEMS.find((item) => item.id === id))
    .filter(Boolean);

  // Auto-rotate featured items
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % featuredItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredItems.length]);

  const activeItem = featuredItems[activeIndex];

  if (!activeItem) return null;

  return (
    <section className="py-20 sm:py-28 bg-charcoal">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <p className="text-gold text-sm font-medium uppercase tracking-[0.25em] mb-3 text-center">
            Chef&apos;s Recommendations
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold text-white text-center mb-12">
            Signature Dishes
          </h2>
        </ScrollReveal>

        {/* Main Featured Display */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Image */}
          <ScrollReveal direction="left">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeItem.id}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={activeItem.image || placeholderImages[activeIndex % placeholderImages.length]}
                    alt={activeItem.name}
                    fill
                    className="object-cover warm-image"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent" />

              {/* Price Tag */}
              <div className="absolute bottom-6 left-6 px-4 py-2 bg-gold text-charcoal font-bold text-lg rounded-lg">
                ₹{activeItem.price}
              </div>
            </div>
          </ScrollReveal>

          {/* Content */}
          <ScrollReveal direction="right" delay={0.2}>
            <div className="lg:pl-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeItem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <span className="inline-block px-3 py-1 bg-gold/20 text-gold text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                    {activeItem.category}
                  </span>
                  <h3 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold text-white mb-4">
                    {activeItem.name}
                  </h3>
                  <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-8">
                    {activeItem.description}
                  </p>
                </motion.div>
              </AnimatePresence>

              <Link
                href="/restaurant/menu"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-charcoal font-bold uppercase tracking-wider text-sm rounded-lg hover:bg-gold-light transition-all shadow-lg hover:shadow-gold/30"
              >
                <span>Order Now</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>

              {/* Item Indicators */}
              <div className="flex gap-2 mt-8">
                {featuredItems.map((item, index) => (
                  <button
                    key={item?.id}
                    onClick={() => setActiveIndex(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === activeIndex ? "w-8 bg-gold" : "w-4 bg-white/30 hover:bg-white/50"
                    }`}
                    aria-label={`View ${item?.name}`}
                  />
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Quick Preview Cards */}
        <ScrollReveal delay={0.4}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-12">
            {featuredItems.map((item, index) => {
              if (!item) return null;
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ y: -4 }}
                  onClick={() => setActiveIndex(index)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    index === activeIndex
                      ? "border-gold shadow-lg shadow-gold/20"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={item.image || placeholderImages[index % placeholderImages.length]}
                    alt={item.name}
                    fill
                    className="object-cover warm-image"
                    sizes="(max-width: 768px) 50vw, 16vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
                  <span className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium truncate">
                    {item.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
