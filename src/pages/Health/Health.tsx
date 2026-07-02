import { useNavigate } from 'react-router-dom'
import {
  User,
  Pill,
  Activity,
  FileText,
  ChevronRight,
  Calendar,
  TrendingUp,
  Printer,
  Heart,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import PageHeader from '../../components/Layout/PageHeader'

export default function Health() {
  const navigate = useNavigate()
  const { elder, completedTaskIds, breatheSessions } = useApp()

  const stats = [
    { label: '用药依从率', value: '92%', icon: Pill, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '任务完成率', value: `${Math.round((completedTaskIds.length / 7) * 100)}%`, icon: Activity, color: 'text-primary', bg: 'bg-primary/10' },
    { label: '异常事件', value: '1次', icon: TrendingUp, color: 'text-accent', bg: 'bg-accent/10' },
    { label: '心理支持', value: `${breatheSessions}次`, icon: Heart, color: 'text-lavender', bg: 'bg-lavender/20' },
  ]

  const weeklyData = [
    { day: '周一', load: 65 },
    { day: '周二', load: 72 },
    { day: '周三', load: 58 },
    { day: '周四', load: 80 },
    { day: '周五', load: 60 },
    { day: '周六', load: 45 },
    { day: '周日', load: 55 },
  ]

  return (
    <div className="min-h-full">
      <PageHeader title="健康档案" subtitle={`${elder.name}的健康记录`} />

      <div className="px-5 pb-6 space-y-5">
        {/* 老人基本信息 */}
        <div className="bg-white border border-border rounded-card p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-sand-light flex items-center justify-center">
              <User size={32} className="text-text-secondary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-semibold text-text-main">{elder.name}</h2>
                <span className="text-xs px-2 py-0.5 bg-sand-light text-text-secondary rounded-full">
                  {elder.careLevel}
                </span>
              </div>
              <p className="text-sm text-text-secondary">
                {elder.age}岁 · {elder.gender}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-text-muted mb-2">基础疾病</p>
            <div className="flex flex-wrap gap-2">
              {elder.conditions.map(c => (
                <span key={c} className="text-xs px-2.5 py-1 bg-sand-light text-text-secondary rounded-full">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 本月概览 */}
        <div>
          <h3 className="text-base font-medium text-text-main mb-3 px-1">本月健康概览</h3>
          <div className="grid grid-cols-2 gap-3">
            {stats.map(s => {
              const Icon = s.icon
              return (
                <div key={s.label} className="bg-white border border-border rounded-card p-4">
                  <div className={`w-10 h-10 rounded-full ${s.bg} flex items-center justify-center mb-2`}>
                    <Icon size={20} className={s.color} />
                  </div>
                  <p className="text-2xl font-semibold text-text-main">{s.value}</p>
                  <p className="text-xs text-text-muted mt-0.5">{s.label}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* 照护负荷趋势 */}
        <div className="bg-white border border-border rounded-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-text-main">照护负荷趋势</h3>
            <span className="text-xs text-text-muted">近7天</span>
          </div>
          <div className="h-32 flex items-end justify-between gap-2 px-2">
            {weeklyData.map(d => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className={`w-full rounded-t-md transition-all duration-500 ${d.load > 70 ? 'bg-accent/70' : d.load > 55 ? 'bg-amber-400/70' : 'bg-success/70'}`}
                  style={{ height: `${d.load}%` }}
                />
                <span className="text-[10px] text-text-muted">{d.day}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-success/70" />
              <span className="text-xs text-text-muted">轻松</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
              <span className="text-xs text-text-muted">适中</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-accent/70" />
              <span className="text-xs text-text-muted">较重</span>
            </div>
          </div>
        </div>

        {/* 功能入口 */}
        <div className="bg-white border border-border rounded-card divide-y divide-border">
          <button
            onClick={() => navigate('/assessment')}
            className="w-full flex items-center gap-3 p-4 active:bg-sand-light/30 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-text-main">月度健康评估</p>
              <p className="text-sm text-text-muted mt-0.5">上次评估：2026年6月15日</p>
            </div>
            <ChevronRight size={20} className="text-text-muted" />
          </button>

          <button className="w-full flex items-center gap-3 p-4 active:bg-sand-light/30 transition-colors text-left">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Pill size={20} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-text-main">用药管理</p>
              <p className="text-sm text-text-muted mt-0.5">{elder.medications.length} 种长期用药</p>
            </div>
            <ChevronRight size={20} className="text-text-muted" />
          </button>

          <button className="w-full flex items-center gap-3 p-4 active:bg-sand-light/30 transition-colors text-left">
            <div className="w-10 h-10 rounded-full bg-lavender/20 flex items-center justify-center">
              <Printer size={20} className="text-lavender" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-text-main">导出/打印报告</p>
              <p className="text-sm text-text-muted mt-0.5">生成纸质版健康档案</p>
            </div>
            <ChevronRight size={20} className="text-text-muted" />
          </button>

          <button className="w-full flex items-center gap-3 p-4 active:bg-sand-light/30 transition-colors text-left">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
              <Calendar size={20} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-text-main">复诊提醒</p>
              <p className="text-sm text-text-muted mt-0.5">下次复诊：7月15日 心内科</p>
            </div>
            <ChevronRight size={20} className="text-text-muted" />
          </button>
        </div>
      </div>
    </div>
  )
}
