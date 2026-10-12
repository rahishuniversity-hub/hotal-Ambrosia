"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SectionHeading from "@/components/ui/SectionHeading";

/* ═══════════════════════════════════════════
   Data
   ═══════════════════════════════════════════ */

const heroSlides = [
  {
    image: "/images/home/Hotel-Ambrosia-Outside-3.jpg",
    title: "Welcome to\nHotel Ambrosia",
    subtitle: "The Grand Hotel",
    description: "Your Premier Event Destination in Anand",
  },
  {
    image: "/images/restaurant/REASTURANT-191-1-1024x670.jpg",
    title: "Flavors of\nthe World",
    subtitle: "Fine Dining",
    description: "A Global Dining Experience — Indian & International Fusion",
  },
  {
    image: "/images/banquet/BANQUTE-191-1024x671.jpg",
    title: "A Banquet\nto Remember",
    subtitle: "Elegant Events",
    description: "An Elegant Venue for Unforgettable Celebrations",
  },
  {
    image: "/images/rooms/ROOM-101.jpg",
    title: "Luxury &\nComfort",
    subtitle: "Premium Rooms",
    description: "Elegant Silver & Gold Rooms — Your Home Away from Home",
  },
];

const quickLinks = [
  {
    href: "/rooms",
    title: "Rooms",
    description: "Silver & Gold rooms with modern amenities and warm hospitality",
    image: "/images/rooms/ROOM-11.jpg",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    href: "/restaurant",
    title: "Restaurant",
    description: "Multi-cuisine dining with fresh, locally-sourced ingredients",
    image: "/images/restaurant/REASTURANT-201.jpg",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.126-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.17c0 .62-.504 1.124-1.125 1.124H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12m12 0a48.29 48.29 0 00-1.5-.075" />
      </svg>
    ),
  },
  {
    href: "/banquet",
    title: "Banquet",
    description: "Elegant venue for weddings, receptions & corporate events",
    image: "/images/banquet/BANQUTE-81-1024x671.jpg",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
  },
];

const amenities = [
  { icon: "📶", label: "High-Speed Wi-Fi" },
  { icon: "📺", label: "Flat-Screen TVs" },
  { icon: "☕", label: "In-Room Coffee" },
  { icon: "❄️", label: "Air Conditioning" },
  { icon: "⚡", label: "24/7 Power Backup" },
  { icon: "🛗", label: "Elevator Access" },
  { icon: "🅿️", label: "Parking" },
  { icon: "🍽️", label: "Multi-Cuisine Restaurant" },
];

const testimonials = [
  {
    text: "I am staying here for last 10 days. Great experience. Very supportive and friendly staff. Would recommend it without a second thought. It is like your second home.",
    author: "Rahul Shahi",
    rating: 5,
  },
  {
    text: "The ambiance of the hotel and interior of the restaurant was good. There was background music playing slowly. The food tasted delicious and much good.",
    author: "Smit Patel",
    rating: 5,
  },
  {
    text: "Excellent eateries. While I am pursuing my graduation, my friends and I go there on a weekly basis, and the food quality is excellent.",
    author: "Maniaxs",
    rating: 5,
  },
];

