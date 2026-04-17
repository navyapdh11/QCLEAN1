/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['primeclean.com.au'],
  },
  async rewrites() {
    const bookingUrl = process.env.BOOKING_SERVICE_URL || 'http://localhost:8000';
    const ragUrl = process.env.RAG_SERVICE_URL || 'http://localhost:8001';
    return [
      {
        source: '/api/booking/:path*',
        destination: `${bookingUrl}/:path*`,
      },
      {
        source: '/api/rag/:path*',
        destination: `${ragUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
