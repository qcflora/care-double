import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Pill,
  RotateCw,
  Utensils,
  Bath,
  Activity,
  Footprints,
  Check,
  Volume2,
  ChevronRight,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Wind,
  RefreshCw,
  Users,
  Heart,
  Sparkles,
  ArrowRight,
  Clock,
  AlertTriangle,
  Phone,
  Settings,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import TaskManagerModal from '../../components/TaskManagerModal'

const taskIcons: Record<string, typeof Pill> = {
  medication: Pill,
  turning: RotateCw,
  feeding: Utensils,
  hygiene: Bath,
  vitals: Activity,
  activity: Footprints,
}

const periodLabels: Record<string, { label: string; icon: typeof Sun; color: string }> = {
  morning: { label: '早晨', icon: Sunrise, color: 'text-ochre' },
  noon: { label: '中午', icon: Sun, color: 'text-ochre' },
  evening: { label: '下午', icon: Sunset, color: 'text-ochre' },
  night: { label: '晚间', icon: Moon, color: 'text-neutral-500' },
}

function CareLoadRing({ progress, label }: { progress: number; label: string }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="relative w-[90px] h-[90px] flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 90 90">
        <circle
          cx="45" cy="45" r={radius}
          fill="none"
          stroke="#dcf3e6"
          strokeWidth="7"
        />
        <circle
          cx="45" cy="45" r={radius}
          fill="none"
          stroke="#3aaa82"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-semibold text-jade-dark font-display">{Math.round(progress)}%</span>
        <span className="text-[10px] text-neutral-500">{label}</span>
      </div>
    </div>
  )
}