/* ═══════════════════════════════════════════
   Page Component
   ═══════════════════════════════════════════ */

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, []);

  // Auto-advance hero slides
  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  // Auto-advance testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* ════════════ HERO SECTION ════════════ */}
      <section className="relative h-screen min-h-[600px] overflow-hidden">
        {/* Background slides */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={heroSlides[currentSlide].image}
              alt={heroSlides[currentSlide].title.replace("\n", " ")}
              fill
              className="object-cover warm-image"
              priority={currentSlide === 0}
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Overlay */}
        <div className="absolute inset-0 hero-overlay" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-4xl"
            >
              <motion.p
                className="text-gold text-sm sm:text-base font-medium uppercase tracking-[0.25em] mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {heroSlides[currentSlide].subtitle}
              </motion.p>
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight whitespace-pre-line mb-6">
                {heroSlides[currentSlide].title}
              </h1>
              <p className="text-white/80 text-lg sm:text-xl max-w-2xl mx-auto mb-10">
                {heroSlides[currentSlide].description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/rooms"
                  className="px-8 py-4 bg-gold text-charcoal font-semibold uppercase tracking-wider text-sm rounded hover:bg-gold-light transition-all duration-300 hover:shadow-lg hover:shadow-gold/20"
                >
                  Explore Rooms
                </Link>
                <Link
                  href="/contact"
                  className="px-8 py-4 border-2 border-white/40 text-white font-semibold uppercase tracking-wider text-sm rounded hover:bg-white/10 hover:border-white/60 transition-all duration-300"
                >
                  Make an Inquiry
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slide indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === currentSlide
                    ? "w-10 bg-gold"
                    : "w-4 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 right-8 hidden lg:flex flex-col items-center gap-2 text-white/50 text-xs tracking-widest"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <span className="rotate-90">SCROLL</span>
            <div className="w-px h-8 bg-white/30" />
          </motion.div>
        </div>
      </section>

      {/* ════════════ WELCOME SECTION ════════════ */}
      <section className="py-20 sm:py-28 bg-warm-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <ScrollReveal direction="left">
              <div className="relative">
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-2xl">
                  <Image
                    src="/images/home/Hotel-Ambrosia-Outside-2.jpg"
                    alt="Hotel Ambrosia exterior view"
                    fill
                    className="object-cover warm-image"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-6 -right-6 bg-gold text-charcoal px-6 py-4 rounded-lg shadow-xl hidden sm:block">
                  <p className="text-3xl font-heading font-bold">10+</p>
                  <p className="text-xs uppercase tracking-wider font-medium">
                    Years of
                    <br />
                    Hospitality
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.2}>
              <p className="text-gold text-sm font-medium uppercase tracking-[0.2em] mb-3">
                Welcome to Hotel Ambrosia
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold text-charcoal leading-tight mb-6">
                Experience Luxury & Warmth in Anand
              </h2>
              <div className="flex items-center gap-3 mb-6">
                <span className="h-px w-12 bg-gold" />
                <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="h-px w-12 bg-gold" />
              </div>
              <p className="text-warm-gray text-base sm:text-lg leading-relaxed mb-6">
                Nestled in the heart of Anand, Hotel Ambrosia — The Grand Hotel
                offers a perfect blend of comfort and elegance. Whether
                you&apos;re seeking a luxurious stay, an exquisite dining
                experience, or the perfect venue for your celebration, we bring
                warmth and grandeur to every moment.
              </p>
              <p className="text-warm-gray text-base sm:text-lg leading-relaxed mb-8">
                From our beautifully appointed Silver and Gold rooms to our
                world-class restaurant and stunning banquet hall, every detail is
                crafted with care to make your experience truly memorable.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/rooms"
                  className="px-6 py-3 bg-gold text-charcoal text-sm font-semibold uppercase tracking-wider rounded hover:bg-gold-light transition-colors"
                >
                  View Rooms
                </Link>
                <Link
                  href="/contact"
                  className="px-6 py-3 border-2 border-gold text-gold text-sm font-semibold uppercase tracking-wider rounded hover:bg-gold hover:text-charcoal transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ════════════ QUICK LINKS ════════════ */}
      <section className="py-20 sm:py-28 bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            subtitle="Discover"
            title="What We Offer"
            description="From luxurious rooms to fine dining and grand celebrations — discover everything Hotel Ambrosia has to offer."
          />

          <div className="grid md:grid-cols-3 gap-8">
            {quickLinks.map((item, i) => (
              <ScrollReveal key={item.href} delay={i * 0.15}>
                <Link href={item.href} className="group block">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg mb-6">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110 warm-image"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-charcoal/30 group-hover:bg-charcoal/10 transition-colors duration-500" />
                    <div className="absolute bottom-4 left-4 text-white">
                      {item.icon}
                    </div>
                  </div>
                  <h3 className="font-heading text-2xl font-semibold text-charcoal group-hover:text-gold transition-colors mb-2">
                    {item.title}
                  </h3>
                  <p className="text-warm-gray text-sm leading-relaxed">
                    {item.description}
                  </p>
                  <span className="inline-flex items-center gap-2 mt-3 text-gold text-sm font-medium group-hover:gap-3 transition-all">
                    Explore
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ AMENITIES STRIP ════════════ */}
      <section className="py-16 bg-charcoal">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6">
            {amenities.map((amenity, i) => (
              <ScrollReveal key={amenity.label} delay={i * 0.05}>
                <div className="flex flex-col items-center gap-2 text-center">
                  <span className="text-2xl">{amenity.icon}</span>
                  <span className="text-white/80 text-xs font-medium tracking-wide">
                    {amenity.label}
                  </span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ ROOMS PREVIEW ════════════ */}
      <section className="py-20 sm:py-28 bg-warm-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            subtitle="Stay"
            title="Our Rooms"
            description="Choose between our elegant Silver and luxurious Gold rooms — both designed for ultimate comfort."
          />

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Silver Room */}
            <ScrollReveal>
              <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-500">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src="/images/rooms/ROOM-18.jpg"
                    alt="Silver Room at Hotel Ambrosia"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105 warm-image"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-4 py-1.5 bg-white/90 backdrop-blur-sm text-charcoal text-xs font-semibold uppercase tracking-wider rounded-full">
                      Silver Room
                    </span>
                  </div>
                </div>
                <div className="p-6 sm:p-8">
                  <h3 className="font-heading text-2xl font-semibold text-charcoal mb-2">
                    Silver Room
                  </h3>
                  <p className="text-warm-gray text-sm mb-4 leading-relaxed">
                    Elegant, shimmering silver accents with comfortable and
                    modern furnishings. A perfect blend of style and comfort for
                    the discerning traveler.
                  </p>
                  <div className="flex items-end gap-2 mb-6">
                    <span className="text-gold text-2xl font-heading font-bold">₹1,800</span>
                    <span className="text-warm-gray-light text-sm mb-1">/ single</span>
                    <span className="text-warm-gray-light text-sm mb-1 mx-1">·</span>
                    <span className="text-gold text-2xl font-heading font-bold">₹2,300</span>
                    <span className="text-warm-gray-light text-sm mb-1">/ double</span>
                  </div>
                  <Link
                    href="/rooms"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-charcoal text-sm font-semibold uppercase tracking-wider rounded hover:bg-gold-light transition-colors"
                  >
                    View Details
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </ScrollReveal>

            {/* Gold Room */}
            <ScrollReveal delay={0.15}>
              <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-500">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src="/images/rooms/ROOM-161.jpg"
                    alt="Gold Room at Hotel Ambrosia"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105 warm-image"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-4 py-1.5 bg-gold/90 backdrop-blur-sm text-charcoal text-xs font-semibold uppercase tracking-wider rounded-full">
                      Gold Room
                    </span>
                  </div>
                </div>
                <div className="p-6 sm:p-8">
                  <h3 className="font-heading text-2xl font-semibold text-charcoal mb-2">
                    Gold Room
                  </h3>
                  <p className="text-warm-gray text-sm mb-4 leading-relaxed">
                    A fairytale feel with gold-accented walls, lavish furniture,
                    and cozy luxury. The perfect retreat for guests seeking an
                    unforgettable experience.
                  </p>
                  <div className="flex items-end gap-2 mb-6">
                    <span className="text-gold text-2xl font-heading font-bold">₹2,005</span>
                    <span className="text-warm-gray-light text-sm mb-1">/ single</span>
                    <span className="text-warm-gray-light text-sm mb-1 mx-1">·</span>
                    <span className="text-gold text-2xl font-heading font-bold">₹2,520</span>
                    <span className="text-warm-gray-light text-sm mb-1">/ double</span>
                  </div>
                  <Link
                    href="/rooms"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-charcoal text-sm font-semibold uppercase tracking-wider rounded hover:bg-gold-light transition-colors"
                  >
                    View Details
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ════════════ TESTIMONIALS ════════════ */}
      <section className="relative py-20 sm:py-28 bg-charcoal overflow-hidden">
        {/* BG image */}
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/images/home/Hotel-Ambrosia-Outside-3.jpg"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            subtitle="Testimonials"
            title="What Our Guests Say"
            description="Real experiences from our valued guests who chose Hotel Ambrosia."
            light
          />

          <div className="relative max-w-3xl mx-auto text-center">
            <svg className="w-12 h-12 text-gold/30 mx-auto mb-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.748-9.571 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10H0z" />
            </svg>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {/* Stars */}
                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <blockquote className="text-white text-lg sm:text-xl leading-relaxed italic mb-8">
                  &ldquo;{testimonials[currentTestimonial].text}&rdquo;
                </blockquote>

                <p className="text-gold font-heading text-lg font-semibold">
                  {testimonials[currentTestimonial].author}
                </p>
                <p className="text-white/50 text-sm mt-1">Guest</p>
              </motion.div>
            </AnimatePresence>

            {/* Testimonial indicators */}
            <div className="flex justify-center gap-3 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTestimonial(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    i === currentTestimonial
                      ? "bg-gold scale-125"
                      : "bg-white/30 hover:bg-white/50"
                  }`}
                  aria-label={`View testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ CTA BANNER ════════════ */}
      <section className="relative py-20 sm:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/banquet/reception-1.jpg"
            alt="Hotel Ambrosia banquet setup"
            fill
            className="object-cover warm-image"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/80 to-charcoal/70" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-2xl">
              <p className="text-gold text-sm font-medium uppercase tracking-[0.2em] mb-4">
                Plan Your Event
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
                Make Your Celebration Truly Unforgettable
              </h2>
              <p className="text-white/70 text-lg leading-relaxed mb-8">
                From intimate gatherings to grand celebrations, our banquet hall
                and expert team will make your event perfect in every detail.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/banquet"
                  className="px-8 py-4 bg-gold text-charcoal font-semibold uppercase tracking-wider text-sm rounded hover:bg-gold-light transition-colors"
                >
                  View Banquet Hall
                </Link>
                <a
                  href="https://api.whatsapp.com/send?phone=+919727846100&text=Hello%2C%20I%20would%20like%20to%20inquire%20about%20booking%20an%20event."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 border-2 border-white/40 text-white font-semibold uppercase tracking-wider text-sm rounded hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp Us
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
