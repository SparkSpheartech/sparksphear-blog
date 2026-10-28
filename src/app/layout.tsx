import type { ReactNode } from 'react'

import { Inter, Source_Serif_4, IBM_Plex_Mono } from 'next/font/google'
import Script from 'next/script'
import type { Metadata } from 'next'

import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'

import { cn } from '@/lib/utils'

import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin']
})

const sourceSerif4 = Source_Serif_4({
  variable: '--font-source-serif-4',
  subsets: ['latin']
})

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-ibm-plex-mono',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700']
})

export const metadata: Metadata = {
  title: {
    template: '%s | SPARKSPHEAR Field Notes',
    default: 'SPARKSPHEAR | Innovation Field Notes for Service-Based Businesses'
  },
  description:
    'AI-focused innovation field notes for service-business owners who know what AI is - and want to implement it. Real workflows, real numbers, by the team that builds them.',
  robots: 'index,follow',
  keywords: [
    'small business systems',
    'barbershop operations',
    'automation',
    'EDI X12',
    'HIPAA',
    'SPARKSPHEAR'
  ],
  icons: {
    icon: [
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon.ico', sizes: '48x48', type: 'image/x-icon' }
    ],
    apple: [{ url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [
      { url: '/favicon/android-chrome-192x192.png', rel: 'icon', sizes: '192x192', type: 'image/png' },
      { url: '/favicon/android-chrome-512x512.png', rel: 'icon', sizes: '512x512', type: 'image/png' }
    ]
  },
  metadataBase: new URL(`${process.env.NEXT_PUBLIC_APP_URL ?? 'https://blog.sparkspheartechsolutions.com'}`),
  openGraph: {
    title: {
      template: '%s | SPARKSPHEAR Field Notes',
      default: 'SPARKSPHEAR | Innovation Field Notes for Service-Based Businesses'
    },
    description:
      'AI-focused innovation field notes for service-business owners who know what AI is - and want to implement it. Real workflows, real numbers, by the team that builds them.',
    type: 'website',
    siteName: 'SPARKSPHEAR',
    url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://blog.sparkspheartechsolutions.com'}`,
    images: [
      {
        url: '/images/og-default.png',
        width: 1200,
        height: 630,
        alt: 'SPARKSPHEAR - Innovation Field Notes for Service-Based Businesses'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: {
      template: '%s | SPARKSPHEAR Field Notes',
      default: 'SPARKSPHEAR | Innovation Field Notes for Service-Based Businesses'
    },
    description:
      'AI-focused innovation field notes for service-business owners who know what AI is - and want to implement it. Real workflows, real numbers, by the team that builds them.'
  }
}

const RootLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <html
      lang='en'
      className={cn(
        inter.variable,
        sourceSerif4.variable,
        ibmPlexMono.variable,
        'flex min-h-full w-full scroll-smooth'
      )}
      suppressHydrationWarning
    >
      <body className='flex min-h-full w-full flex-auto flex-col'>
        <ThemeProvider attribute='class' enableSystem={false} disableTransitionOnChange>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
        <Script src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4010689269399813'
    crossOrigin='anonymous' strategy='afterInteractive' />
  <Script src='https://www.googletagmanager.com/gtag/js?id=G-3G7GT1GM5K' strategy='afterInteractive' />
        <Script id='ga4' strategy='afterInteractive'>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-3G7GT1GM5K');
          `}
        </Script>
      </body>
    </html>
  )
}

export default RootLayout
