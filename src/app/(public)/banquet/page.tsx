import type { Metadata } from "next";
import BanquetPage from "./BanquetPage";

export const metadata: Metadata = {
  title: "Banquet Hall — Weddings, Events & Celebrations",
  description:
    "Hotel Ambrosia's elegant banquet hall in Anand — fully air-conditioned, AV equipped, with stage decoration, elevators, and a cozy mini hall. Perfect for weddings, receptions, corporate events, and celebrations.",
  openGraph: {
    title: "Banquet Hall — Hotel Ambrosia",
    description:
      "Elegant venue for unforgettable events. Weddings, receptions, corporate meetings & more.",
    images: [{ url: "/images/banquet/BANQUTE-191-1024x671.jpg", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <BanquetPage />;
}
