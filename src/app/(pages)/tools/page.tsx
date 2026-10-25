import type { Metadata } from 'next'

import ToolsClient from './ToolsClient'

export const metadata: Metadata = {
  title: 'Workflow Opportunity Calculator',
  description:
    'Estimate the workflow opportunity, manual hours, and process improvements suitable for AI agent automation.',
  alternates: {
    canonical: 'https://sparkspheartechsolutions.blog/tools'
  },
  openGraph: {
    title: 'Workflow Opportunity Calculator | THE SPARK',
    description:
      'Estimate the workflow opportunity, manual hours, and process improvements suitable for AI agent automation.',
    url: 'https://sparkspheartechsolutions.blog/tools',
    siteName: 'THE SPARK',
    images: [
      {
        url: '/brand/logo.png',
        width: 500,
        height: 500,
        alt: 'SPARKSPHEAR Workflow Opportunity Calculator'
      }
    ]
  }
}

export default function Page() {
  return <ToolsClient />
}
