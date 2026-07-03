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
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import PageHeader from '../../components/Layout/PageHeader'

const taskIcons: Record<string, typeof Pill> = {
  medication: Pill,
  turning: RotateCw,
  feeding: Utensils,
  hygiene: Bath,
  vitals: Activity,
  activity: Footprints,
}

const periodLabels: Record<string, { label: string; icon: typeof Sun }> = {
  morning: { label: '早晨', icon: Sunrise },
  noon: { label: '中午', icon: Sun },
  evening: { label: '下午', icon: Sunset },
  night: { label: '晚间', icon: Moon },
}

export default function Today() {
  const navigate = useNavigate()
  const { tasks, loadLevel, breatheSessions, elder, resetData } = useApp()
  const [showGapCard, setShowGapCard] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const loadColor = loadLevel === 'low' ? 'bg-success' : loadLevel === 'medium' ? 'bg-amber-400' : 'bg-accent'
  const loadText = loadLevel === 'low' ? '轻松' : loadLevel === 'medium' ? '适中' : '较重'
  const loadTip = loadLevel === 'high' ? '你今天已经很辛苦了，记得照顾好自己' : '今天状态不错，继续保持'

  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.period]) acc[task.period] = []
    acc[task.period].push(task)
    return acc
  }, {} as Record<string, typeof tasks>)

  const completedCount = tasks.filter(t => t.completed).length
  const totalCount = tasks.length

  const handleStartGuide = (taskId: string) => {
    navigate(`/guide/${taskId}`)
  }

  const handleBreatheGap = () => {
    setShowGapCard(false)
    navigate('/breathe')
  }

  return (
    <div className="min-h-full">
      <PageHeader
        title={`你好，${elder.name}的照护者`}
        subtitle="今天是个好日子"
      />

      <div className="px-5 pb-6 space-y-5">
        {/* 照护负荷卡片 */}
        <div className="bg-white border border-border rounded-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-text-secondary">今日照护负荷</span>
            <span className={`text-sm font-medium ${loadLevel === 'high' ? 'text-accent' : loadLevel === 'medium' ? 'text-amber-500' : 'text-success'}`}>
              {loadText}
            </span>
          </div>
          <div className="h-2 bg-border rounded-full overflow-hidden mb-3">
            <div
              className={`h-full ${loadColor} rounded-full transition-all duration-500`}
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>已完成 {completedCount}/{totalCount} 项</span>
            <span>心理支持 {breatheSessions} 次</span>
          </div>
          {loadLevel === 'high' && (
            <div className="mt-3 p-3 bg-sand-light rounded-lg flex items-start gap-2">
              <Wind size={18} className="text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-text-secondary">{loadTip}</p>
            </div>
          )}
        </div>

        {/* 照护间隙推荐卡 */}
        {completedCount >= 2 && !showGapCard && (
          <div
            className="bg-gradient-to-r from-primary/10 to-lavender/10 border border-primary/20 rounded-card p-4 cursor-pointer active:opacity-80 transition-opacity animate-fade-in-up"
            onClick={handleBreatheGap}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                <Wind size={24} className="text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-text-main">刚刚辛苦了</div>
                <div className="text-sm text-text-secondary mt-0.5">花3分钟呼吸一下，给自己充个电</div>
              </div>
              <ChevronRight size={20} className="text-text-muted" />
            </div>
          </div>
        )}

        {/* 任务列表 */}
        {Object.entries(periodLabels).map(([period, info]) => {
          const periodTasks = groupedTasks[period]
          if (!periodTasks?.length) return null
          const Icon = info.icon
          return (
            <div key={period}>
              <div className="flex items-center gap-2 mb-3 px-1">
                <Icon size={18} className="text-text-muted" />
                <span className="text-sm font-medium text-text-secondary">{info.label}</span>
              </div>
              <div className="space-y-2">
                {periodTasks.map(task => {
                  const TaskIcon = taskIcons[task.type] || Activity
                  return (
                    <div
                      key={task.id}
                      className={`bg-white border border-border rounded-card p-4 transition-all ${
                        task.completed ? 'opacity-70' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center ${
                          task.completed ? 'bg-success/20 text-success' : 'bg-sand-light text-primary'
                        }`}>
                          {task.completed ? (
                            <Check size={22} strokeWidth={2.5} />
                          ) : (
                            <TaskIcon size={22} strokeWidth={2} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium ${task.completed ? 'text-text-secondary line-through' : 'text-text-main'}`}>
                            {task.title}
                          </div>
                          <div className="text-sm text-text-muted mt-0.5">{task.time}</div>
                        </div>
                        {!task.completed && (
                          <button
                            onClick={() => handleStartGuide(task.id)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-primary/10 text-primary rounded-btn text-sm font-medium active:bg-primary/20 transition-colors"
                          >
                            <Volume2 size={16} />
                            <span>引导</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        <button
          onClick={() => setShowResetConfirm(true)}
          className="w-full flex items-center justify-center gap-2 py-4 text-text-muted text-sm active:text-text-secondary transition-colors"
        >
          <RefreshCw size={16} />
          <span>重新开始体验</span>
        </button>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-6 z-50">
          <div className="bg-white rounded-card p-6 w-full max-w-sm animate-fade-in-up">
            <h3 className="text-lg font-semibold text-text-main mb-2">确认重置？</h3>
            <p className="text-text-secondary text-sm mb-6">重置后所有任务进度和数据将恢复初始状态，可重新体验全部功能。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 rounded-btn border border-border text-text-secondary font-medium"
              >
                取消
              </button>
              <button
                onClick={() => { resetData(); setShowResetConfirm(false) }}
                className="flex-1 py-3 rounded-btn bg-primary text-white font-medium"
              >
                确认重置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
