//@ts-check
const path = require('path');

// Explicitly load .env from this app's directory regardless of NX's CWD
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '.env.local'), override: true });

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:3333';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Make the URL available to Server Components via process.env
  env: {
    API_GATEWAY_URL,
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_GATEWAY_URL}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
