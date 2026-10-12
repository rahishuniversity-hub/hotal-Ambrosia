"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { MenuItem } from "@/lib/types";

interface MenuCardProps {
  item: MenuItem;
  onAddToCart?: (item: MenuItem) => void;
  featured?: boolean;
}

export default function MenuCard({ item, onAddToCart, featured = false }: MenuCardProps) {
  const placeholderImages = [
    "/images/restaurant/REASTURANT-191-1-1024x670.jpg",
    "/images/restaurant/REASTURANT-201.jpg",
    "/images/restaurant/REASTURANT-181.jpg",
    "/images/restaurant/REASTURANT-16-1024x683.jpg",
  ];

  const imageSrc = item.image || placeholderImages[Math.floor(Math.random() * placeholderImages.length)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ${
        featured ? "md:col-span-2 md:row-span-2" : ""
      }`}
    >
      {/* Image Container */}
      <div className={`relative overflow-hidden ${featured ? "aspect-[4/3]" : "aspect-[4/3]"}`}>
        <Image
          src={imageSrc}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110 warm-image"
          sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Category Badge */}
        <span className="absolute top-3 left-3 px-3 py-1 bg-gold/90 text-charcoal text-xs font-bold uppercase tracking-wider rounded-full">
          {item.category.split(" — ")[0]}
        </span>

        {/* Price Badge */}
        <span className="absolute top-3 right-3 px-3 py-1.5 bg-charcoal/90 text-gold font-bold text-sm rounded-full">
          ₹{item.price}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className={`font-heading font-semibold text-charcoal mb-2 ${
          featured ? "text-xl sm:text-2xl" : "text-lg"
        }`}>
          {item.name}
        </h3>
        <p className={`text-warm-gray line-clamp-2 ${featured ? "text-base" : "text-sm"}`}>
          {item.description}
        </p>

        {/* Add to Cart Button */}
        {onAddToCart && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAddToCart(item)}
            className="mt-4 w-full py-3 bg-charcoal text-gold font-semibold uppercase tracking-wider text-sm rounded-lg hover:bg-charcoal-light transition-colors flex items-center justify-center gap-2"
          >
            <span>Add to Order</span>
            <span className="text-gold-light">₹{item.price}</span>
          </motion.button>
        )}

        {!onAddToCart && (
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-warm-gray-light uppercase tracking-wide">
              {item.available ? "Available" : "Unavailable"}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
