/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  images: {
    domains: [
      'myanimelist.net',
      'cdn.myanimelist.net',
      'api.jikan.moe',
      'image.tmdb.org',
      'www.themoviedb.org',
      'lh3.googleusercontent.com',
      'vidsrc.me',
      'vidsrc.to'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.myanimelist.net'
      },
      {
        protocol: 'https',
        hostname: 'myanimelist.net'
      },
      {
        protocol: 'https',
        hostname: '**.tmdb.org'
      }
    ]
  },
  headers: async () => [
    {
      source: '/api/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-store'
        }
      ]
    }
  ],
  redirects: async () => [
    {
      source: '/index',
      destination: '/',
      permanent: true
    }
  ]
};

module.exports = nextConfig;
