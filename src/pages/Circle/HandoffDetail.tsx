import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Pill,
  Utensils,
  Heart,
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle,
  ListTodo,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'

const modules = [
  { key: 'pendingTasks', label: '待办事项', icon: ListTodo, color: 'text-primary', bg: 'bg-primary/10' },
  { key: 'medicationNotes', label: '用药情况', icon: Pill, color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'dietNotes', label: '饮食情况', icon: Utensils, color: 'text-amber-600', bg: 'bg-amber-50' },
  { key: 'moodNotes', label: '情绪状态', icon: Heart, color: 'text-accent', bg: 'bg-accent/10' },
  { key: 'healthNotes', label: '身体状况', icon: Activity, color: 'text-lavender', bg: 'bg-lavender/10' },
]

export default function HandoffDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { handoffs } = useApp()

  const handoff = handoffs.find(h => h.id === id)

  if (!handoff) {
    return (
      <div className="p-8 text-center text-text-secondary">
        交接记录不存在
        <button onClick={() => navigate(-1)} className="block mx-auto mt-4 text-primary">返回</button>
      </div>
    )
  }

  const contentByKey: Record<string, string | string[]> = {
    pendingTasks: handoff.pendingTasks,
    medicationNotes: handoff.medicationNotes,
    dietNotes: handoff.dietNotes,
    moodNotes: handoff.moodNotes,
    healthNotes: handoff.healthNotes,
  }

  return (
    <div className="min-h-full bg-warm-bg">
      {/* 顶部栏 */}
      <div className="sticky top-0 z-30 bg-warm-bg/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center px-5 py-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-text-secondary">
            <ArrowLeft size={22} />
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold text-text-main">交接详情</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">
        {/* 交接头部信息 */}
        <div className="bg-white border border-border rounded-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="font-medium text-text-main">{handoff.fromName}</span>
              <ArrowLeft size={16} className="text-text-muted rotate-180" />
              <span className="font-medium text-text-main">{handoff.toName}</span>
            </div>
            <CheckCircle size={20} className="text-success" />
          </div>
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Clock size={14} />
            <span>{handoff.time} · 已完成交接</span>
          </div>
        </div>

        {/* 异常提醒 */}
        {handoff.abnormalItems.length > 0 && (
          <div className="bg-accent/10 border border-accent/20 rounded-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={20} className="text-accent" />
              <span className="font-medium text-accent">需要关注</span>
            </div>
            <ul className="space-y-1.5">
              {handoff.abnormalItems.map((item, i) => (
                <li key={i} className="text-sm text-accent/90 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 各模块详情 - 时间线风格 */}
        <div className="space-y-3">
          {modules.map((m, idx) => {
            const Icon = m.icon
            const content = contentByKey[m.key]
            const isAbnormal = m.key === 'healthNotes' && handoff.abnormalItems.length > 0

            return (
              <div key={m.key} className="relative pl-8">
                {/* 时间线 */}
                {idx < modules.length - 1 && (
                  <div className="absolute left-[15px] top-10 bottom-0 w-px bg-border" />
                )}
                {/* 节点 */}
                <div className={`absolute left-0 top-0 w-8 h-8 rounded-full ${m.bg} flex items-center justify-center`}>
                  <Icon size={18} className={m.color} />
                </div>

                <div className={`bg-white border ${isAbnormal ? 'border-accent/30' : 'border-border'} rounded-card p-4`}>
                  <h3 className="font-medium text-text-main mb-2">{m.label}</h3>
                  {Array.isArray(content) ? (
                    <ul className="space-y-2">
                      {content.map((item, i) => (
                        <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-text-muted mt-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-text-secondary leading-relaxed">{content}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* 语音记录入口 */}
        <div className="bg-white border border-border rounded-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sand-light flex items-center justify-center text-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-text-main">交班语音记录</p>
            <p className="text-xs text-text-muted mt-0.5">时长 2分30秒 · 点击播放</p>
          </div>
          <button className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium">
            播放
          </button>
        </div>

        {/* 接班人确认 */}
        <div className="bg-success/10 border border-success/20 rounded-card p-4 flex items-center gap-3">
          <CheckCircle size={20} className="text-success" />
          <div>
            <p className="text-sm font-medium text-success">{handoff.toName} 已确认接班</p>
            <p className="text-xs text-text-muted mt-0.5">所有信息已同步到照护圈</p>
          </div>
        </div>
      </div>
    </div>
  )
}
