import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Wind, Sparkles, Heart, MessageCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'

type Mode = 'breathing' | 'body-scan' | 'emotion'
type Phase = 'inhale' | 'hold' | 'exhale' | 'idle'

export default function Breathe() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fromGuide = searchParams.get('from') === 'guide'
  const { incrementBreathe } = useApp()

  const [mode, setMode] = useState<Mode | null>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [round, setRound] = useState(0)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (!mode || mode !== 'breathing') return
    if (phase === 'idle') return

    let timers: ReturnType<typeof setTimeout>[] = []

    const runCycle = () => {
      setPhase('inhale')
      timers.push(setTimeout(() => setPhase('hold'), 4000))
      timers.push(setTimeout(() => setPhase('exhale'), 7000))
      timers.push(setTimeout(() => {
        setRound(r => {
          const next = r + 1
          if (next >= 5) {
            setFinished(true)
            return next
          }
          runCycle()
          return next
        })
      }, 15000))
    }

    const startTimer = setTimeout(runCycle, 500)
    timers.push(startTimer)

    return () => {
      timers.forEach(t => clearTimeout(t))
    }
  }, [mode])

  const handleStart = (m: Mode) => {
    setMode(m)
    setRound(0)
    setFinished(false)
    setPhase('inhale')
  }

  const handleFinish = () => {
    incrementBreathe()
    if (fromGuide) {
      navigate('/today')
    } else {
      setMode(null)
      setFinished(false)
    }
  }

  const phaseText: Record<Phase, string> = {
    inhale: '吸气',
    hold: '屏住',
    exhale: '呼气',
    idle: '',
  }

  const scaleClass = {
    inhale: 'scale-100 animate-breathe-in',
    hold: 'scale-115',
    exhale: 'scale-115 animate-breathe-out',
    idle: 'scale-100',
  }

  // 模式选择页
  if (!mode) {
    return (
      <div className="h-full bg-gradient-to-b from-primary/10 via-sand-light/50 to-warm-bg flex flex-col">
        <div className="flex items-center px-5 pt-6 pb-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-text-secondary">
            <ArrowLeft size={22} />
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold text-text-main">给自己一点时间</h1>
          <div className="w-10" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
          <div className="relative w-28 h-28 mb-6">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-soft" />
            <div className="absolute inset-4 rounded-full bg-primary/30" />
            <div className="absolute inset-8 rounded-full bg-primary/50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Wind size={32} className="text-primary-dark" />
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-text-main mb-2">照护间隙</h2>
          <p className="text-text-secondary text-center mb-10 px-4">
            花几分钟，照护一下自己
          </p>

          <div className="w-full space-y-3">
            <button
              onClick={() => handleStart('breathing')}
              className="w-full flex items-center gap-4 p-4 bg-white border border-border rounded-card active:bg-sand-light/50 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Wind size={24} className="text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-text-main">呼吸调节 · 3分钟</div>
                <div className="text-sm text-text-secondary mt-0.5">478呼吸法，快速平复情绪</div>
              </div>
            </button>

            <button
              onClick={() => handleStart('body-scan')}
              className="w-full flex items-center gap-4 p-4 bg-white border border-border rounded-card active:bg-sand-light/50 transition-colors text-left opacity-80"
            >
              <div className="w-12 h-12 rounded-full bg-lavender/20 flex items-center justify-center">
                <Sparkles size={24} className="text-lavender" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-text-main">身体扫描 · 5分钟</div>
                <div className="text-sm text-text-secondary mt-0.5">从头到脚，逐步放松身体</div>
              </div>
              <span className="text-xs text-text-muted bg-sand-light px-2 py-1 rounded">即将推出</span>
            </button>

            <button
              onClick={() => handleStart('emotion')}
              className="w-full flex items-center gap-4 p-4 bg-white border border-border rounded-card active:bg-sand-light/50 transition-colors text-left opacity-80"
            >
              <div className="w-12 h-12 rounded-full bg-sand flex items-center justify-center">
                <Heart size={24} className="text-accent" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-text-main">情绪释放 · 4分钟</div>
                <div className="text-sm text-text-secondary mt-0.5">说出来，让情绪流动</div>
              </div>
              <span className="text-xs text-text-muted bg-sand-light px-2 py-1 rounded">即将推出</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 完成页
  if (finished) {
    return (
      <div className="h-full bg-gradient-to-b from-primary/20 via-sand-light/50 to-warm-bg flex flex-col items-center justify-center px-8">
        <div className="w-24 h-24 rounded-full bg-white/80 flex items-center justify-center mb-8 animate-fade-in-up">
          <Heart size={40} className="text-primary" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-semibold text-text-main mb-3">你很棒</h2>
        <p className="text-text-secondary text-center mb-2">
          你照顾好了自己，
          <br />
          才能更好地照顾爱的人
        </p>
        <p className="text-sm text-text-muted mt-4">
          今天已完成 {round} 次心理支持
        </p>
        <button
          onClick={handleFinish}
          className="mt-12 px-10 py-3.5 bg-primary text-white rounded-btn font-medium active:bg-primary-dark transition-colors"
        >
          {fromGuide ? '返回今日照护' : '完成'}
        </button>
      </div>
    )
  }

  // 呼吸进行中
  return (
    <div className="h-full bg-gradient-to-b from-primary/15 via-sand-light/40 to-warm-bg flex flex-col">
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <button
          onClick={() => { setMode(null); setPhase('idle') }}
          className="w-10 h-10 -ml-2 rounded-full bg-white/60 flex items-center justify-center text-text-secondary"
        >
          <ArrowLeft size={22} />
        </button>
        <span className="text-sm text-text-secondary">呼吸调节</span>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center mb-12">
          <p className="text-text-secondary mb-2">第 {Math.min(round + 1, 5)} / 5 轮</p>
          <h2 className="text-3xl font-semibold text-text-main">{phaseText[phase]}</h2>
        </div>

        <div className="relative w-60 h-60 flex items-center justify-center mb-12">
          <div className={`absolute inset-0 rounded-full bg-primary/20 transition-transform duration-1000 ease-in-out ${scaleClass[phase]}`} />
          <div className={`absolute inset-6 rounded-full bg-primary/30 transition-transform duration-1000 ease-in-out ${scaleClass[phase]}`} style={{ transitionDelay: '0.15s' }} />
          <div className={`absolute inset-12 rounded-full bg-primary/50 transition-transform duration-1000 ease-in-out ${scaleClass[phase]}`} style={{ transitionDelay: '0.3s' }} />
          <div className="relative z-10 flex flex-col items-center">
            <Wind size={36} className="text-primary-dark mb-1" />
            <span className="text-sm text-primary-dark">跟着节奏</span>
          </div>
        </div>

        <p className="text-text-secondary text-center px-8 max-w-xs">
          4秒吸气 · 3秒屏息 · 8秒呼气
          <br />
          感受气息进出身体
        </p>
      </div>

      <div className="px-8 pb-12 text-center">
        <button
          onClick={handleFinish}
          className="text-sm text-text-muted underline"
        >
          提前结束
        </button>
      </div>
    </div>
  )
}
