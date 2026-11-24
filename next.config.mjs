/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // Product photos can come from Unsplash or any https URL you paste in /admin.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
