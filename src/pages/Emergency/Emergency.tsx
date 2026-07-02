import { useNavigate } from 'react-router-dom'
import {
  Phone,
  Users,
  Coffee,
  PersonStanding,
  HeartPulse,
  Flame,
  MapPin,
  FileText,
  AlertTriangle,
} from 'lucide-react'
import PageHeader from '../../components/Layout/PageHeader'

const emergencies = [
  { type: 'choking', label: '噎食', icon: Coffee, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  { type: 'fall', label: '跌倒', icon: PersonStanding, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  { type: 'cardiac', label: '心脏骤停', icon: HeartPulse, color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20' },
  { type: 'burn', label: '烫伤', icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
  { type: 'lost', label: '走失', icon: MapPin, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
]

export default function Emergency() {
  const navigate = useNavigate()

  return (
    <div className="min-h-full flex flex-col">
      <PageHeader
        title="应急中心"
        subtitle="紧急情况不要慌，跟着步骤来"
      />

      <div className="flex-1 px-5 pt-2 pb-40">
        {/* 重要提醒 */}
        <div className="bg-accent/10 border border-accent/20 rounded-card p-4 mb-5 flex items-start gap-3">
          <AlertTriangle size={22} className="text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-accent mb-1">遇到紧急情况</p>
            <p className="text-sm text-text-secondary">
              请先拨打 <span className="font-semibold text-accent">120</span>，再根据指导进行急救
            </p>
          </div>
        </div>

        {/* 一键呼叫区 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button className="bg-accent text-white rounded-card p-4 flex flex-col items-center justify-center active:bg-accent/90 transition-colors">
            <Phone size={28} className="mb-2" strokeWidth={1.5} />
            <span className="font-semibold">呼叫 120</span>
            <span className="text-xs opacity-80 mt-0.5">紧急救援</span>
          </button>
          <button className="bg-white border border-border rounded-card p-4 flex flex-col items-center justify-center active:bg-sand-light/30 transition-colors">
            <Users size={28} className="text-primary mb-2" strokeWidth={1.5} />
            <span className="font-medium text-text-main">联系家人</span>
            <span className="text-xs text-text-muted mt-0.5">一键通知</span>
          </button>
        </div>

        {/* 急救场景 */}
        <div className="mb-5">
          <h3 className="text-base font-medium text-text-main mb-3 px-1">选择急救场景</h3>
          <div className="grid grid-cols-3 gap-3">
            {emergencies.map(e => {
              const Icon = e.icon
              return (
                <button
                  key={e.type}
                  onClick={() => navigate(`/emergency/${e.type}`)}
                  className={`${e.bg} ${e.border} border rounded-card p-4 flex flex-col items-center justify-center active:scale-95 transition-transform`}
                >
                  <Icon size={28} className={`${e.color} mb-2`} strokeWidth={1.5} />
                  <span className={`text-sm font-medium ${e.color}`}>{e.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 家庭应急预案 */}
        <div className="bg-white border border-border rounded-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-primary" />
              <span className="font-medium text-text-main">家庭应急预案</span>
            </div>
            <button className="text-sm text-primary">编辑</button>
          </div>
          <ul className="text-sm text-text-secondary space-y-2">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-text-muted mt-2 flex-shrink-0" />
              <span>最近医院地址：XX医院（步行5分钟）</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-text-muted mt-2 flex-shrink-0" />
              <span>紧急联系人：儿子 138****8888</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-text-muted mt-2 flex-shrink-0" />
              <span>过敏药物：青霉素、头孢</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-text-muted mt-2 flex-shrink-0" />
              <span>常备急救物品位置：客厅电视柜第一个抽屉</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 底部固定120按钮 */}
      <div className="fixed bottom-[80px] left-1/2 -translate-x-1/2 w-full max-w-md px-5 z-40">
        <button className="w-full py-4 bg-accent text-white rounded-card font-semibold text-lg flex items-center justify-center gap-2 active:bg-accent/90 transition-colors shadow-lg shadow-accent/30">
          <Phone size={22} />
          一键呼叫 120
        </button>
      </div>
    </div>
  )
}
