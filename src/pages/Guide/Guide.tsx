import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  CheckCircle,
  ThumbsUp,
  Meh,
  AlertCircle,
  Sparkles,
  Loader2,
  Gauge,
  AlertTriangle,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { generateGuideSteps } from '../../services/aiService'
import { speak, stop as stopTTS, setRate, isTTSSupported } from '../../services/ttsService'
import type { GuideStep } from '../../types'

type SpeedMode = 'slow' | 'normal' | 'fast'
const speedMap: Record<SpeedMode, number> = { slow: 0.7, normal: 1.0, fast: 1.3 }

function StepProgress({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center justify-center gap-1 px-5 mb-4">
      {Array.from({ length: total }).map((_, i) => {
        const isCompleted = i < current
        const isCurrent = i === current
        const isPending = i > current

        return (
          <div key={i} className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                isCompleted
                  ? 'bg-jade'
                  : isCurrent
                    ? 'bg-primary border-2 border-primary-lightest'
                    : 'bg-transparent border-2 border-border'
              }`}
              style={isCurrent ? { boxShadow: '0 0 0 4px #f9deb3' } : undefined}
            />
            {i < total - 1 && (
              <div
                className={`w-6 h-0.5 transition-all duration-300 ${
                  isCompleted ? 'bg-jade' : 'bg-border'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function StepList({ steps, currentStep }: { steps: GuideStep[]; currentStep: number }) {
  return (
    <div className="px-5">
      <div className="bg-white border border-border rounded-card overflow-hidden">
        {steps.map((step, i) => {
          const isCompleted = i < currentStep
          const isCurrent = i === currentStep
          const isPending = i > currentStep

          return (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-3.5 min-h-[56px] ${
                isCurrent ? 'bg-primary-lightest/30' : ''
              } ${i < steps.length - 1 ? 'border-b border-border' : ''}`}
            >
              {isCompleted ? (
                <CheckCircle size={18} className="text-jade flex-shrink-0" />
              ) : isCurrent ? (
                <div className="w-[18px] h-[18px] rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              ) : (
                <div className="w-[18px] h-[18px] rounded-full border-2 border-border flex-shrink-0" />
              )}
              <span
                className={`text-sm flex-1 ${
                  isCompleted
                    ? 'text-neutral-400 line-through'
                    : isCurrent
                      ? 'text-neutral-900 font-medium'
                      : 'text-neutral-500'
                }`}
              >
                {step.title}
              </span>
              {isCompleted && (
                <span className="text-xs text-jade font-medium">已完成</span>
              )}
              {isCurrent && (
                <span className="text-xs text-primary font-medium">当前步骤</span>
              )}
              {isPending && (
                <span className="text-xs text-neutral-400">待完成</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

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
      <div className="p-8 text-center text-neutral-600">
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

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gradient-to-b from-primary-lightest to-warm-bg">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-soft" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles size={32} className="text-primary" />
          </div>
        </div>
        <div className="flex items-center gap-2 text-neutral-600 mb-2">
          <Loader2 size={18} className="animate-spin text-primary" />
          <span className="font-medium">TRAE AI 正在生成引导方案</span>
        </div>
        <p className="text-sm text-neutral-500 text-center px-8">
          根据{elder.name}的健康档案和今日状态，
          <br />
          生成个性化照护步骤...
        </p>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="h-full bg-gradient-to-b from-jade-lightest to-warm-bg flex flex-col items-center justify-center px-8">
        <div className="w-20 h-20 rounded-full bg-jade-lightest flex items-center justify-center mb-6 animate-fade-in-up">
          <CheckCircle size={48} className="text-jade" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-semibold text-neutral-900 font-display mb-2">做得很好</h2>
        <p className="text-neutral-600 text-center">已记录到照护圈</p>
        <p className="text-sm text-neutral-500 mt-2">准备休息一下吧</p>
      </div>
    )
  }

  if (showResult) {
    return (
      <div className="h-full bg-warm-bg flex flex-col">
        <div className="flex items-center px-5 pt-6 pb-4">
          <button onClick={() => setShowResult(false)} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-neutral-600">
            <ArrowLeft size={22} />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="w-16 h-16 rounded-full bg-primary-lightest flex items-center justify-center mb-6">
            <CheckCircle size={36} className="text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 font-display mb-2">{task.title} 完成了</h2>
          <p className="text-neutral-600 text-center mb-10">记录一下老人的状态吧</p>

          <div className="w-full space-y-3">
            <button
              onClick={handleFinish}
              className="w-full flex items-center gap-4 p-4 bg-white border border-border rounded-card active:bg-neutral-50 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-full bg-jade-lightest flex items-center justify-center">
                <ThumbsUp size={24} className="text-jade" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-neutral-900">状态良好</div>
                <div className="text-sm text-neutral-600">一切正常，没有异常</div>
              </div>
            </button>

            <button
              onClick={handleFinish}
              className="w-full flex items-center gap-4 p-4 bg-white border border-border rounded-card active:bg-neutral-50 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-full bg-ochre-lighter flex items-center justify-center">
                <Meh size={24} className="text-ochre" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-neutral-900">一般</div>
                <div className="text-sm text-neutral-600">有点小状况，但无大碍</div>
              </div>
            </button>

            <button
              onClick={handleFinish}
              className="w-full flex items-center gap-4 p-4 bg-white border border-border rounded-card active:bg-neutral-50 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-full bg-cinnabar-lighter flex items-center justify-center">
                <AlertCircle size={24} className="text-cinnabar" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-neutral-900">需要关注</div>
                <div className="text-sm text-neutral-600">有异常情况，需留意</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-warm-bg flex flex-col">
      <div className="flex items-center justify-between px-5 pt-6 pb-3 bg-warm-bg z-10">
        <button onClick={() => { stopTTS(); navigate(-1) }} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-neutral-600">
          <ArrowLeft size={22} />
        </button>
        <div className="text-center">
          <div className="text-sm text-neutral-600 font-display">{task.title}</div>
          <div className="text-xs text-neutral-500 mt-0.5">第 {currentStep + 1} / {steps.length} 步</div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const modes: SpeedMode[] = ['slow', 'normal', 'fast']
              const idx = modes.indexOf(speedMode)
              setSpeedMode(modes[(idx + 1) % 3])
            }}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-neutral-100 text-neutral-600 text-xs"
          >
            <Gauge size={14} />
            {speedMode === 'slow' ? '慢' : speedMode === 'normal' ? '中' : '快'}
          </button>
        </div>
      </div>

      <div className="px-5 mb-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-lightest rounded-full">
          <Sparkles size={12} className="text-primary" />
          <span className="text-xs text-primary-dark font-medium">TRAE AI 个性化生成</span>
        </div>
      </div>

      <StepProgress total={steps.length} current={currentStep} />

      <div className="flex-1 overflow-y-auto px-5 pb-48">
        <div className="w-full bg-white border border-border rounded-card p-5 mb-4 shadow-soft relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
              {currentStep + 1}
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 font-display">{step?.title}</h2>
          </div>
          <p className="text-neutral-700 leading-relaxed text-base">{step?.description}</p>
          {step?.tip && (
            <div className="mt-4 p-3 bg-ochre-lighter rounded-lg flex items-start gap-2">
              <AlertTriangle size={16} className="text-ochre mt-0.5 flex-shrink-0" />
              <p className="text-sm text-neutral-700">
                <span className="font-medium">AI 提示：</span>
                {step.tip}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-primary animate-pulse-soft' : 'bg-neutral-400'}`} />
          <span className="text-sm text-neutral-500">
            {isPlaying
              ? ttsSupported ? '正在语音播报...' : '语音播报（当前浏览器不支持）'
              : '点击播放语音引导'}
          </span>
        </div>

        <StepList steps={steps} currentStep={currentStep} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-5 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4 bg-white border-t border-border shadow-lg z-20">
        <div className="flex items-center justify-center gap-6 mb-4">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 disabled:opacity-40 active:scale-95 transition-transform"
          >
            <SkipBack size={24} />
          </button>
          <button
            onClick={handleTogglePlay}
            className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center active:scale-95 transition-transform shadow-primary-glow"
          >
            {isPlaying ? <Pause size={28} strokeWidth={1.5} /> : <Play size={28} strokeWidth={1.5} className="ml-1" />}
          </button>
          <button
            onClick={handleNext}
            className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 active:scale-95 transition-transform"
          >
            <SkipForward size={24} />
          </button>
        </div>

        <button
          onClick={handleNext}
          className="w-full py-3.5 rounded-btn bg-primary text-white font-medium active:bg-primary-hover transition-colors shadow-primary-glow"
        >
          {currentStep === steps.length - 1 ? '完成此步骤' : '下一步'}
        </button>

        {currentStep === steps.length - 1 && (
          <button
            onClick={() => { stopTTS(); navigate('/breathe') }}
            className="w-full mt-2 py-2 text-sm text-neutral-500 text-center"
          >
            完成后进入呼吸调节
          </button>
        )}
      </div>
    </div>
  )
}
