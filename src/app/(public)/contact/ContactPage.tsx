"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { adminStore } from "@/lib/store";

interface FormData {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  message: string;
}

const contactInfo = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Address",
    value: "Opp. Uma Bhavan, Nr. Municipal Water Tank, Anand Sojitra Road, Borsad Char Rasta, Anand – 388 001, Gujarat, India",
    link: "https://www.google.com/maps?q=22.5434,72.9529",
    linkText: "View on Google Maps",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    title: "Phone",
    value: "+91 26922 61215",
    link: "tel:+912692261215",
    linkText: "Call now",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: "Email",
    value: "info@hotel-ambrosia.com",
    link: "mailto:info@hotel-ambrosia.com",
    linkText: "Email us",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
    title: "WhatsApp",
    value: "+91 97278 46100",
    link: "https://api.whatsapp.com/send?phone=+919727846100&text=Hello",
    linkText: "Chat on WhatsApp",
  },
];

export default function ContactPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>();
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const onSubmit = async (data: FormData) => {
    try {
      setSubmitError("");
      setSubmitSuccess(false);

      const formattedMessage = data.eventType && data.eventType !== "General Inquiry"
        ? `[${data.eventType}] ${data.message}`
        : data.message;

      const created = await adminStore.addEnquiry({
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: formattedMessage,
        read: false,
      });

      if (!created) {
        throw new Error("Failed to submit enquiry. Please try again.");
      }

      setSubmitSuccess(true);
      reset();
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      setSubmitError("Failed to send message. Please try WhatsApp or call us directly.");
      console.error(error);
    }
  };

  return (
    <>
      {/* Hero Banner */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center">
        <Image
          src="/images/home/Hotel-Ambrosia-Outside-3.jpg"
          alt="Hotel Ambrosia"
          fill
          className="object-cover warm-image"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative z-10 text-center px-4">
          <p className="text-gold text-sm font-medium uppercase tracking-[0.25em] mb-3">
            Get In Touch
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
            Contact Us
          </h1>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20 sm:py-28 bg-warm-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {contactInfo.map((info, i) => (
              <ScrollReveal key={info.title} delay={i * 0.1}>
                <a
                  href={info.link}
                  target={info.link.startsWith("http") ? "_blank" : undefined}
                  rel={info.link.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="group block bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 h-full"
                >
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold mb-4 group-hover:bg-gold group-hover:text-white transition-colors flex-shrink-0">
                    {info.icon}
                  </div>
                  <h3 className="font-semibold text-charcoal text-lg mb-2">
                    {info.title}
                  </h3>
                  <p className="text-warm-gray text-sm leading-relaxed mb-4 min-h-[3rem]">
                    {info.value}
                  </p>
                  <span className="inline-flex items-center gap-1 text-gold text-xs font-medium group-hover:gap-2 transition-all">
                    {info.linkText}
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </a>
              </ScrollReveal>
            ))}
          </div>

          {/* Map */}
          <ScrollReveal>
            <div className="rounded-xl overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3684.5!2d72.9529!3d22.5434!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDMyJzM2LjIiTiA3MsKwNTcnMTAuNCJF!5e0!3m2!1sen!2sin!4v1"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Hotel Ambrosia Location"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Inquiry Form */}
      <section className="py-20 sm:py-28 bg-cream">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-12">
            <p className="text-gold text-sm font-medium uppercase tracking-[0.2em] mb-3">
              Get in Touch
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold text-charcoal leading-tight">
              Send Us Your Inquiry
            </h2>
          </ScrollReveal>

          <ScrollReveal className="bg-white rounded-xl shadow-lg p-8 sm:p-12">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  {...register("name", { required: "Name is required" })}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                    errors.name ? "border-red-500" : "border-cream focus:border-gold"
                  } bg-white focus:outline-none`}
                  placeholder="Your name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
                  })}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                    errors.email ? "border-red-500" : "border-cream focus:border-gold"
                  } bg-white focus:outline-none`}
                  placeholder="your@email.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  {...register("phone", { required: "Phone is required" })}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                    errors.phone ? "border-red-500" : "border-cream focus:border-gold"
                  } bg-white focus:outline-none`}
                  placeholder="+91 XXXXX XXXXX"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Inquiry Type
                </label>
                <select
                  {...register("eventType")}
                  className="w-full px-4 py-3 rounded-lg border-2 border-cream focus:border-gold bg-white focus:outline-none transition-colors"
                >
                  <option value="">Select an option</option>
                  <option value="Room Booking">Room Booking</option>
                  <option value="Restaurant Reservation">Restaurant Reservation</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Wedding Reception">Wedding Reception</option>
                  <option value="Corporate Event">Corporate Event</option>
                  <option value="Birthday Party">Birthday Party</option>
                  <option value="Other Event">Other Event</option>
                  <option value="General Inquiry">General Inquiry</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Message
                </label>
                <textarea
                  {...register("message", { required: "Message is required" })}
                  rows={5}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors resize-none ${
                    errors.message ? "border-red-500" : "border-cream focus:border-gold"
                  } bg-white focus:outline-none`}
                  placeholder="Tell us more about your inquiry..."
                />
                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
              </div>

              {/* Success Message */}
              {submitSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-green-50 border-2 border-green-200 rounded-lg text-green-700"
                >
                  <p className="font-medium">Thank you! Your inquiry has been sent successfully.</p>
                  <p className="text-sm">We&apos;ll get back to you soon.</p>
                </motion.div>
              )}

              {/* Error Message */}
              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700"
                >
                  <p className="font-medium">Oops! {submitError}</p>
                </motion.div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 bg-gold text-charcoal font-semibold uppercase tracking-wider text-sm rounded hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending..." : "Send Inquiry"}
                </button>
                <a
                  href="https://api.whatsapp.com/send?phone=+919727846100&text=Hello%20Hotel%20Ambrosia%2C%20I%20would%20like%20to%20inquire%20about..."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-4 border-2 border-gold text-gold font-semibold uppercase tracking-wider text-sm rounded hover:bg-gold hover:text-charcoal transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
              </div>
            </form>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-charcoal text-center">
        <ScrollReveal>
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-white mb-4">
            Prefer Calling Directly?
          </h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="tel:+912692261215"
              className="px-8 py-4 bg-gold text-charcoal font-semibold uppercase tracking-wider text-sm rounded hover:bg-gold-light transition-colors"
            >
              Call +91 26922 61215
            </a>
            <a
              href="https://api.whatsapp.com/send?phone=+919727846100&text=Hello"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-[#25D366] text-white font-semibold uppercase tracking-wider text-sm rounded hover:brightness-110 transition-colors"
            >
              WhatsApp +91 97278 46100
            </a>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