// 双环模型可视化 - 文字融合在图上
function DoubleRingDiagram() {
  return (
    <div className="relative w-full flex items-center justify-center py-2">
      <div className="relative w-[220px] h-[220px]">
        {/* 外环 */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: '2px dashed #f4c682',
            background: 'linear-gradient(135deg, rgba(244,198,130,0.08), transparent)',
          }}
        />
        {/* 外环标签 - 顶部 */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-1 rounded-full border border-ochre-light flex items-center gap-1.5 shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-ochre" />
          <span className="text-xs font-medium text-ochre-dark">外环 · 智慧协同</span>
        </div>

        {/* 内环 */}
        <div
          className="absolute inset-[44px] rounded-full"
          style={{
            border: '2px solid #e4912a',
            background: 'linear-gradient(135deg, #fef5e4, #fffdf8)',
          }}
        />
        {/* 内环标签 - 底部 */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-white px-3 py-1 rounded-full border border-primary flex items-center gap-1.5 shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="text-xs font-medium text-primary-dark">内环 · 心理支持</span>
        </div>

        {/* 中心内容 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center w-[100px]">
          <div className="w-10 h-10 rounded-full bg-primary-lightest flex items-center justify-center mb-1">
            <Heart size={18} className="text-primary" />
          </div>
          <span className="text-[11px] text-neutral-500 leading-tight">照顾好自己</span>
          <span className="text-[11px] text-neutral-500 leading-tight">才能照顾爱的人</span>
        </div>

        {/* 外环上的角色点 */}
        <div className="absolute top-[10%] right-[5%] w-7 h-7 rounded-full bg-ochre-lighter flex items-center justify-center border-2 border-white shadow-sm">
          <Users size={12} className="text-ochre-dark" />
        </div>
        <div className="absolute bottom-[15%] right-[3%] w-7 h-7 rounded-full bg-ochre-lighter flex items-center justify-center border-2 border-white shadow-sm">
          <Phone size={12} className="text-ochre-dark" />
        </div>
        <div className="absolute bottom-[15%] left-[3%] w-7 h-7 rounded-full bg-ochre-lighter flex items-center justify-center border-2 border-white shadow-sm">
          <Users size={12} className="text-ochre-dark" />
        </div>
        <div className="absolute top-[10%] left-[5%] w-7 h-7 rounded-full bg-ochre-lighter flex items-center justify-center border-2 border-white shadow-sm">
          <Users size={12} className="text-ochre-dark" />
        </div>
      </div>
    </div>
  )
}

export default function Today() {
  const navigate = useNavigate()
  const { tasks, loadLevel, breatheSessions, elder, resetData, caregivers, handoffs } = useApp()
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showTaskManager, setShowTaskManager] = useState(false)

  const loadText = loadLevel === 'low' ? '轻松' : loadLevel === 'medium' ? '适中' : '较重'
  const onDutyCaregiver = caregivers.find(c => c.isOnDuty)
  const latestHandoff = handoffs[0]

  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.period]) acc[task.period] = []
    acc[task.period].push(task)
    return acc
  }, {} as Record<string, typeof tasks>)

  const completedCount = tasks.filter(t => t.completed).length
  const totalCount = tasks.length
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const handleStartGuide = (taskId: string) => {
    navigate(`/guide/${taskId}`)
  }

  return (
    <div className="min-h-full bg-warm-bg pb-6">
      <div
        className="relative px-5 pt-8 pb-6"
        style={{
          background: 'linear-gradient(135deg, #f5e2c5 0%, #fdf9f1 50%, #fefdfb 100%)',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-500 mb-1">你好，</p>
            <h1 className="text-2xl font-semibold text-neutral-900 font-display">
              {elder.name}的照护者
            </h1>
            <p className="text-sm text-neutral-500 mt-1">今天是个好日子</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-lg font-display">
              {elder.name.charAt(0)}
            </div>
            <div className="px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm text-xs text-neutral-600 border border-neutral-200">
              今日已完成 {completedCount}/{totalCount} 项
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-2 space-y-4">
        {/* 双环理念卡 - 图文融合版 */}
        <div
          className="rounded-card p-5 shadow-md"
          style={{
            background: 'linear-gradient(135deg, #fdf9f1, #ffffff)',
            border: '1px solid #e7e3dc',
          }}
        >
          <DoubleRingDiagram />
        </div>

        {/* 今日照护负荷 */}
        <div className="bg-white border border-border rounded-card p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-neutral-600">今日照护负荷</span>
                <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                  loadLevel === 'high' ? 'bg-cinnabar-lighter text-cinnabar' :
                  loadLevel === 'medium' ? 'bg-ochre-lighter text-ochre' :
                  'bg-jade-lightest text-jade'
                }`}>
                  {loadText}
                </span>
              </div>
              <p className="text-xs text-neutral-500">心理支持 {breatheSessions} 次</p>
              {loadLevel === 'high' && (
                <div className="mt-3 flex items-start gap-2">
                  <Wind size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-neutral-600">你今天已经很辛苦了，记得照顾好自己</p>
                </div>
              )}
            </div>
            <CareLoadRing progress={progressPercent} label="完成度" />
          </div>
        </div>

        {/* 照护圈动态 */}
        <div
          className="bg-white border border-border rounded-card p-4 shadow-soft cursor-pointer active:bg-neutral-50 transition-colors"
          onClick={() => navigate('/circle')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-primary" />
              <span className="font-medium text-neutral-900 font-display">照护圈动态</span>
            </div>
            <div className="flex items-center gap-1 text-primary text-sm">
              <span>查看全部</span>
              <ChevronRight size={16} />
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex -space-x-2">
              {caregivers.slice(0, 4).map((c, i) => (
                <div
                  key={c.id}
                  className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center ${
                    c.isOnDuty ? 'bg-primary text-white' : 'bg-primary-lightest text-primary-dark'
                  }`}
                  style={{ zIndex: 10 - i }}
                >
                  <span className="text-xs font-medium">{c.name.charAt(0)}</span>
                </div>
              ))}
            </div>
            <div className="flex-1 ml-2">
              <p className="text-sm text-neutral-700">
                现在是 <span className="font-medium text-primary">{onDutyCaregiver?.name}</span> 值班
              </p>
              <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                <Clock size={12} />
                已值班 4小时30分
              </p>
            </div>
          </div>

          {latestHandoff && (
            <div className="pt-3 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-neutral-500 flex items-center gap-1">
                  <Sparkles size={12} className="text-primary" />
                  最近交接
                </span>
                <span className="text-xs text-neutral-400">{latestHandoff.time}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <span className="font-medium">{latestHandoff.fromName}</span>
                <ArrowRight size={14} className="text-neutral-400" />
                <span className="font-medium">{latestHandoff.toName}</span>
                {latestHandoff.abnormalItems.length > 0 && (
                  <span className="ml-auto flex items-center gap-1 text-xs text-cinnabar">
                    <AlertTriangle size={12} />
                    {latestHandoff.abnormalItems.length}项需关注
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 照护间隙推荐卡 - 突出情绪关怀 */}
        {completedCount >= 2 && (
          <div
            className="rounded-card p-5 cursor-pointer active:scale-[0.98] transition-all animate-fade-in-up shadow-md"
            style={{
              background: 'linear-gradient(135deg, #fff8f0 0%, #fff4e6 50%, #fffaf5 100%)',
              border: '2px solid #e4912a',
              boxShadow: '0 4px 20px rgba(228, 145, 42, 0.15)',
            }}
            onClick={() => navigate('/breathe')}
          >
            <div className="flex items-start gap-3">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md">
                  <Heart size={28} className="text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cinnabar flex items-center justify-center shadow-sm">
                  <Sparkles size={10} className="text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-primary-lightest text-primary text-xs font-medium">
                    照护者专属
                  </span>
                  <span className="font-semibold text-neutral-900 font-display">情绪充电站</span>
                </div>
                <div className="text-sm text-neutral-600 leading-relaxed">
                  你已经完成了 {completedCount} 项照护任务，辛苦了！<br />
                  照护者的情绪调整也很重要，花3分钟给自己充个电
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-1">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wind size={18} className="text-primary" />
                </div>
                <ChevronRight size={18} className="text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                  ))}
                </div>
                <span className="text-xs text-neutral-500">3分钟呼吸调节</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); navigate('/breathe') }}
                className="px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-full active:bg-primary-hover transition-colors"
              >
                开始
              </button>
            </div>
          </div>
        )}

        {/* 时间矩阵视图 */}
        <div className="bg-white border border-border rounded-card p-4 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-neutral-900 font-display">今日照护计划</h3>
            <button
              onClick={() => setShowTaskManager(true)}
              className="flex items-center gap-1 text-xs text-primary font-medium px-2.5 py-1 rounded-full bg-primary-lightest/50 hover:bg-primary-lightest transition-colors"
            >
              <Settings size={12} />
              自定义
            </button>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[360px]">
              <div className="grid grid-cols-5 gap-2">
                <div className="h-8 flex items-center text-xs text-neutral-500 font-medium" />
                {Object.entries(periodLabels).map(([period, info]) => (
                  <div key={period} className="h-8 flex items-center justify-center">
                    <div className="flex items-center gap-1">
                      <info.icon size={14} className={info.color} />
                      <span className="text-xs font-medium text-neutral-700">{info.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-2 space-y-1">
                {[
                  { type: 'medication', label: '用药', icon: Pill },
                  { type: 'vitals', label: '测量', icon: Activity },
                  { type: 'turning', label: '翻身', icon: RotateCw },
                  { type: 'feeding', label: '进食', icon: Utensils },
                  { type: 'hygiene', label: '洗漱', icon: Bath },
                  { type: 'activity', label: '活动', icon: Footprints },
                ].map((row) => {
                  const RowIcon = row.icon
                  return (
                    <div key={row.type} className="grid grid-cols-5 gap-2">
                      <div className="h-14 flex items-center gap-2">
                        <RowIcon size={14} className="text-neutral-400" />
                        <span className="text-xs text-neutral-500">{row.label}</span>
                      </div>
                      {Object.keys(periodLabels).map((period) => {
                        const task = tasks.find(t => t.period === period && t.type === row.type)
                        if (!task) {
                          return <div key={period} className="h-14 bg-neutral-50 rounded-lg" />
                        }
                        return (
                          <button
                            key={period}
                            onClick={() => handleStartGuide(task.id)}
                            className={`h-14 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all relative overflow-hidden ${
                              task.completed
                                ? 'bg-jade-lightest/50'
                                : 'bg-primary-lightest border-2 border-primary active:scale-95'
                            }`}
                          >
                            {task.completed ? (
                              <>
                                <Check size={16} className="text-jade" />
                                <span className="text-[10px] text-jade">{task.time}</span>
                              </>
                            ) : (
                              <>
                                <RowIcon size={16} className="text-primary" />
                                <span className="text-[10px] text-primary-dark">{task.time}</span>
                              </>
                            )}
                            {!task.completed && (
                              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-primary animate-pulse-soft" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border">
            <div className="flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-primary-lightest border-2 border-primary" />
                <span className="text-neutral-500">待完成</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-jade-lightest/50" />
                <span className="text-neutral-500">已完成</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-neutral-50" />
                <span className="text-neutral-500">无任务</span>
              </div>
            </div>
          </div>
        </div>

        {/* 应急快接入口 */}
        <div className="bg-white border border-border rounded-card p-4 shadow-soft">
          <div className="flex items-center gap-2 mb-3">
            <Phone size={18} className="text-cinnabar" />
            <span className="font-medium text-neutral-900 font-display">应急支持</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-cinnabar-lighter/50 active:bg-cinnabar-lighter transition-colors"
              onClick={() => navigate('/emergency')}
            >
              <AlertTriangle size={24} className="text-cinnabar" />
              <span className="text-sm font-medium text-cinnabar">噎食急救</span>
            </button>
            <button
              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-ochre-lighter/50 active:bg-ochre-lighter transition-colors"
              onClick={() => navigate('/emergency')}
            >
              <Heart size={24} className="text-ochre" />
              <span className="text-sm font-medium text-ochre">跌倒处理</span>
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowResetConfirm(true)}
          className="w-full flex items-center justify-center gap-2 py-2 text-neutral-400 text-sm active:text-neutral-600 transition-colors"
        >
          <RefreshCw size={16} />
          <span>重新开始体验</span>
        </button>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-6 z-50">
          <div className="bg-white rounded-card p-6 w-full max-w-sm animate-fade-in-up shadow-float">
            <h3 className="text-lg font-semibold text-neutral-900 font-display mb-2">确认重置？</h3>
            <p className="text-neutral-600 text-sm mb-6">重置后所有任务进度和数据将恢复初始状态，可重新体验全部功能。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 rounded-btn border border-border text-neutral-600 font-medium active:bg-neutral-50"
              >
                取消
              </button>
              <button
                onClick={() => { resetData(); setShowResetConfirm(false) }}
                className="flex-1 py-3 rounded-btn bg-primary text-white font-medium active:bg-primary-hover"
              >
                确认重置
              </button>
            </div>
          </div>
        </div>
      )}

      <TaskManagerModal
        isOpen={showTaskManager}
        onClose={() => setShowTaskManager(false)}
      />
    </div>
  )
}
