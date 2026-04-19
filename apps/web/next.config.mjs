/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ['@nox/shared-types'],
  experimental: {
    typedRoutes: true,
  },
  env: {
    NEXT_PUBLIC_APP_NAME: 'Nox',
  },
};

export default nextConfig;
