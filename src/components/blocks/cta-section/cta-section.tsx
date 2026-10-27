'use client'

// Component Imports
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const CTA = () => {
  return (
    <section className='bg-muted py-8 sm:py-16 lg:py-24' id='get-in-touch'>
      <div className='container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8'>
        <Card className='shadow-none'>
          <CardContent>
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
              {/* Left Column - Image */}
              <div className='relative h-64 sm:h-80 lg:h-auto'>
                <img
                  src='/images/cta.webp'
                  alt='Workspace with laptop'
                  className='h-full w-full rounded-lg object-cover'
                />
              </div>

              {/* Right Column - Content */}
              <Card className='bg-muted rounded-lg shadow-none ring-0'>
                <CardContent className='flex h-full flex-col justify-between gap-4'>
                  <h2 className='text-xl leading-tight font-semibold lg:text-2xl'>
                    Explore insights, stories, and strategies that help you build better products every day.
                  </h2>
                  <div>
                    <p className='text-muted-foreground mb-3 text-base'>
                      Get SPARKSPHEAR Field Notes — workflow automation patterns for owner-led service
                      businesses, from real client work.
                    </p>
                    {/* Email Form */}
                    <form
                      className='gap-3 py-1 max-sm:space-y-2 sm:flex sm:flex-row'
                      onSubmit={async e => {
                        e.preventDefault()
                        const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value
                        const btn = (e.currentTarget.querySelector('button') as HTMLButtonElement)
                        btn.textContent = 'Subscribing...'
                        try {
                          await fetch('/api/newsletter', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: { list_id: 1, value: email, subscription_type: 'email' } })
                          })
                          btn.textContent = 'Subscribed!'
                        } catch {
                          btn.textContent = 'Try again'
                        }
                      }}
                    >
                      <Input
                        type='email'
                        name='email'
                        required
                        placeholder='Your email'
                        className='bg-background input-lg flex-1 px-3 text-base'
                      />
                      <Button size='lg' className='text-base max-sm:w-full' type='submit'>
                        Subscribe
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export default CTA
