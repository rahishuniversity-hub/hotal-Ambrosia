import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hotel-ambrosia.com"),
  title: {
    default: "Hotel Ambrosia — The Grand Hotel | Rooms, Restaurant & Banquet in Anand",
    template: "%s | Hotel Ambrosia — The Grand Hotel",
  },
  description:
    "Hotel Ambrosia — Your Premier Event Destination in Anand, Gujarat. Luxury rooms, multi-cuisine restaurant, and elegant banquet hall for weddings, receptions & corporate events.",
  keywords: [
    "Hotel Ambrosia",
    "hotel in Anand",
    "banquet hall Anand",
    "restaurant Anand",
    "wedding venue Gujarat",
    "rooms in Anand",
    "Hotel Ambrosia Anand",
  ],
  authors: [{ name: "Hotel Ambrosia" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://hotel-ambrosia.com",
    siteName: "Hotel Ambrosia — The Grand Hotel",
    title: "Hotel Ambrosia — The Grand Hotel | Rooms, Restaurant & Banquet in Anand",
    description:
      "Your Premier Event Destination in Anand. Luxury rooms, multi-cuisine restaurant, and elegant banquet hall.",
    images: [
      {
        url: "/images/home/Hotel-Ambrosia-Outside-3.jpg",
        width: 1200,
        height: 630,
        alt: "Hotel Ambrosia exterior view",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@HotelAmbrosia5",
    title: "Hotel Ambrosia — The Grand Hotel",
    description:
      "Your Premier Event Destination in Anand. Luxury rooms, dining & events.",
    images: ["/images/home/Hotel-Ambrosia-Outside-3.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} h-full`}>
      <head>
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Hotel",
              name: "Hotel Ambrosia — The Grand Hotel",
              description:
                "Your Premier Event Destination, Rooms in Anand. Luxury hotel with restaurant and banquet facilities.",
              url: "https://hotel-ambrosia.com",
              telephone: "+912692261215",
              email: "info@hotel-ambrosia.com",
              address: {
                "@type": "PostalAddress",
                streetAddress:
                  "Opp. Uma Bhavan, Nr. Municipal Water Tank, Anand Sojitra Road, Borsad Char Rasta",
                addressLocality: "Anand",
                addressRegion: "Gujarat",
                postalCode: "388001",
                addressCountry: "IN",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 22.5434,
                longitude: 72.9529,
              },
              image: "/images/home/Hotel-Ambrosia-Outside-3.jpg",
              priceRange: "₹1,800 - ₹2,520",
              starRating: {
                "@type": "Rating",
                ratingValue: "4.5",
              },
              amenityFeature: [
                { "@type": "LocationFeatureSpecification", name: "Free Wi-Fi" },
                { "@type": "LocationFeatureSpecification", name: "Restaurant" },
                { "@type": "LocationFeatureSpecification", name: "Banquet Hall" },
                { "@type": "LocationFeatureSpecification", name: "24/7 Power Backup" },
                { "@type": "LocationFeatureSpecification", name: "Air Conditioning" },
              ],
              hasMap:
                "https://www.google.com/maps?q=22.5434,72.9529",
              sameAs: [
                "https://www.facebook.com/HotelAmbrosia15",
                "https://twitter.com/HotelAmbrosia5",
                "https://www.instagram.com/hotelambrosia_anand",
                "https://www.pinterest.com/hotelambrosia5",
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
