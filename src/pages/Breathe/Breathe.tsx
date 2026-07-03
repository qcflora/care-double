import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Wind, Sparkles, Heart, Play, Pause } from 'lucide-react'
import { useApp } from '../../context/AppContext'

type Mode = 'breathing' | 'body-scan' | 'emotion'
type Phase = 'inhale' | 'hold' | 'exhale' | 'idle'

const phaseText: Record<Phase, { text: string; subtext: string }> = {
  inhale: { text: '吸气 4秒', subtext: '慢慢吸气，感受腹部鼓起' },
  hold: { text: '屏息 7秒', subtext: '保持呼吸，放松全身' },
  exhale: { text: '呼气 8秒', subtext: '缓缓呼气，释放压力' },
  idle: { text: '', subtext: '' },
}

export default function Breathe() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fromGuide = searchParams.get('from') === 'guide'
  const { incrementBreathe } = useApp()

  const [mode, setMode] = useState<Mode | null>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [round, setRound] = useState(0)
  const [finished, setFinished] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

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
            setIsPlaying(false)
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
    setIsPlaying(true)
  }

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false)
      setPhase('idle')
    } else {
      setIsPlaying(true)
      setPhase('inhale')
    }
  }

  const handleFinish = () => {
    incrementBreathe()
    if (fromGuide) {
      navigate('/today')
    } else {
      setMode(null)
      setFinished(false)
      setPhase('idle')
      setIsPlaying(false)
    }
  }

  if (!mode) {
    return (
      <div className="h-full flex flex-col bg-warm-bg">
        <div className="flex items-center px-5 pt-6 pb-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-neutral-600">
            <ArrowLeft size={22} />
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold text-neutral-900 font-display">给自己一点时间</h1>
          <div className="w-10" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
          <div className="relative w-28 h-28 mb-6">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-soft" />
            <div className="absolute inset-4 rounded-full bg-primary/30" />
            <div className="absolute inset-8 rounded-full bg-primary/50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Wind size={32} className="text-primary-dark" />
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-neutral-900 font-display mb-2">照护间隙</h2>
          <p className="text-neutral-600 text-center mb-10 px-4">
            花几分钟，照护一下自己
          </p>

          <div className="w-full space-y-3">
            <button
              onClick={() => handleStart('breathing')}
              className="w-full flex items-center gap-4 p-4 bg-white border-2 border-primary rounded-card active:bg-neutral-50 transition-colors text-left shadow-md"
            >
              <div className="w-12 h-12 rounded-full bg-primary-lightest flex items-center justify-center">
                <Wind size={24} className="text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-neutral-900">呼吸调节 · 3分钟</div>
                <div className="text-sm text-neutral-600 mt-0.5">478呼吸法，快速平复情绪</div>
              </div>
            </button>

            <button
              onClick={() => handleStart('body-scan')}
              className="w-full flex items-center gap-4 p-4 bg-white border border-border rounded-card active:bg-neutral-50 transition-colors text-left opacity-70"
            >
              <div className="w-12 h-12 rounded-full bg-lavender/20 flex items-center justify-center">
                <Sparkles size={24} className="text-lavender" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-neutral-900">身体扫描 · 5分钟</div>
                <div className="text-sm text-neutral-600 mt-0.5">从头到脚，逐步放松身体</div>
              </div>
              <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">即将推出</span>
            </button>

            <button
              onClick={() => handleStart('emotion')}
              className="w-full flex items-center gap-4 p-4 bg-white border border-border rounded-card active:bg-neutral-50 transition-colors text-left opacity-70"
            >
              <div className="w-12 h-12 rounded-full bg-cinnabar-lighter flex items-center justify-center">
                <Heart size={24} className="text-cinnabar" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-neutral-900">情绪释放 · 4分钟</div>
                <div className="text-sm text-neutral-600 mt-0.5">说出来，让情绪流动</div>
              </div>
              <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">即将推出</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8 bg-warm-bg">
        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-8 animate-fade-in-up shadow-lg">
          <Heart size={40} className="text-cinnabar animate-heartbeat" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-semibold text-neutral-900 font-display mb-3">你很棒</h2>
        <p className="text-neutral-600 text-center mb-2">
          你照顾好了自己，
          <br />
          才能更好地照顾爱的人
        </p>
        <p className="text-sm text-neutral-500 mt-4">
          今天已完成 {round} 次心理支持
        </p>
        <button
          onClick={handleFinish}
          className="mt-12 px-10 py-3.5 bg-primary text-white rounded-btn font-medium active:bg-primary-hover transition-colors shadow-primary-glow"
        >
          {fromGuide ? '返回今日照护' : '完成'}
        </button>
      </div>
    )
  }

  const phaseInfo = phaseText[phase]

  return (
    <div
      className="h-full flex flex-col relative"
      style={{
        background: 'linear-gradient(to bottom, #fbedb9 0%, #fefdfb 60%, #fdf9f1 100%)',
      }}
    >
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <button
          onClick={() => { setMode(null); setPhase('idle'); setIsPlaying(false) }}
          className="w-10 h-10 -ml-2 rounded-full bg-white/60 flex items-center justify-center text-neutral-600"
        >
          <ArrowLeft size={22} />
        </button>
        <span className="text-sm text-neutral-600">呼吸调节</span>
        <div className="w-10" />
      </div>

      <div className="text-center mb-8">
        <p className="text-sm text-neutral-500 mb-1">第 {Math.min(round + 1, 5)} / 5 轮</p>
        {phase !== 'idle' && (
          <>
            <h2 className={`text-3xl font-semibold font-display ${
              phase === 'inhale' ? 'text-primary' : 'text-neutral-700'
            }`}>
              {phaseInfo.text}
            </h2>
            <p className="text-sm text-neutral-500 mt-1">{phaseInfo.subtext}</p>
          </>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-[200px] h-[200px] flex items-center justify-center">
          <div
            className={`absolute inset-0 rounded-full ${
              isPlaying ? 'breathing-ring-outer' : 'scale-100 opacity-70'
            }`}
            style={{
              border: '3px solid #eca94e',
            }}
          />
          <div
            className={`absolute inset-[20px] rounded-full ${
              isPlaying ? 'breathing-ring-middle' : 'scale-100 opacity-70'
            }`}
            style={{
              border: '3px solid #e4912a',
            }}
          />
          <div
            className={`absolute inset-[40px] rounded-full ${
              isPlaying ? 'breathing-ring-inner' : 'scale-100 opacity-70'
            }`}
            style={{
              border: '3px solid #e8b525',
            }}
          />
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-4xl font-semibold text-primary-dark font-display">4-7-8</span>
            <span className="text-xs text-neutral-500 mt-1">呼吸法</span>
          </div>
        </div>
      </div>

      <div className="px-8 pb-[calc(env(safe-area-inset-bottom)+24px)] flex flex-col items-center">
        <button
          onClick={handleTogglePlay}
          className="w-[72px] h-[72px] rounded-full bg-primary text-white flex items-center justify-center active:scale-95 transition-transform shadow-primary-glow mb-6"
        >
          {isPlaying ? <Pause size={32} strokeWidth={1.5} /> : <Play size={32} strokeWidth={1.5} className="ml-1" />}
        </button>

        <p className="text-sm text-neutral-500 text-center mb-4">
          4秒吸气 · 7秒屏息 · 8秒呼气
        </p>

        <button
          onClick={handleFinish}
          className="text-sm text-neutral-400 underline"
        >
          提前结束
        </button>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, #fefdfb 60%, transparent)',
        }}
      />

      <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-2 pointer-events-none">
        <Heart size={14} className="text-cinnabar animate-heartbeat" />
        <span className="text-xs text-neutral-500">照护别人之前，先照顾好自己</span>
      </div>
    </div>
  )
}
