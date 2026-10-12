"use client";

import Image from "next/image";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SectionHeading from "@/components/ui/SectionHeading";

const facilities = [
  { icon: "❄️", title: "Fully Air-Conditioned", desc: "Climate-controlled hall for all seasons" },
  { icon: "📽️", title: "Visual & AV Equipment", desc: "Modern projectors, screens & sound system" },
  { icon: "👔", title: "Changing Rooms", desc: "Dedicated green rooms for hosts & guests" },
  { icon: "📝", title: "Stationery Provided", desc: "Pads & pencils for meetings & seminars" },
  { icon: "⚡", title: "Power Backup", desc: "24/7 uninterrupted power generator" },
  { icon: "🚻", title: "Modern Washrooms", desc: "Clean, hygienic, accessible facilities" },
  { icon: "🌸", title: "Stage Decoration", desc: "Customized aesthetic floral & lighting setups" },
  { icon: "🛗", title: "Elevator / Lift Access", desc: "Effortless accessibility for all guests" },
];

const eventTypes = [
  { title: "Weddings", desc: "Grand celebrations with custom stages & lavish dining", icon: "💍" },
  { title: "Wedding Receptions", desc: "Elegant evenings for welcoming friends & family", icon: "🥂" },
  { title: "Ring Ceremonies", desc: "Intimate, magical moments with beautiful decor", icon: "✨" },
  { title: "Wedding Anniversaries", desc: "Celebrate milestones with loved ones in style", icon: "💐" },
  { title: "Birthday Parties", desc: "Fun-filled themes, vibrant setups & delicious menus", icon: "🎂" },
  { title: "Kiddy Parties", desc: "Safe, cheerful spaces with kid-friendly catering", icon: "🎈" },
  { title: "Corporate Meetings", desc: "Professional boardroom & presentation setups", icon: "💼" },
  { title: "Business Seminars", desc: "AV-equipped conference environment with stationery", icon: "📊" },
  { title: "Get-togethers", desc: "Cozy reunions, family dinners & social evenings", icon: "🎉" },
];

const banquetGallery = [
  "/images/banquet/BANQUTE-191-1024x671.jpg",
  "/images/banquet/BANQUTE-81-1024x671.jpg",
  "/images/banquet/reception-1.jpg",
  "/images/banquet/BANQUTE-91.jpg",
  "/images/banquet/BANQUTE-281.jpg",
  "/images/banquet/BANQUTE-81-full.jpg",
  "/images/banquet/BANQUTE-251.jpg",
  "/images/banquet/BANQUTE-181.jpg",
];

