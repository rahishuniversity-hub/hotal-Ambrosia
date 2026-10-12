"use client";

import Image from "next/image";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SectionHeading from "@/components/ui/SectionHeading";

const amenities = [
  { icon: "📺", label: "Flat-Screen TVs" },
  { icon: "📶", label: "High-Speed Wi-Fi" },
  { icon: "☕", label: "In-Room Coffee Maker" },
  { icon: "🚿", label: "Modern Bathroom" },
  { icon: "🛋️", label: "Stylish Furniture" },
  { icon: "🛏️", label: "Cozy Beds" },
  { icon: "👔", label: "Changing Room" },
  { icon: "📺", label: "Multi-LCD TV" },
  { icon: "⚡", label: "24/7 Power Backup" },
];

const roomGallery = [
  "/images/rooms/ROOM-101.jpg",
  "/images/rooms/ROOM-11.jpg",
  "/images/rooms/ROOM-18.jpg",
  "/images/rooms/ROOM-161.jpg",
  "/images/rooms/ROOM-111-thumb.jpg",
  "/images/rooms/ROOM-131-thumb.jpg",
  "/images/rooms/ROOM-141-thumb.jpg",
  "/images/rooms/ROOM-101-1-thumb.jpg",
];

export default function RoomsPage() {
  return (
    <>
      {/* Hero Banner */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center">
        <Image
          src="/images/rooms/ROOM-101.jpg"
          alt="Hotel Ambrosia luxury room"
          fill
          className="object-cover warm-image"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative z-10 text-center px-4">
          <p className="text-gold text-sm font-medium uppercase tracking-[0.25em] mb-3">
            Stay With Us
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
            Our Rooms
          </h1>
        </div>
      </section>

      {/* Rooms Overview */}
      <section className="py-20 sm:py-28 bg-warm-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            subtitle="Accommodation"
            title="Silver & Gold Rooms"
            description="Each room is thoughtfully designed for comfort and elegance, offering a perfect home away from home."
          />

          {/* Room Cards */}
          <div className="grid lg:grid-cols-2 gap-12 mb-20">
            {/* Silver Room */}
            <ScrollReveal>
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src="/images/rooms/ROOM-18.jpg"
                    alt="Silver Room"
                    fill
                    className="object-cover warm-image"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-4 py-1.5 bg-white/90 backdrop-blur-sm text-charcoal text-xs font-semibold uppercase tracking-wider rounded-full">
                      Silver Room
                    </span>
                  </div>
                </div>
                <div className="p-6 sm:p-8">
                  <h3 className="font-heading text-2xl font-semibold text-charcoal mb-3">
                    Silver Room
                  </h3>
                  <p className="text-warm-gray text-sm leading-relaxed mb-6">
                    Step into elegance with our Silver Room, featuring shimmering
                    silver accents and modern furnishings. Designed for comfort
                    with a contemporary touch, it&apos;s your refined retreat in
                    Anand.
                  </p>
                  <div className="bg-cream rounded-lg p-4 mb-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gold/20">
                          <th className="text-left py-2 text-warm-gray font-medium">Occupancy</th>
                          <th className="text-right py-2 text-warm-gray font-medium">Tariff</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gold/10">
                          <td className="py-3 text-charcoal">Single Occupancy</td>
                          <td className="py-3 text-right font-heading text-lg font-bold text-gold">₹1,800</td>
                        </tr>
                        <tr>
                          <td className="py-3 text-charcoal">Double Occupancy</td>
                          <td className="py-3 text-right font-heading text-lg font-bold text-gold">₹2,300</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="https://api.whatsapp.com/send?phone=+919727846100&text=Hello%2C%20I%20am%20interested%20in%20booking%20a%20Silver%20Room."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-gold text-charcoal text-sm font-semibold uppercase tracking-wider rounded hover:bg-gold-light transition-colors"
                    >
                      Make an Inquiry
                    </a>
                    <a
                      href="/docs/room-tariff.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 border-2 border-gold text-gold text-sm font-semibold uppercase tracking-wider rounded hover:bg-gold hover:text-charcoal transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Room Tariff PDF
                    </a>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Gold Room */}
            <ScrollReveal delay={0.15}>
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src="/images/rooms/ROOM-161.jpg"
                    alt="Gold Room"
                    fill
                    className="object-cover warm-image"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-4 py-1.5 bg-gold/90 backdrop-blur-sm text-charcoal text-xs font-semibold uppercase tracking-wider rounded-full">
                      Gold Room
                    </span>
                  </div>
                </div>
                <div className="p-6 sm:p-8">
                  <h3 className="font-heading text-2xl font-semibold text-charcoal mb-3">
                    Gold Room
                  </h3>
                  <p className="text-warm-gray text-sm leading-relaxed mb-6">
                    Indulge in the fairytale feel of our Gold Room, with lavish
                    gold-accented walls, luxurious furniture, and an atmosphere
                    of cozy grandeur. An unforgettable experience awaits.
                  </p>
                  <div className="bg-cream rounded-lg p-4 mb-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gold/20">
                          <th className="text-left py-2 text-warm-gray font-medium">Occupancy</th>
                          <th className="text-right py-2 text-warm-gray font-medium">Tariff</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gold/10">
                          <td className="py-3 text-charcoal">Single Occupancy</td>
                          <td className="py-3 text-right font-heading text-lg font-bold text-gold">₹2,005</td>
                        </tr>
                        <tr>
                          <td className="py-3 text-charcoal">Double Occupancy</td>
                          <td className="py-3 text-right font-heading text-lg font-bold text-gold">₹2,520</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="https://api.whatsapp.com/send?phone=+919727846100&text=Hello%2C%20I%20am%20interested%20in%20booking%20a%20Gold%20Room."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-gold text-charcoal text-sm font-semibold uppercase tracking-wider rounded hover:bg-gold-light transition-colors"
                    >
                      Make an Inquiry
                    </a>
                    <a
                      href="/docs/room-tariff.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 border-2 border-gold text-gold text-sm font-semibold uppercase tracking-wider rounded hover:bg-gold hover:text-charcoal transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Room Tariff PDF
                    </a>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Amenities */}
          <SectionHeading subtitle="Amenities" title="Room Features" />
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-6 mb-20">
            {amenities.map((a, i) => (
              <ScrollReveal key={a.label} delay={i * 0.05}>
                <div className="flex flex-col items-center gap-2 text-center bg-white rounded-xl p-4 shadow-sm">
                  <span className="text-2xl">{a.icon}</span>
                  <span className="text-charcoal text-xs font-medium">{a.label}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Photo Gallery */}
          <SectionHeading subtitle="Gallery" title="Room Gallery" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {roomGallery.map((src, i) => (
              <ScrollReveal key={src} delay={i * 0.05}>
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-md group cursor-pointer">
                  <Image
                    src={src}
                    alt={`Room gallery photo ${i + 1}`}
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
            Ready to Book Your Stay?
          </h2>
          <p className="text-white/60 mb-8 max-w-lg mx-auto">
            Contact us via phone or WhatsApp for reservations and special requests.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="tel:+912692261215"
              className="px-8 py-4 bg-gold text-charcoal font-semibold uppercase tracking-wider text-sm rounded hover:bg-gold-light transition-colors"
            >
              Call Now
            </a>
            <Link
              href="/contact"
              className="px-8 py-4 border-2 border-white/40 text-white font-semibold uppercase tracking-wider text-sm rounded hover:bg-white/10 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
