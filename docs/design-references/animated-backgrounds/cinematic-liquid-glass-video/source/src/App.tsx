import { Button } from '@/components/ui/button'

const navItems = ['Home', 'Studio', 'About', 'Journal', 'Reach Us']

function App() {
  return (
    <main className="relative isolate min-h-svh overflow-hidden bg-background text-foreground">
      <video
        className="absolute inset-0 z-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
          type="video/mp4"
        />
      </video>

      <div className="relative z-10 flex min-h-svh flex-col">
        <header className="mx-auto flex w-full max-w-7xl flex-row items-center justify-between px-6 py-6 sm:px-8">
          <a
            href="#home"
            className="text-3xl tracking-tight text-foreground"
            style={{ fontFamily: "'Instrument Serif', serif" }}
            aria-label="Velorah home"
          >
            Velorah<sup className="text-xs">®</sup>
          </a>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
            {navItems.map((item) => (
              <a
                key={item}
                href={item === 'Home' ? '#home' : `#${item.toLowerCase().replace(' ', '-')}`}
                className={`text-sm transition-colors hover:text-foreground ${
                  item === 'Home' ? 'text-foreground' : 'text-muted-foreground'
                }`}
                aria-current={item === 'Home' ? 'page' : undefined}
              >
                {item}
              </a>
            ))}
          </nav>

          <Button variant="glass" size="nav">
            Begin Journey
          </Button>
        </header>

        <section
          id="home"
          className="mx-auto flex w-full max-w-[100rem] flex-1 flex-col items-center justify-center px-6 py-[90px] pb-40 pt-32 text-center"
        >
          <h1
            className="animate-fade-rise max-w-7xl text-5xl font-normal leading-[0.95] tracking-[-2.46px] text-foreground sm:text-7xl md:text-8xl"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Where <em className="not-italic text-muted-foreground">dreams</em> rise{' '}
            <em className="not-italic text-muted-foreground">through the silence.</em>
          </h1>

          <p className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            We&apos;re designing tools for deep thinkers, bold creators, and quiet rebels.
            Amid the chaos, we build digital spaces for sharp focus and inspired work.
          </p>

          <Button variant="glass" size="hero" className="animate-fade-rise-delay-2 mt-12">
            Begin Journey
          </Button>
        </section>
      </div>
    </main>
  )
}

export default App
