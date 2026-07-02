interface Props {
  title: string
  subtitle?: string
  rightAction?: React.ReactNode
  showBack?: boolean
  onBack?: () => void
}

export default function PageHeader({ title, subtitle, rightAction, showBack, onBack }: Props) {
  return (
    <div className="sticky top-0 z-30 bg-warm-bg/95 backdrop-blur-sm border-b border-border/50">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={onBack}
              className="w-9 h-9 -ml-2 rounded-full flex items-center justify-center text-text-secondary active:bg-black/5"
              aria-label="返回"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          <div>
            <h1 className="text-xl font-semibold text-text-main">{title}</h1>
            {subtitle && <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {rightAction}
      </div>
    </div>
  )
}