export default function BanquetPage() {
  return (
    <>
      {/* Hero Banner */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center">
        <Image
          src="/images/banquet/BANQUTE-191-1024x671.jpg"
          alt="Hotel Ambrosia Banquet Hall"
          fill
          className="object-cover warm-image"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative z-10 text-center px-4">
          <p className="text-gold text-sm font-medium uppercase tracking-[0.25em] mb-3">
            Celebrate In Grandeur
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
            Banquet Hall
          </h1>
        </div>
      </section>

      {/* Main Intro & Positioning */}
      <section className="py-20 sm:py-28 bg-warm-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <ScrollReveal direction="left">
              <div className="relative">
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-2xl">
                  <Image
                    src="/images/banquet/reception-1.jpg"
                    alt="Banquet Event Setup"
                    fill
                    className="object-cover warm-image"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.2}>
              <p className="text-gold text-sm font-medium uppercase tracking-[0.2em] mb-3">
                Unforgettable Venues
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold text-charcoal leading-tight mb-6">
                A Banquet to Remember
              </h2>
              <div className="flex items-center gap-3 mb-6">
                <span className="h-px w-12 bg-gold" />
                <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="h-px w-12 bg-gold" />
              </div>
              <p className="text-warm-gray text-base sm:text-lg leading-relaxed mb-6">
                Welcome to Hotel Ambrosia&apos;s banquet venue — where memorable
                occasions come alive. Whether planning a fairytale wedding, a
                ring ceremony, a celebratory anniversary, or a high-profile corporate
                meeting, our hall combines luxury decor with personalized hospitality.
              </p>
              <p className="text-warm-gray text-base sm:text-lg leading-relaxed mb-8">
                With comprehensive audio-visual equipment, flexible stage
                decorations, dedicated changing rooms, and an experienced culinary
                team, your event will be flawlessly orchestrated from start to finish.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://api.whatsapp.com/send?phone=+919727846100&text=Hello%2C%20I%20would%20like%20to%20inquire%20about%20booking%20the%20Banquet%20Hall."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-gold text-charcoal text-sm font-semibold uppercase tracking-wider rounded hover:bg-gold-light transition-colors"
                >
                  Book on WhatsApp
                </a>
                <a
                  href="/docs/party-menu.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 border-2 border-gold text-gold text-sm font-semibold uppercase tracking-wider rounded hover:bg-gold hover:text-charcoal transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Party Menu PDF
                </a>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Mini Hall Highlight Callout */}
      <section className="py-12 bg-cream border-y border-gold/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="bg-white rounded-2xl p-8 sm:p-10 shadow-md border-l-4 border-gold flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="px-3 py-1 bg-gold/15 text-gold text-xs font-semibold uppercase tracking-wider rounded-full inline-block mb-3">
                Intimate Gatherings
              </span>
              <h3 className="font-heading text-2xl sm:text-3xl font-semibold text-charcoal mb-2">
                Exclusive Mini Hall (Up to 30 Guests)
              </h3>
              <p className="text-warm-gray text-sm sm:text-base max-w-2xl">
                Looking for a private, cozy setting for a small birthday party, family get-together, or executive board meeting? Our separate Mini Hall is tailored for intimate gatherings of up to 30 guests.
              </p>
            </div>
            <a
              href="https://api.whatsapp.com/send?phone=+919727846100&text=Hello%2C%20I%20am%20interested%20in%20reserving%20the%20Mini%20Hall%20for%20an%20intimate%20event."
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap px-6 py-3 bg-charcoal text-white hover:bg-gold hover:text-charcoal transition-colors text-sm font-semibold uppercase tracking-wider rounded"
            >
              Inquire Mini Hall
            </a>
          </ScrollReveal>
        </div>
      </section>

      {/* Event Types Showcase */}
      <section className="py-20 sm:py-28 bg-warm-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            subtitle="Occasions"
            title="Events We Host"
            description="From joyous personal celebrations to corporate meetings, our venue is perfectly equipped for every occasion."
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventTypes.map((evt, i) => (
              <ScrollReveal key={evt.title} delay={i * 0.05}>
                <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-warm-gray/10">
                  <div className="text-3xl mb-3">{evt.icon}</div>
                  <h3 className="font-heading text-xl font-semibold text-charcoal mb-2">
                    {evt.title}
                  </h3>
                  <p className="text-warm-gray text-sm leading-relaxed">
                    {evt.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Grid */}
      <section className="py-20 sm:py-28 bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            subtitle="Amenities & Features"
            title="Banquet Facilities"
            description="Complete amenities and equipment to guarantee smooth execution of your celebration."
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {facilities.map((fac, i) => (
              <ScrollReveal key={fac.title} delay={i * 0.05}>
                <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                  <div className="text-3xl mb-3">{fac.icon}</div>
                  <h3 className="font-heading text-lg font-semibold text-charcoal mb-2">
                    {fac.title}
                  </h3>
                  <p className="text-warm-gray text-xs leading-relaxed">
                    {fac.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="py-20 sm:py-28 bg-warm-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading subtitle="Gallery" title="Banquet Photo Gallery" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {banquetGallery.map((src, i) => (
              <ScrollReveal key={src} delay={i * 0.05}>
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-md group cursor-pointer">
                  <Image
                    src={src}
                    alt={`Banquet gallery image ${i + 1}`}
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

      {/* CTA Section */}
      <section className="py-16 bg-charcoal text-center">
        <ScrollReveal>
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-white mb-4">
            Plan Your Grand Event With Us
          </h2>
          <p className="text-white/60 mb-8 max-w-lg mx-auto">
            Contact our dedicated event planners to discuss packages, dates, and customized decor.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="tel:+912692261215"
              className="px-8 py-4 bg-gold text-charcoal font-semibold uppercase tracking-wider text-sm rounded hover:bg-gold-light transition-colors"
            >
              Call +91 26922 61215
            </a>
            <Link
              href="/contact"
              className="px-8 py-4 border-2 border-white/40 text-white font-semibold uppercase tracking-wider text-sm rounded hover:bg-white/10 transition-colors"
            >
              Send Event Inquiry
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
