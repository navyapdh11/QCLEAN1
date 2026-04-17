/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['primeclean.com.au'],
  },
  async rewrites() {
    return [
      {
        source: '/api/booking/:path*',
        destination: `${process.env.BOOKING_SERVICE_URL}/:path*`,
      },
      {
        source: '/api/rag/:path*',
        destination: `${process.env.RAG_SERVICE_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
