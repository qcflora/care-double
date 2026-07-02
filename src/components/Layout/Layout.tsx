import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Home, Users, AlertCircle, User, Wind } from 'lucide-react'
import { useState } from 'react'
import FloatingBreatheButton from './FloatingBreatheButton'
import BreatheModal from './BreatheModal'

const tabs = [
  { path: '/today', label: '今日照护', icon: Home },
  { path: '/circle', label: '照护圈', icon: Users },
  { path: '/emergency', label: '应急中心', icon: AlertCircle },
  { path: '/health', label: '健康档案', icon: User },
]

const hideTabPages = ['/onboarding', '/guide', '/breathe', '/handoff', '/assessment', '/multimodal']

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [breatheOpen, setBreatheOpen] = useState(false)

  const shouldHideTabs = hideTabPages.some(p => location.pathname.includes(p))

  const isActive = (path: string) => location.pathname.startsWith(path)

  return (
    <div className="h-full flex flex-col relative">
      <main className="flex-1 overflow-y-auto pb-[80px]">
        <Outlet />
      </main>

      {!shouldHideTabs && (
        <>
          <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-border z-50">
            <div className="flex justify-around items-center h-[72px] px-2 pb-[env(safe-area-inset-bottom)]">
              {tabs.map(tab => {
                const Icon = tab.icon
                const active = isActive(tab.path)
                return (
                  <button
                    key={tab.path}
                    onClick={() => navigate(tab.path)}
                    className="flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-[60px]"
                  >
                    <Icon
                      size={22}
                      strokeWidth={active ? 2.5 : 2}
                      className={active ? 'text-primary' : 'text-text-secondary'}
                    />
                    <span className={`text-[12px] ${active ? 'text-primary font-medium' : 'text-text-secondary'}`}>
                      {tab.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </nav>

          <FloatingBreatheButton onClick={() => setBreatheOpen(true)} />
        </>
      )}

      <BreatheModal open={breatheOpen} onClose={() => setBreatheOpen(false)} />
    </div>
  )
}
