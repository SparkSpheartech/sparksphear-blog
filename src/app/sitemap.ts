import type { MetadataRoute } from 'next'

import { allPosts } from '@/assets/data/blog-posts'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://sparkspheartechsolutions.blog'
  const routes = ['', '/contact-us', '/tools']

  const posts = allPosts.map(post => ({
    url: `${base}/p/${post.slug}`,
    lastModified: new Date()
  }))

  return [...routes.map(route => ({ url: `${base}${route}` })), ...posts]
}
