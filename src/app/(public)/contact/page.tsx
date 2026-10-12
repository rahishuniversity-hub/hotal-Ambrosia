import type { Metadata } from "next";
import ContactPage from "./ContactPage";

export const metadata: Metadata = {
  title: "Contact Us — Hotel Ambrosia",
  description:
    "Contact Hotel Ambrosia for inquiries about rooms, restaurant bookings, banquet hall events, or special occasions. Visit us in Anand, Gujarat, or reach us via phone, WhatsApp, or email.",
  openGraph: {
    title: "Contact — Hotel Ambrosia",
    description:
      "Get in touch with Hotel Ambrosia for room reservations, event planning, and dining inquiries.",
    images: [{ url: "/images/home/Hotel-Ambrosia-Outside-3.jpg", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <ContactPage />;
}
