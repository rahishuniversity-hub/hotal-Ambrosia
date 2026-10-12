import type { Metadata } from "next";
import RestaurantPage from "./RestaurantPage";

export const metadata: Metadata = {
  title: "Restaurant — Flavors of the World",
  description:
    "Hotel Ambrosia restaurant in Anand offers a global dining experience with Indian and international fusion cuisine. Fresh, locally-sourced ingredients, cozy upscale ambience with soft background music.",
  openGraph: {
    title: "Restaurant — Flavors of the World",
    description:
      "Multi-cuisine dining experience at Hotel Ambrosia, Anand. Fresh ingredients, upscale ambience, soft background music.",
    images: [{ url: "/images/restaurant/REASTURANT-191-1-1024x670.jpg", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <RestaurantPage />;
}
