/** @type {import('next').NextConfig} */
const withInterceptStdout = require("next-intercept-stdout");

const nextConfig = withInterceptStdout(
  {
    reactStrictMode: false,
    swcMinify: true,
    async redirects() {
      return [
        {
          source: "/",
          destination: "/event_location_events",
          permanent: true,
        },
      ];
    },
    webpack: (config) => {
      config.resolve.fallback = { fs: false };
      return config;
    },
    images: {
      domains: ["storage.googleapis.com"],
    },
    // webpack: (config) => {
    //   config.module.rules.push({
    //     test: /\.svg$/,
    //     use: [
    //       {
    //         loader: '@svgr/webpack',
    //       },
    //     ],
    //   });
    //   return config;
    // },
    images: {
      disableStaticImages: true, // importした画像の型定義設定を無効にする
    },
  },
  (text) => (text.includes("Duplicate atom key") ? "" : text)
);

module.exports = nextConfig;
