import { useEffect, useRef } from 'react'

const rainbowImage =
  'https://soft-zoom-63098134.figma.site/_assets/v11/8d520a7515d06cbfc403d0125e3d05b1a7ccd29c.png'
const cloudImage =
  'https://soft-zoom-63098134.figma.site/_assets/v11/0d6dfd3f90b930f21726f2ed56a3320d79b7a797.png'

const clamp = (minimum: number, maximum: number, value: number) =>
  Math.min(maximum, Math.max(minimum, value))

const lerp = (current: number, target: number, factor: number) =>
  current + (target - current) * factor

export function QuoteSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const rainbowRef = useRef<HTMLImageElement>(null)
  const leftCloudRef = useRef<HTMLImageElement>(null)
  const rightCloudRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const state = {
      rainbowY: 120,
      leftX: -200,
      rightX: 200,
      cloudY: 0,
    }
    let frameId = 0

    const render = () => {
      const section = sectionRef.current
      const rainbow = rainbowRef.current
      const leftCloud = leftCloudRef.current
      const rightCloud = rightCloudRef.current

      if (!section || !rainbow || !leftCloud || !rightCloud) return

      const rect = section.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const progress = clamp(
        0,
        1,
        (windowHeight - rect.top) / (windowHeight + rect.height),
      )
      const cloudsInView = progress >= 0.12 && progress <= 0.92
      const targetLeftX = cloudsInView ? 0 : -200
      const targetRightX = cloudsInView ? 0 : 200
      const targetRainbowY = 120 + progress * -280
      const targetCloudY = progress * -50

      if (reducedMotion.matches) {
        state.rainbowY = targetRainbowY
        state.leftX = 0
        state.rightX = 0
        state.cloudY = targetCloudY
      } else {
        state.rainbowY = lerp(state.rainbowY, targetRainbowY, 0.06)
        state.leftX = lerp(state.leftX, targetLeftX, 0.04)
        state.rightX = lerp(state.rightX, targetRightX, 0.04)
        state.cloudY = lerp(state.cloudY, targetCloudY, 0.04)
      }

      const leftOpacity = clamp(0, 1, 1 - Math.abs(state.leftX) / 200)
      const rightOpacity = clamp(0, 1, 1 - Math.abs(state.rightX) / 200)

      rainbow.style.transform = `translate3d(0, ${state.rainbowY}px, 0)`
      leftCloud.style.transform = `translate3d(${state.leftX}px, ${state.cloudY}px, 0)`
      rightCloud.style.transform = `translate3d(${state.rightX}px, ${state.cloudY}px, 0) scaleX(-1)`
      leftCloud.style.opacity = `${leftOpacity}`
      rightCloud.style.opacity = `${rightOpacity}`

      frameId = window.requestAnimationFrame(render)
    }

    frameId = window.requestAnimationFrame(render)

    return () => window.cancelAnimationFrame(frameId)
  }, [])

  return (
    <section
      className="relative flex h-screen min-h-[640px] items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#010A17_0%,#0A4267_30%,#20658E_60%,#6BADC4_100%)] px-6"
      id="about"
      ref={sectionRef}
    >
      <img
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-30 w-full select-none will-change-transform"
        ref={rainbowRef}
        src={rainbowImage}
      />

      <img
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[10%] left-0 z-10 ml-[-50%] hidden w-[500px] select-none opacity-0 will-change-transform sm:block md:w-[650px]"
        ref={leftCloudRef}
        src={cloudImage}
        style={{ transform: 'translate3d(-200px, 0, 0)' }}
      />
      <img
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[15%] right-0 z-10 mr-[-75%] hidden w-[500px] select-none opacity-0 will-change-transform sm:block md:w-[650px]"
        ref={rightCloudRef}
        src={cloudImage}
        style={{ transform: 'translate3d(200px, 0, 0) scaleX(-1)' }}
      />

      <div className="relative z-20 mx-auto max-w-4xl text-center">
        <blockquote>
          <p className="font-instrument text-xl leading-[1.45] text-white sm:text-2xl md:text-4xl md:leading-[1.5] lg:text-[42px]">
            &ldquo;Serene was founded on a belief in beauty that honors your nature. We pursue refined outcomes, considered approaches, and lasting vitality. We spend time learning what matters to you before deciding what serves you best. No rushing, no excess &mdash; just support that lets you feel radiant.&rdquo;
          </p>
          <footer className="mt-6 text-sm tracking-wide text-white/80 md:mt-8 md:text-base">
            Dr. Mia Callahan &mdash; Founder
          </footer>
        </blockquote>
      </div>
    </section>
  )
}
