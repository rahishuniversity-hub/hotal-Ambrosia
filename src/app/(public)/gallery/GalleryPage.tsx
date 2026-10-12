"use client";

import Image from "next/image";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SectionHeading from "@/components/ui/SectionHeading";

// Combine all gallery images
const galleryImages = [
  // Rooms
  { src: "/images/rooms/ROOM-101.jpg", category: "Rooms", alt: "Silver Room at Hotel Ambrosia" },
  { src: "/images/rooms/ROOM-11.jpg", category: "Rooms", alt: "Room interior view" },
  { src: "/images/rooms/ROOM-18.jpg", category: "Rooms", alt: "Room detail view" },
  { src: "/images/rooms/ROOM-161.jpg", category: "Rooms", alt: "Elegant room setup" },
  { src: "/images/rooms/ROOM-111-thumb.jpg", category: "Rooms", alt: "Room thumb view" },
  { src: "/images/rooms/ROOM-131-thumb.jpg", category: "Rooms", alt: "Room thumb view" },
  { src: "/images/rooms/ROOM-141-thumb.jpg", category: "Rooms", alt: "Room thumb view" },
  { src: "/images/rooms/ROOM-101-1-thumb.jpg", category: "Rooms", alt: "Room thumb view" },

  // Restaurant
  { src: "/images/restaurant/REASTURANT-201.jpg", category: "Restaurant", alt: "Restaurant dining area" },
  { src: "/images/restaurant/REASTURANT-181.jpg", category: "Restaurant", alt: "Restaurant interior" },
  { src: "/images/restaurant/REASTURANT-191.jpg", category: "Restaurant", alt: "Restaurant view" },
  { src: "/images/restaurant/REASTURANT-161.jpg", category: "Restaurant", alt: "Restaurant setup" },
  { src: "/images/restaurant/REASTURANT-191-1-1024x670.jpg", category: "Restaurant", alt: "Restaurant dining" },
  { src: "/images/restaurant/REASTURANT-16-1024x683.jpg", category: "Restaurant", alt: "Restaurant interior" },
  { src: "/images/restaurant/REASTURANT-71-thumb.jpg", category: "Restaurant", alt: "Restaurant thumb view" },
  { src: "/images/restaurant/REASTURANT-151-thumb.jpg", category: "Restaurant", alt: "Restaurant thumb view" },
  { src: "/images/restaurant/REASTURANT-141-1-thumb.jpg", category: "Restaurant", alt: "Restaurant thumb view" },
  { src: "/images/restaurant/REASTURANT-20-thumb.jpg", category: "Restaurant", alt: "Restaurant thumb view" },
  { src: "/images/restaurant/REASTURANT-91-thumb.jpg", category: "Restaurant", alt: "Restaurant thumb view" },

  // Banquet
  { src: "/images/banquet/BANQUTE-191-1024x671.jpg", category: "Banquet", alt: "Banquet hall setup" },
  { src: "/images/banquet/BANQUTE-81-1024x671.jpg", category: "Banquet", alt: "Banquet area" },
  { src: "/images/banquet/reception-1.jpg", category: "Banquet", alt: "Reception setup" },
  { src: "/images/banquet/BANQUTE-91.jpg", category: "Banquet", alt: "Banquet hall" },
  { src: "/images/banquet/BANQUTE-281.jpg", category: "Banquet", alt: "Banquet hall detail" },
  { src: "/images/banquet/BANQUTE-81-full.jpg", category: "Banquet", alt: "Banquet hall" },
  { src: "/images/banquet/BANQUTE-251.jpg", category: "Banquet", alt: "Banquet hall" },
  { src: "/images/banquet/BANQUTE-181.jpg", category: "Banquet", alt: "Banquet hall" },
  { src: "/images/banquet/BANQUTE-111.jpg", category: "Banquet", alt: "Banquet hall" },
  { src: "/images/banquet/BANQUTE-21.jpg", category: "Banquet", alt: "Banquet hall" },
  { src: "/images/banquet/BANQUTE-191.jpg", category: "Banquet", alt: "Banquet hall" },
  { src: "/images/banquet/BANQUTE-132.jpg", category: "Banquet", alt: "Banquet hall" },
  { src: "/images/banquet/BANQUTE-211.jpg", category: "Banquet", alt: "Banquet hall" },
  { src: "/images/banquet/Hotel-Ambrosia-Banqute-1-1.jpg", category: "Banquet", alt: "Banquet setup" },
];

// Create unique categories
const categories = Array.from(new Set(galleryImages.map((img) => img.category)));

export default function GalleryPage() {
  return (
    <>
      {/* Hero Banner */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center">
        <Image
          src="/images/home/Hotel-Ambrosia-Outside-3.jpg"
          alt="Hotel Ambrosia exterior"
          fill
          className="object-cover warm-image"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative z-10 text-center px-4">
          <p className="text-gold text-sm font-medium uppercase tracking-[0.25em] mb-3">
            Visual Tour
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
            Gallery
          </h1>
        </div>
      </section>

      {/* Gallery Controls */}
      <section className="py-12 bg-cream sticky top-0 z-30 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category, i) => (
              <ScrollReveal key={category} delay={i * 0.05}>
                <button
                  onClick={() => {
                    const element = document.getElementById(category.toLowerCase());
                    if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="px-6 py-2 bg-white rounded-full text-sm font-medium text-charcoal hover:bg-gold hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  {category}
                </button>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Sections */}
      <section className="py-20 sm:py-28 bg-warm-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {categories.map((category, catIndex) => {
            const categoryImages = galleryImages.filter((img) => img.category === category);
            const categoryId = category.toLowerCase();

            return (
              <div key={category} id={categoryId} className="mb-24">
                <SectionHeading
                  subtitle="Visual"
                  title={category}
                  description={`Explore our ${category.toLowerCase()} at Hotel Ambrosia`}
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categoryImages.map((image, i) => (
                    <ScrollReveal key={image.src} delay={i * 0.05 + catIndex * 0.1}>
                      <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-md group cursor-pointer">
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110 warm-image"
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors duration-300" />
                        <div className="absolute bottom-2 left-2 text-white/0 group-hover:text-white transition-colors duration-300">
                          <p className="text-xs font-medium">{image.category}</p>
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Lightbox Placeholder */}
      <section className="py-20 bg-charcoal text-center">
        <ScrollReveal>
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-white mb-4">
            Need a Private View?
          </h2>
          <p className="text-white/60 mb-8 max-w-lg mx-auto">
            Schedule a one-on-one virtual tour of our hotel, restaurant, and banquet hall.
          </p>
          <a
            href="https://api.whatsapp.com/send?phone=+919727846100&text=Hello%2C%20I%20would%20like%20to%20schedule%20a%20private%20virtual%20tour%20of%20Hotel%20Ambrosia."
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-gold text-charcoal font-semibold uppercase tracking-wider text-sm rounded hover:bg-gold-light transition-colors"
          >
            WhatsApp Us to Schedule
          </a>
        </ScrollReveal>
      </section>
    </>
  );
}
