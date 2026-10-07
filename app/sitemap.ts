import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl || siteUrl.includes('localhost')) {
    siteUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://eswari-sound-system.vercel.app';
  }
  const currentDate = new Date();

  const routes = [
    '',
    '/about',
    '/packages',
    '/gallery',
    '/book',
    '/inquiry',
    '/contact',
    '/my-bookings',
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === '' || route === '/gallery' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/book' || route === '/packages' ? 0.9 : 0.7,
  }));
}
