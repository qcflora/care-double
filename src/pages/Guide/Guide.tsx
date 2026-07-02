import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  CheckCircle,
  ThumbsUp,
  Meh,
  AlertCircle,
  Sparkles,
  Loader2,
  Gauge,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { generateGuideSteps } from '../../services/aiService'
import { speak, stop as stopTTS, setRate, isTTSSupported } from '../../services/ttsService'
import type { GuideStep } from '../../types'

type SpeedMode = 'slow' | 'normal' | 'fast'
const speedMap: Record<SpeedMode, number> = { slow: 0.8, normal: 1.0, fast: 1.2 }

export default function Guide() {
  const navigate = useNavigate()
  const { taskId } = useParams<{ taskId: string }>()
  const { tasks, completeTask, elder } = useApp()

  const task = tasks.find(t => t.id === taskId)
  const [aiSteps, setAiSteps] = useState<GuideStep[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [speedMode, setSpeedMode] = useState<SpeedMode>('normal')
  const ttsSupported = isTTSSupported()

  useEffect(() => {
    setRate(speedMap[speedMode])
  }, [speedMode])

  // 调用 TRAE AI 生成个性化引导步骤
  useEffect(() => {
    if (!task) return

    let cancelled = false
    setLoading(true)

    generateGuideSteps({
      taskType: task.type,
      taskTitle: task.title,
      elder,
      todayStatus: {
        bloodPressure: '135/85',
        bloodSugar: 8.2,
        mood: '情绪低落',
      },
    }).then(steps => {
      if (!cancelled) {
        setAiSteps(steps)
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
      stopTTS()
    }
  }, [task, elder])

  const steps = aiSteps || task?.steps || []
  const step = steps[currentStep]

  // 自动播放语音
  useEffect(() => {
    if (!isPlaying || !step || loading) return

    const text = `${step.title}。${step.description}${step.tip ? `。注意：${step.tip}` : ''}`
    speak(text, {
      rate: speedMap[speedMode],
      onEnd: () => setIsPlaying(false),
    })

    return () => stopTTS()
  }, [isPlaying, currentStep, step, loading, speedMode])

  if (!task) {
    return (
      <div className="p-8 text-center text-text-secondary">
        任务不存在
        <button onClick={() => navigate(-1)} className="block mx-auto mt-4 text-primary">返回</button>
      </div>
    )
  }

  const handleNext = () => {
    stopTTS()
    setIsPlaying(false)
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      setIsPlaying(true)
    } else {
      setShowResult(true)
    }
  }

  const handlePrev = () => {
    stopTTS()
    setIsPlaying(false)
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setIsPlaying(true)
    }
  }

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopTTS()
      setIsPlaying(false)
    } else {
      setIsPlaying(true)
    }
  }

  const handleFinish = () => {
    completeTask(task.id)
    setIsCompleted(true)
    stopTTS()
    setTimeout(() => {
      navigate('/breathe?from=guide')
    }, 1500)
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gradient-to-b from-primary/10 to-warm-bg">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-soft" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles size={32} className="text-primary" />
          </div>
        </div>
        <div className="flex items-center gap-2 text-text-secondary mb-2">
          <Loader2 size={18} className="animate-spin text-primary" />
          <span className="font-medium">TRAE AI 正在生成引导方案</span>
        </div>
        <p className="text-sm text-text-muted text-center px-8">
          根据{elder.name}的健康档案和今日状态，
          <br />
          生成个性化照护步骤...
        </p>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="h-full bg-gradient-to-b from-success/20 to-warm-bg flex flex-col items-center justify-center px-8">
        <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mb-6 animate-fade-in-up">
          <CheckCircle size={48} className="text-success" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-semibold text-text-main mb-2">做得很好</h2>
        <p className="text-text-secondary text-center">已记录到照护圈</p>
        <p className="text-sm text-text-muted mt-2">准备休息一下吧</p>
      </div>
    )
  }

  if (showResult) {
    return (
      <div className="h-full bg-warm-bg flex flex-col">
        <div className="flex items-center px-5 pt-6 pb-4">
          <button onClick={() => setShowResult(false)} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-text-secondary">
            <ArrowLeft size={22} />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6">
            <CheckCircle size={36} className="text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-text-main mb-2">{task.title} 完成了</h2>
          <p className="text-text-secondary text-center mb-10">记录一下老人的状态吧</p>

          <div className="w-full space-y-3">
            <button
              onClick={handleFinish}
              className="w-full flex items-center gap-4 p-4 bg-white border border-border rounded-card active:bg-sand-light/50 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                <ThumbsUp size={24} className="text-success" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-text-main">状态良好</div>
                <div className="text-sm text-text-secondary">一切正常，没有异常</div>
              </div>
            </button>

            <button
              onClick={handleFinish}
              className="w-full flex items-center gap-4 p-4 bg-white border border-border rounded-card active:bg-sand-light/50 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Meh size={24} className="text-amber-500" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-text-main">一般</div>
                <div className="text-sm text-text-secondary">有点小状况，但无大碍</div>
              </div>
            </button>

            <button
              onClick={handleFinish}
              className="w-full flex items-center gap-4 p-4 bg-white border border-border rounded-card active:bg-sand-light/50 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <AlertCircle size={24} className="text-accent" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-text-main">需要关注</div>
                <div className="text-sm text-text-secondary">有异常情况，需留意</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-warm-bg to-white">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <button onClick={() => { stopTTS(); navigate(-1) }} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-text-secondary">
          <ArrowLeft size={22} />
        </button>
        <div className="text-center">
          <div className="text-sm text-text-secondary">{task.title}</div>
          <div className="text-xs text-text-muted mt-0.5">第 {currentStep + 1} / {steps.length} 步</div>
        </div>
        <div className="flex items-center gap-1">
          {/* 语速切换 */}
          <button
            onClick={() => {
              const modes: SpeedMode[] = ['slow', 'normal', 'fast']
              const idx = modes.indexOf(speedMode)
              setSpeedMode(modes[(idx + 1) % 3])
            }}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-sand-light text-text-secondary text-xs"
          >
            <Gauge size={14} />
            {speedMode === 'slow' ? '慢' : speedMode === 'normal' ? '中' : '快'}
          </button>
        </div>
      </div>

      {/* AI 生成标识 */}
      <div className="px-5 mb-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-lavender/15 rounded-full">
          <Sparkles size={12} className="text-lavender" />
          <span className="text-xs text-lavender font-medium">TRAE AI 个性化生成</span>
        </div>
      </div>

      {/* 进度条 */}
      <div className="h-1 bg-border mx-5 rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* 步骤内容 */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="w-full bg-white border border-border rounded-card p-6 mb-8 shadow-soft">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              {currentStep + 1}
            </div>
            <h2 className="text-xl font-semibold text-text-main">{step?.title}</h2>
          </div>
          <p className="text-text-secondary leading-relaxed">{step?.description}</p>
          {step?.tip && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
              <p className="text-sm text-amber-700">
                <span className="font-medium">AI 提示：</span>
                {step.tip}
              </p>
            </div>
          )}
        </div>

        {/* 语音播放状态 */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-primary animate-pulse-soft' : 'bg-text-muted'}`} />
          <span className="text-sm text-text-muted">
            {isPlaying
              ? ttsSupported ? '正在语音播报...' : '语音播报（当前浏览器不支持）'
              : '点击播放语音引导'}
          </span>
        </div>
      </div>

      {/* 底部控制栏 */}
      <div className="px-5 pb-[env(safe-area-inset-bottom)] pb-8">
        <div className="flex items-center justify-center gap-6 mb-6">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="w-14 h-14 rounded-full bg-sand-light flex items-center justify-center text-text-secondary disabled:opacity-40 active:scale-95 transition-transform"
          >
            <SkipBack size={24} />
          </button>
          <button
            onClick={handleTogglePlay}
            className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center active:scale-95 transition-transform shadow-soft"
          >
            {isPlaying ? <Pause size={32} strokeWidth={1.5} /> : <Play size={32} strokeWidth={1.5} className="ml-1" />}
          </button>
          <button
            onClick={handleNext}
            className="w-14 h-14 rounded-full bg-sand-light flex items-center justify-center text-text-secondary active:scale-95 transition-transform"
          >
            <SkipForward size={24} />
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => { stopTTS(); navigate(-1) }}
            className="flex-1 py-3.5 rounded-btn border border-border text-text-secondary font-medium"
          >
            退出
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-3.5 rounded-btn bg-primary text-white font-medium active:bg-primary-dark transition-colors"
          >
            {currentStep === steps.length - 1 ? '完成' : '下一步'}
          </button>
        </div>
      </div>
    </div>
  )
}
