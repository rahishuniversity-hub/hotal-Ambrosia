import type { Metadata } from "next";
import RoomsPage from "./RoomsPage";

export const metadata: Metadata = {
  title: "Rooms — Silver & Gold Luxury Rooms",
  description:
    "Explore Hotel Ambrosia's Silver and Gold rooms with flat-screen TVs, high-speed Wi-Fi, in-room coffee makers, modern bathrooms, and 24/7 power backup. Starting from ₹1,800/night.",
  openGraph: {
    title: "Rooms — Hotel Ambrosia",
    description:
      "Silver & Gold luxury rooms in Anand. Modern amenities, cozy comfort. From ₹1,800/night.",
    images: [{ url: "/images/rooms/ROOM-101.jpg", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <RoomsPage />;
}
