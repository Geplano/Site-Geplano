import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	images: {
		domains: [
			'images.unsplash.com',
			'picsum.photos',
			'firebasestorage.googleapis.com',
			'storage.googleapis.com',
		],
	},
};

export default nextConfig;
