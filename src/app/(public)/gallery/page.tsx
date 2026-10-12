import type { Metadata } from "next";
import GalleryPage from "./GalleryPage";

export const metadata: Metadata = {
  title: "Gallery — Hotel Ambrosia Photos",
  description:
    "Browse premium photos of Hotel Ambrosia's luxury rooms, elegant restaurant, and stunning banquet hall at Hotel Ambrosia in Anand, Gujarat.",
  openGraph: {
    title: "Gallery — Hotel Ambrosia",
    description: "Visual tour of Hotel Ambrosia's luxury amenities, dining, and events.",
    images: [{ url: "/images/rooms/ROOM-101.jpg", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <GalleryPage />;
}
