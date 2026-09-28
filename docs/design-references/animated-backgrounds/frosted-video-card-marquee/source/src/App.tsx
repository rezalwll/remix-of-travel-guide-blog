import { ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'

const logos = [
  {
    src: 'https://svgl.app/library/procure.svg',
    alt: 'Procure',
    gradient: { from: '#60a5fa', to: '#2563eb' },
  },
  {
    src: 'https://svgl.app/library/shopify.svg',
    alt: 'Shopify',
    gradient: { from: '#fde68a', to: '#f59e0b' },
  },
  {
    src: 'https://svgl.app/library/blender.svg',
    alt: 'Blender',
    gradient: { from: '#7dd3fc', to: '#2563eb' },
  },
  {
    src: 'https://svgl.app/library/figma.svg',
    alt: 'Figma',
    gradient: { from: '#d8b4fe', to: '#7c3aed' },
  },
  {
    src: 'https://svgl.app/library/spotify.svg',
    alt: 'Spotify',
    gradient: { from: '#f9a8d4', to: '#ef4444' },
  },
  {
    src: 'https://svgl.app/library/lottielab.svg',
    alt: 'Lottielab',
    gradient: { from: '#fde68a', to: '#84cc16' },
  },
  {
    src: 'https://svgl.app/library/google-cloud.svg',
    alt: 'Google Cloud',
    gradient: { from: '#e0f2fe', to: '#7dd3fc' },
  },
  {
    src: 'https://svgl.app/library/bing.svg',
    alt: 'Bing',
    gradient: { from: '#67e8f9', to: '#0d9488' },
  },
]

function Marquee() {
  return (
    <section className="mt-10 w-full overflow-hidden" aria-label="Technology partners">
      <div className="marquee-mask group/marquee overflow-hidden">
        <div className="marquee-track flex w-max group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className="flex shrink-0 gap-4 pr-4"
              aria-hidden={copy === 1}
            >
              {logos.map((logo) => (
                <div
                  key={`${copy}-${logo.alt}`}
                  className="group relative h-24 w-40 shrink-0 flex items-center justify-center rounded-full bg-white border border-slate-200/60 shadow-sm hover:border-slate-300 transition-all overflow-hidden"
                >
                  <div
                    className="absolute inset-0 scale-150 opacity-0 transition-all duration-500 ease-out group-hover:scale-100 group-hover:opacity-100"
                    style={{
                      background: `linear-gradient(135deg, ${logo.gradient.from}, ${logo.gradient.to})`,
                    }}
                  />
                  <img
                    className="relative z-10 max-h-8 w-auto max-w-[92px] transition-all duration-300 group-hover:brightness-0 group-hover:invert"
                    src={logo.src}
                    alt={copy === 0 ? logo.alt : ''}
                    loading="lazy"
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function App() {
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen overflow-hidden px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-10">
      <section className="relative w-full max-w-[1400px] mx-auto rounded-[48px] bg-white border border-slate-200/50 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.03)] overflow-hidden h-[600px] flex flex-col">
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
          <video
            className="w-full h-full object-cover scale-105 transition-transform duration-1000"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260505_101331_74f9b798-3f00-4e86-8a01-377aa16ffeaa.mp4"
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
          />
        </div>

        <div className="relative z-20 flex-1 px-8 md:px-16 pt-12 md:pt-16 flex flex-col items-start">
          <motion.div
            className="flex max-w-[530px] flex-col items-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-display text-[42px] md:text-[56px] font-medium leading-[0.96] tracking-[-0.045em] text-[#0a1b33]">
              Foundation of the<br />new digital epoch
            </h1>
            <p className="mt-6 max-w-[490px] font-sans text-[14px] md:text-[15px] leading-relaxed text-[#64748b]">
              Designing products, powering ecosystems and laying the foundation of a decentralized web for enterprises, builders and communities alike.
            </p>
            <motion.button
              id="contact"
              type="button"
              onClick={scrollToContact}
              className="mt-8 rounded-full bg-[#0a152d] px-6 py-3 font-sans text-[13px] font-semibold text-white shadow-lg shadow-slate-950/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0a152d]"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 24 }}
            >
              Contact Us
            </motion.button>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30">
          <motion.nav
            aria-label="Primary navigation"
            className="flex items-center bg-white/90 backdrop-blur-2xl px-1.5 py-1.5 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-slate-200/40"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <a
              href="#"
              className="flex w-9 h-9 shrink-0 items-center justify-center rounded-full bg-white border border-slate-100 shadow-sm text-[#0a1b33]"
              aria-label="Home"
            >
              <span aria-hidden="true">✦</span>
            </a>
            <a
              href="#products"
              className="px-4 py-2 text-[12px] font-semibold text-slate-500 hover:text-[#0a1b33] transition-colors"
            >
              Products
            </a>
            <a
              href="#docs"
              className="px-4 py-2 text-[12px] font-semibold text-slate-500 hover:text-[#0a1b33] transition-colors"
            >
              Docs
            </a>
            <button
              type="button"
              onClick={scrollToContact}
              className="flex items-center gap-1 bg-white px-5 py-2 rounded-full text-[12px] font-semibold text-[#0a1b33] border border-slate-200/60 shadow-sm hover:border-slate-300 transition-all whitespace-nowrap"
            >
              Get in touch
              <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.25} />
            </button>
          </motion.nav>
        </div>
      </section>

      <Marquee />
    </main>
  )
}

export default App