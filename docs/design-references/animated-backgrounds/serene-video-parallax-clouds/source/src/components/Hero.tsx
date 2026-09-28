import { useEffect, useState } from 'react'
import { Button } from './Button'

const navItems = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Journal', href: '#journal' },
  { label: 'Contact', href: '#contact' },
]

const heroVideo =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260613_180732_a54afbf6-b30d-470e-861f-669871f09f67.mp4'

export function Hero() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <section
      className="relative h-screen min-h-[620px] overflow-hidden bg-[#0a0608]"
      id="top"
    >
      <video
        aria-hidden="true"
        autoPlay
        className="absolute inset-0 h-full w-full object-cover"
        loop
        muted
        playsInline
        src={heroVideo}
      />
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,3,5,0.25)_0%,transparent_32%,rgba(5,2,4,0.28)_100%)]" />

      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-5 md:px-12">
        <a
          aria-label="Serene home"
          className="relative z-[60] font-['Dancing_Script'] text-2xl font-medium text-white md:text-3xl"
          href="#top"
          onClick={closeMenu}
        >
          Serene
        </a>

        <nav
          aria-label="Primary navigation"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 md:flex lg:gap-12"
        >
          {navItems.map((item) => (
            <a
              className="text-sm tracking-wide text-white/80 transition-colors hover:text-white"
              href={item.href}
              key={item.label}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button href="#contact">Book a consultation</Button>
        </div>

        <button
          aria-controls="mobile-menu"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="relative z-[60] flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/10 backdrop-blur-md md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          <span className="relative block h-5 w-6">
            <span
              className={`absolute left-0 top-0 block h-px w-6 bg-white transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                menuOpen ? 'translate-y-[9px] rotate-45' : ''
              }`}
            />
            <span
              className={`absolute left-0 top-[9px] block h-px w-6 bg-white transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                menuOpen ? 'scale-0 opacity-0' : ''
              }`}
            />
            <span
              className={`absolute left-0 top-[18px] block h-px w-6 bg-white transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                menuOpen ? '-translate-y-[9px] -rotate-45' : ''
              }`}
            />
          </span>
        </button>
      </header>

      <button
        aria-label="Close navigation menu"
        className={`fixed inset-0 z-40 bg-black/35 transition-opacity duration-500 md:hidden ${
          menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeMenu}
        tabIndex={menuOpen ? 0 : -1}
        type="button"
      />

      <aside
        aria-hidden={!menuOpen}
        className={`fixed bottom-0 right-0 top-0 z-40 flex w-[85%] max-w-[340px] flex-col border-l border-white/10 bg-[#0a0608]/95 px-8 pb-9 pt-28 backdrop-blur-xl transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        id="mobile-menu"
      >
        <nav aria-label="Mobile navigation" className="flex flex-col">
          {navItems.map((item, index) => (
            <a
              className={`border-b border-white/10 py-5 font-instrument text-3xl text-white transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                menuOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
              }`}
              href={item.href}
              key={item.label}
              onClick={closeMenu}
              style={{ transitionDelay: menuOpen ? `${150 + index * 75}ms` : '0ms' }}
              tabIndex={menuOpen ? 0 : -1}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <Button
          className={`mt-auto w-full transition-[opacity,transform,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
          }`}
          href="#contact"
          onClick={closeMenu}
          tabIndex={menuOpen ? 0 : -1}
        >
          Book a consultation
        </Button>
      </aside>

      <div className="absolute inset-0 z-10 flex -translate-y-[60px] flex-col items-center justify-center px-6 md:-translate-y-[120px]">
        <h1 className="text-glow max-w-[1100px] text-center font-instrument text-[36px] leading-[0.9] tracking-tight text-white md:text-7xl lg:text-[110px]">
          Gentle touch. Radiant presence.
        </h1>
        <p className="mt-5 max-w-xl text-center text-sm leading-relaxed text-white/70 md:mt-7 md:text-base">
          Expert beauty and holistic wellness, delivered with warmth and intention.
        </p>
        <Button className="mt-6 md:mt-9" href="#about">
          Begin your renewal
        </Button>
      </div>

      <div className="absolute bottom-8 left-8 z-20 hidden items-center gap-3 md:flex">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20">
          <span className="h-px w-3 bg-white/70" />
        </div>
        <p className="text-xs leading-[1.35] text-white/60">
          Experience
          <br />
          with sound
        </p>
      </div>
    </section>
  )
}
