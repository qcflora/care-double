import { useNavigate } from 'react-router-dom'
import { Heart, Users, Briefcase, Phone } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { CareRole } from '../../types'

const roles: { role: CareRole; label: string; desc: string; icon: typeof Heart }[] = [
  { role: 'primary', label: '核心照护者', desc: '主要负责日常照护的家人', icon: Heart },
  { role: 'assistant', label: '协助照护者', desc: '亲属、邻里等帮忙照护', icon: Users },
  { role: 'remote', label: '远程子女', desc: '在外地工作，远程关注', icon: Phone },
  { role: 'professional', label: '专业护工/护士', desc: '提供专业照护服务', icon: Briefcase },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { setUserRole } = useApp()

  const handleSelect = (role: CareRole) => {
    setUserRole(role)
    navigate('/today')
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-sand-light via-warm-bg to-warm-bg flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16">
        <div className="relative w-32 h-32 mb-8">
          <div className="absolute inset-0 rounded-full bg-primary/20" />
          <div className="absolute inset-4 rounded-full bg-primary/30" />
          <div className="absolute inset-8 rounded-full bg-primary/50" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Heart size={36} className="text-primary-dark" strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="text-3xl font-semibold text-text-main mb-3 text-center">照护双环</h1>
        <p className="text-text-secondary text-center mb-2">陪你一起照顾最爱的人</p>
        <p className="text-text-muted text-sm text-center mb-12">
          把心理调节嵌入照护间隙
          <br />
          让多人照护成为真正的团队
        </p>

        <div className="w-full space-y-3">
          <p className="text-sm text-text-secondary mb-4 text-center">请选择你的身份</p>
          {roles.map(r => {
            const Icon = r.icon
            return (
              <button
                key={r.role}
                onClick={() => handleSelect(r.role)}
                className="w-full flex items-center gap-4 p-4 bg-white border border-border rounded-card active:bg-sand-light/50 transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-full bg-sand-light flex items-center justify-center text-primary">
                  <Icon size={24} strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-text-main">{r.label}</div>
                  <div className="text-sm text-text-secondary mt-0.5">{r.desc}</div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )
          })}
        </div>
      </div>

      <div className="text-center pb-8 text-xs text-text-muted">
        选择后可以在设置中切换身份
      </div>
    </div>
  )
}
