import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl || siteUrl.includes('localhost')) {
    siteUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://eswari-sound-system-q6l5.vercel.app';
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/', '/pay'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
