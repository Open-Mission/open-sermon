import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  turbopack: {
    root: "/Users/claudio/Projects/development/open-mission/open-sermon",
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
