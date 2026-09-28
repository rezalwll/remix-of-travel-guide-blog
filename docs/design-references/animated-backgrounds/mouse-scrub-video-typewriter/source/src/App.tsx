import { useCallback, useEffect, useRef, useState } from 'react'

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4'
const TYPEWRITER_COPY =
  'Glad you stopped in. Good taste tends to find us. Now, what are we building?'
const EMAIL = 'hello@mainframe.co'
const NAV_LINKS = ['Labs', 'Studio', 'Openings', 'Shop']
const ACTIONS = [
  'Pitch us an idea',
  'Come work here',
  'Send a brief hello',
  'See how we operate',
]

function useTypewriter(text: string, speed = 38, startDelay = 600) {
  const [progress, setProgress] = useState({ text, count: 0 })
  const count = progress.text === text ? progress.count : 0

  useEffect(() => {
    let intervalId: number | undefined

    const delayId = window.setTimeout(() => {
      let characterIndex = 0

      intervalId = window.setInterval(() => {
        characterIndex += 1
        setProgress({ text, count: characterIndex })

        if (characterIndex >= text.length) {
          window.clearInterval(intervalId)
        }
      }, speed)
    }, startDelay)

    return () => {
      window.clearTimeout(delayId)
      if (intervalId !== undefined) window.clearInterval(intervalId)
    }
  }, [text, speed, startDelay])

  return {
    displayed: text.slice(0, count),
    done: count >= text.length,
  }
}

