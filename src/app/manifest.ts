import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CMD Cashews",
    short_name: "CMD Cashews",
    description: "Premium Sri Lankan cashews from Negombo, since 1996.",
    start_url: "/",
    display: "standalone",
    background_color: "#FCFAF5",
    theme_color: "#17402A",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
