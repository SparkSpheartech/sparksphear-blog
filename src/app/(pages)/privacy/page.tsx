import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'SPARKSPHEAR Field Notes Privacy Policy — how we handle your data, cookies, and advertising on this blog.',
  alternates: {
    canonical: 'https://blog.sparkspheartechsolutions.com/privacy'
  }
}

const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: '1. Introduction',
    body: (
      <p>
        SparkSphear (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your privacy.
        This Privacy Policy explains how we collect, use, disclose, and safeguard your
        information when you visit SPARKSPHEAR Field Notes (blog.sparkspheartechsolutions.com).
      </p>
    )
  },
  {
    title: '2. Information We Collect',
    body: (
      <>
        <p className='mb-4'>We may collect the following types of information:</p>
        <ul className='list-disc list-inside space-y-2'>
          <li>
            <strong>Information you provide:</strong> name and email address when you contact
            us or subscribe to the newsletter.
          </li>
          <li>
            <strong>Technical data:</strong> IP address, browser type, operating system, and
            usage data when you visit the site.
          </li>
          <li>
            <strong>Analytics and advertising data:</strong> cookies and similar technologies
            used to measure traffic and, where enabled, to serve advertising.
          </li>
        </ul>
      </>
    )
  },
  {
    title: '3. How We Use Your Information',
    body: (
      <ul className='list-disc list-inside space-y-2'>
        <li>Operate, maintain, and improve the blog</li>
        <li>Respond to inquiries and fulfill newsletter subscriptions</li>
        <li>Measure audience engagement through analytics tools</li>
        <li>Display advertising, where enabled, through partners such as Google AdSense</li>
        <li>Comply with legal obligations</li>
      </ul>
    )
  },
  {
    title: '4. Cookies and Advertising',
    body: (
      <>
        <p className='mb-4'>
          This site uses cookies and similar technologies for analytics and, where enabled,
          advertising. Third-party vendors, including Google, use cookies to serve ads based on
          your prior visits to this and other websites.
        </p>
        <ul className='list-disc list-inside space-y-2'>
          <li>
            Google&apos;s use of advertising cookies enables it and its partners to serve ads
            based on your visits to this site and/or other sites on the Internet.
          </li>
          <li>
            You may opt out of personalized advertising by visiting{' '}
            <a
              href='https://www.google.com/settings/ads'
              target='_blank'
              rel='noopener noreferrer'
              className='underline hover:no-underline'
            >
              Google Ads Settings
            </a>
            .
          </li>
          <li>
            You can also manage cookie preferences through your browser settings. Disabling
            cookies may affect site functionality.
          </li>
        </ul>
      </>
    )
  },
  {
    title: '5. Information Sharing',
    body: (
      <>
        <p className='mb-4'>
          We do not sell, trade, or otherwise transfer your personal information to outside
          parties except in the following circumstances:
        </p>
        <ul className='list-disc list-inside space-y-2'>
          <li>With service providers who help us operate the site and deliver services</li>
          <li>With advertising and analytics partners, subject to the choices described above</li>
          <li>When required by law or to protect our rights, property, or safety</li>
        </ul>
      </>
    )
  },
  {
    title: '6. Data Security',
    body: (
      <p>
        We implement appropriate technical and organizational measures to protect your personal
        information against unauthorized access, alteration, disclosure, or destruction. No
        method of transmission over the Internet is 100% secure, and we cannot guarantee
        absolute security.
      </p>
    )
  },
  {
    title: '7. Your Rights',
    body: (
      <ul className='list-disc list-inside space-y-2'>
        <li>Access and receive a copy of your personal data</li>
        <li>Request correction of inaccurate personal data</li>
        <li>Request deletion of your personal data</li>
        <li>Opt out of marketing communications at any time</li>
      </ul>
    )
  },
  {
    title: '8. Third-Party Links',
    body: (
      <p>
        This blog contains links to third-party websites and may reference third-party products
        or services. We are not responsible for the privacy practices or content of those sites.
        We encourage you to review the privacy policies of any third-party sites you visit.
      </p>
    )
  },
  {
    title: '9. Changes to This Policy',
    body: (
      <p>
        We may update this Privacy Policy from time to time. Material changes will be posted on
        this page with an updated &quot;Last updated&quot; date.
      </p>
    )
  },
  {
    title: '10. Contact Us',
    body: (
      <>
        <p className='mb-4'>
          If you have questions about this Privacy Policy or wish to exercise your rights,
          contact us:
        </p>
        <p>
          <strong>Email:</strong> support@sparkspheartechsolutions.com
          <br />
          <strong>Phone:</strong> (260) 267-0641
          <br />
          <strong>Location:</strong> Fort Wayne, IN
        </p>
      </>
    )
  }
]

export default function PrivacyPolicy() {
  return (
    <section className='pt-32 pb-20 bg-background min-h-screen'>
      <div className='container max-w-4xl mx-auto px-4'>
        <h1 className='text-4xl md:text-5xl font-bold mb-8'>Privacy Policy</h1>
        <p className='text-muted-foreground text-sm mb-8'>
          Last updated: October 28, 2026
        </p>

        <div className='prose prose-lg dark:prose-invert max-w-none space-y-8'>
          {sections.map((s) => (
            <div
              key={s.title}
              className='bg-card shadow-sm p-8 rounded-2xl border'
            >
              <h2 className='text-2xl font-bold mb-4'>{s.title}</h2>
              <div className='text-muted-foreground'>{s.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
