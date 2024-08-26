/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    domains: ["localhost", "placehold.co"]
  }
};

module.exports = nextConfig;
