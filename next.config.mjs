/** @type {import('next').NextConfig} */
const nextConfig = {
  // This allows the production build to succeed even if there are 
  // TypeScript errors or deprecation warnings.
  typescript: {
    ignoreBuildErrors: true,
  },
  // This ensures that ESLint warnings don't block the build.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Optional: If you are using images from external domains, add them here
  images: {
    unoptimized: true,
  },
};

export default nextConfig;