function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const targetTimeRef = useRef(0)
  const isSeekingRef = useRef(false)
  const previousXRef = useRef<number | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [actionsVisible, setActionsVisible] = useState(false)
  const [copied, setCopied] = useState(false)
  const { displayed, done } = useTypewriter(TYPEWRITER_COPY)

  const seekToTarget = useCallback(() => {
    const video = videoRef.current
    if (!video || !Number.isFinite(video.duration) || isSeekingRef.current) return

    if (Math.abs(video.currentTime - targetTimeRef.current) < 0.01) return

    isSeekingRef.current = true
    video.currentTime = targetTimeRef.current
  }, [])

  useEffect(() => {
    const revealId = window.setTimeout(() => setActionsVisible(true), 400)
    return () => window.clearTimeout(revealId)
  }, [])

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const video = videoRef.current
      const previousX = previousXRef.current
      previousXRef.current = event.clientX

      if (previousX === null || !video || !Number.isFinite(video.duration)) return

      const delta = event.clientX - previousX
      const offset = (delta / window.innerWidth) * 0.8 * video.duration
      targetTimeRef.current = Math.min(
        video.duration,
        Math.max(0, targetTimeRef.current + offset),
      )
      seekToTarget()
    }

    const resetPointer = () => {
      previousXRef.current = null
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('blur', resetPointer)
    document.documentElement.addEventListener('mouseleave', resetPointer)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('blur', resetPointer)
      document.documentElement.removeEventListener('mouseleave', resetPointer)
    }
  }, [seekToTarget])

  useEffect(() => {
    if (!menuOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  const handleMetadataLoaded = () => {
    const video = videoRef.current
    if (!video) return

    targetTimeRef.current = video.currentTime
  }

  const handleSeeked = () => {
    const video = videoRef.current
    if (!video) return

    isSeekingRef.current = false
    if (Math.abs(video.currentTime - targetTimeRef.current) >= 0.01) seekToTarget()
  }

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <main className="relative min-h-screen bg-[#9b9186] text-black">
      <video
        ref={videoRef}
        className="fixed inset-0 z-0 h-full w-full object-cover object-[70%_center]"
        src={VIDEO_URL}
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        onLoadedMetadata={handleMetadataLoaded}
        onSeeked={handleSeeked}
      />

      <div
        className={`fixed inset-0 z-[9] flex flex-col justify-center gap-8 bg-white/95 px-8 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!menuOpen}
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase()}`}
            className="w-fit text-[32px] font-medium transition-opacity hover:opacity-60"
            tabIndex={menuOpen ? 0 : -1}
            onClick={() => setMenuOpen(false)}
          >
            {link}
          </a>
        ))}
        <a
          href={`mailto:${EMAIL}`}
          className="w-fit text-[32px] font-medium underline underline-offset-2 transition-opacity hover:opacity-60"
          tabIndex={menuOpen ? 0 : -1}
          onClick={() => setMenuOpen(false)}
        >
          Get in touch
        </a>
      </div>

      <header className="fixed top-0 z-10 flex w-full items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
        <a href="#home" className="flex items-center gap-3" aria-label="Mainframe home">
          <span
            className="text-[21px] leading-none tracking-tight text-black sm:text-[26px]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Mainframe®
          </span>
          <span
            className="select-none text-[25px] leading-none tracking-[-0.02em] text-black sm:text-[30px]"
            aria-hidden="true"
          >
            ✳︎
          </span>
        </a>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center text-[23px] leading-none text-black md:flex" aria-label="Primary navigation">
          {NAV_LINKS.map((link, index) => (
            <span key={link}>
              <a
                href={`#${link.toLowerCase()}`}
                className="transition-opacity hover:opacity-60"
              >
                {link}
              </a>
              {index < NAV_LINKS.length - 1 ? ', ' : ''}
            </span>
          ))}
        </nav>

        <a
          href={`mailto:${EMAIL}`}
          className="hidden text-[23px] leading-none text-black underline underline-offset-2 transition-opacity hover:opacity-60 md:block"
        >
          Get in touch
        </a>

        <button
          type="button"
          className="relative z-10 flex flex-col gap-[5px] p-1 md:hidden"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span
            className={`h-[2px] w-6 bg-black transition-transform duration-300 ${
              menuOpen ? 'translate-y-[7px] rotate-45' : ''
            }`}
          />
          <span
            className={`h-[2px] w-6 bg-black transition-opacity duration-300 ${
              menuOpen ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`h-[2px] w-6 bg-black transition-transform duration-300 ${
              menuOpen ? '-translate-y-[7px] -rotate-45' : ''
            }`}
          />
        </button>
      </header>

      <section
        id="home"
        className="relative z-[1] flex h-screen flex-col justify-end overflow-hidden px-5 pb-12 sm:px-8 md:justify-center md:px-10 md:pb-0"
      >
        <div className="relative z-10 max-w-xl">
          <p
            className="pointer-events-none mb-5 select-none text-black sm:mb-6"
            style={{
              fontSize: 'clamp(18px, 4vw, 26px)',
              lineHeight: 1.3,
              fontWeight: 400,
              filter: 'blur(4px)',
            }}
          >
            Hey there, meet A.R.I.A,
            <br />
            Mainframe&apos;s Adaptive Response Interface Agent
          </p>

          <p
            className="mb-5 min-h-[54px] text-black sm:mb-6"
            aria-label={TYPEWRITER_COPY}
            style={{
              fontSize: 'clamp(18px, 4vw, 26px)',
              lineHeight: 1.35,
              fontWeight: 400,
            }}
          >
            <span aria-hidden="true">{displayed}</span>
            {!done && (
              <span
                className="typewriter-cursor ml-[2px] inline-block h-[1.1em] w-[2px] align-middle bg-black"
                aria-hidden="true"
              />
            )}
          </p>

          <div
            className={`flex flex-wrap gap-y-1 ${
              actionsVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            }`}
            style={{ transition: 'opacity 0.4s ease, transform 0.4s ease' }}
          >
            {ACTIONS.map((action) => (
              <button
                key={action}
                type="button"
                className="mx-[0.2em] mb-[0.4em] inline-flex items-center justify-center whitespace-nowrap rounded-full border border-black/10 bg-white px-4 py-[0.3em] text-[13px] text-black transition-colors duration-200 hover:bg-black hover:text-white sm:px-5 sm:text-[15px]"
              >
                {action}
              </button>
            ))}
            <button
              type="button"
              className="mx-[0.2em] mb-[0.4em] inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white bg-transparent px-4 py-[0.3em] text-[13px] text-white transition-colors duration-200 hover:bg-white hover:text-black sm:gap-3 sm:px-5 sm:text-[15px]"
              onClick={copyEmail}
              aria-label={copied ? 'Email copied' : `Copy ${EMAIL}`}
            >
              <span>
                Reach us: <span className="underline underline-offset-1">{EMAIL}</span>
              </span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <rect x="3.5" y="1.5" width="7" height="7" rx="0.7" stroke="currentColor" />
                <path d="M8.5 9.5V10C8.5 10.55 8.05 11 7.5 11H2C1.45 11 1 10.55 1 10V4.5C1 3.95 1.45 3.5 2 3.5H2.5" stroke="currentColor" />
              </svg>
              <span className="sr-only" aria-live="polite">
                {copied ? 'Copied' : ''}
              </span>
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
