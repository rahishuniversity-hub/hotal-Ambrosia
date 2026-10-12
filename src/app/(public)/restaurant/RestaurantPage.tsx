"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SectionHeading from "@/components/ui/SectionHeading";
import FeaturedDishes from "@/components/restaurant/FeaturedDishes";

const cuisineItems = [
  { icon: "🍛", title: "Indian", desc: "Authentic regional specialties" },
  { icon: "🥘", title: "Cheese-based", desc: "Rich, creamy Indian preparations" },
  { icon: "🌮", title: "Mexican", desc: "Spicy fusion delights" },
  { icon: "🍜", title: "Thai", desc: "Aromatic Southeast Asian dishes" },
];

const foodGallery = [
  "/images/restaurant/REASTURANT-201.jpg",
  "/images/restaurant/REASTURANT-181.jpg",
  "/images/restaurant/REASTURANT-191.jpg",
  "/images/restaurant/REASTURANT-161.jpg",
  "/images/restaurant/REASTURANT-191-1-1024x670.jpg",
  "/images/restaurant/REASTURANT-16-1024x683.jpg",
  "/images/restaurant/REASTURANT-71-thumb.jpg",
  "/images/restaurant/REASTURANT-151-thumb.jpg",
];

const hours = [
  { label: "Lunch", time: "10:30 AM – 3:00 PM", icon: "☀️" },
  { label: "Dinner", time: "6:30 PM – 10:30 PM", icon: "🌅" },
];

export default function RestaurantPage() {
  return (
    <>
      {/* Hero Banner - Enhanced */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src="/images/restaurant/REASTURANT-191-1-1024x670.jpg"
            alt="Hotel Ambrosia restaurant"
            fill
            className="object-cover warm-image"
            priority
            sizes="100vw"
          />
        </motion.div>
        <div className="absolute inset-0 hero-overlay" />

        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/40 via-transparent to-charcoal/60" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-gold text-sm font-medium uppercase tracking-[0.3em] mb-4"
          >
            Fine Dining Experience
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Flavors of<br className="sm:hidden" /> the World
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-white/80 text-lg sm:text-xl mb-8 max-w-2xl mx-auto"
          >
            Experience culinary excellence with our award-winning fusion of traditional Indian and international cuisines
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/restaurant/menu"
              className="px-10 py-4 bg-gold text-charcoal font-bold uppercase tracking-wider text-sm rounded-lg hover:bg-gold-light transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              View Menu
            </Link>
            <a
              href="https://api.whatsapp.com/send?phone=+919727846100&text=Hello%2C%20I%20would%20like%20to%20book%20a%20dining%20table."
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 border-2 border-white/60 text-white font-semibold uppercase tracking-wider text-sm rounded-lg hover:bg-white/10 transition-colors"
            >
              Reserve Table
            </a>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2"
          >
            <div className="w-1 h-3 bg-white/70 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Dishes Section */}
      <FeaturedDishes />

      {/* Story Section */}
      <section className="py-20 sm:py-28 bg-warm-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <ScrollReveal direction="left">
              <div className="relative">
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-2xl">
                  <Image
                    src="/images/restaurant/REASTURANT-201.jpg"
                    alt="Hotel Ambrosia restaurant interior"
                    fill
                    className="object-cover warm-image"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.2}>
              <p className="text-gold text-sm font-medium uppercase tracking-[0.2em] mb-3">
                Welcome to Our Dining Experience
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold text-charcoal leading-tight mb-6">
                A Global Dining Experience
              </h2>
              <div className="flex items-center gap-3 mb-6">
                <span className="h-px w-12 bg-gold" />
                <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="h-px w-12 bg-gold" />
              </div>
              <p className="text-warm-gray text-base sm:text-lg leading-relaxed mb-6">
                At Hotel Ambrosia, our restaurant is where culinary artistry meets
                warm hospitality. &quot;Flavors of the World — A Global Dining
                Experience&quot; showcases the perfect harmony of traditional
                Indian cuisine and innovative international fusion.
              </p>
              <p className="text-warm-gray text-base sm:text-lg leading-relaxed mb-8">
                We source our ingredients locally and seasonally, ensuring freshness
                in every plate. The cozy yet upscale ambience, complemented by soft
                background music, creates the perfect setting for any occasion.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {cuisineItems.map((item, i) => (
                  <ScrollReveal key={item.title} delay={i * 0.1 + 0.3}>
                    <div className="flex gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <h3 className="font-semibold text-charcoal">{item.title}</h3>
                        <p className="text-sm text-warm-gray">{item.desc}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Hours Section */}
      <section className="py-20 sm:py-28 bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <ScrollReveal direction="left">
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold text-charcoal leading-tight mb-6">
                Visit Us for an Unforgettable Culinary Journey
              </h2>
              <p className="text-warm-gray text-base sm:text-lg leading-relaxed mb-8">
                Open daily, offering both lunch and dinner service. Join us for a
                memorable dining experience in a warm and welcoming atmosphere.
              </p>
              <div className="space-y-6">
                {hours.map((h, i) => (
                  <ScrollReveal key={h.label} delay={i * 0.15 + 0.2}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gold text-charcoal flex items-center justify-center text-2xl">
                        {h.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-charcoal text-lg">
                          {h.label}
                        </h3>
                        <p className="text-warm-gray">{h.time}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/restaurant/menu"
                  className="px-6 py-3 bg-gold text-charcoal font-bold uppercase tracking-wider text-sm rounded hover:bg-gold-light transition-colors shadow-md flex items-center gap-2"
                >
                  <span>🍽️ Order Online (Menu)</span>
                </Link>
                <a
                  href="https://api.whatsapp.com/send?phone=+919727846100&text=Hello%2C%20I%20would%20like%20to%20book%20a%20dining%20table."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 border border-charcoal/20 text-charcoal font-semibold uppercase tracking-wider text-sm rounded hover:bg-charcoal hover:text-white transition-colors"
                >
                  WhatsApp Booking
                </a>
                <Link
                  href="/docs/food-menu.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 border-2 border-gold text-gold text-sm font-semibold uppercase tracking-wider rounded hover:bg-gold hover:text-charcoal transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  PDF Menu
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.3}>
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src="/images/restaurant/REASTURANT-16-1024x683.jpg"
                  alt="Hotel Ambrosia restaurant interior setup"
                  fill
                  className="object-cover warm-image"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="py-20 sm:py-28 bg-warm-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading subtitle="Gallery" title="Restaurant Gallery" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {foodGallery.map((src, i) => (
              <ScrollReveal key={src} delay={i * 0.05}>
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-md group cursor-pointer">
                  <Image
                    src={src}
                    alt={`Restaurant gallery photo ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110 warm-image"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors duration-300" />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-charcoal text-center">
        <ScrollReveal>
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-white mb-4">
            Ready to Dine?
          </h2>
          <p className="text-white/60 mb-8 max-w-lg mx-auto">
            Experience the perfect blend of traditional Indian and international fusion cuisine.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/restaurant/menu"
              className="px-8 py-4 bg-gold text-charcoal font-bold uppercase tracking-wider text-sm rounded hover:bg-gold-light transition-colors shadow-lg"
            >
              Order Online Now
            </Link>
            <a
              href="tel:+912692261215"
              className="px-8 py-4 border-2 border-white/40 text-white font-semibold uppercase tracking-wider text-sm rounded hover:bg-white/10 transition-colors"
            >
              Call: +91 26922 61215
            </a>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
