/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/qc-realcyber-plan',
        destination: '/realcyber-plan',
        permanent: true,
      },
      {
        source: '/qc-realcyber-import',
        destination: '/realcyber-import',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
