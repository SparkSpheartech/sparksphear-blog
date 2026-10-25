import { cn } from '@/lib/utils'

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src='/brand/logo.png' alt='SPARKSPHEAR logo' className='size-8 rounded-lg' />
      <span className='text-foreground text-[20px] font-semibold tracking-tight'>THE SPARK</span>
    </div>
  )
}

export default Logo
