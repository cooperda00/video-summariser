/** @type {import('next').NextConfig} */

import PWA from "next-pwa";

const withPWA = PWA({
  dest: "public",
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);
