import type { MouseEventHandler, ReactNode } from 'react'

type ButtonProps = {
  children: ReactNode
  className?: string
  href?: string
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>
  tabIndex?: number
}

const buttonClasses =
  'button-glow inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-medium tracking-wide text-black transition-all duration-300 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black'

export function Button({
  children,
  className = '',
  href,
  onClick,
  tabIndex,
}: ButtonProps) {
  const classes = `${buttonClasses} ${className}`.trim()

  if (href) {
    return (
      <a
        className={classes}
        href={href}
        onClick={onClick}
        tabIndex={tabIndex}
      >
        {children}
      </a>
    )
  }

  return (
    <button
      className={classes}
      onClick={onClick}
      tabIndex={tabIndex}
      type="button"
    >
      {children}
    </button>
  )
}
