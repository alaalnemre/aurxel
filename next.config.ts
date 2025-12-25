import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Disable Edge runtime for auth routes
  experimental: {
    // Ensure stable features
  },
};

export default withNextIntl(nextConfig);
