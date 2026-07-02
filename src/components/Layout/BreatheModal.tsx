import { X } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Props {
  open: boolean
  onClose: () => void
}

export default function BreatheModal({ open, onClose }: Props) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale')
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!open) return
    setPhase('inhale')
    setCount(0)

    const cycle = () => {
      setPhase('inhale')
      setTimeout(() => setPhase('hold'), 4000)
      setTimeout(() => setPhase('exhale'), 7000)
    }

    cycle()
    const interval = setInterval(() => {
      setCount(c => c + 1)
      cycle()
    }, 11000)

    return () => clearInterval(interval)
  }, [open])

  if (!open) return null

  const phaseText = {
    inhale: '吸气',
    hold: '屏住',
    exhale: '呼气',
  }

  const scaleClass = {
    inhale: 'scale-100 animate-breathe-in',
    hold: 'scale-115',
    exhale: 'scale-115 animate-breathe-out',
  }

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-primary/20 via-sand-light/30 to-warm-bg flex flex-col items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-6 right-5 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-text-secondary"
      >
        <X size={20} />
      </button>

      <div className="text-center mb-12">
        <h2 className="text-2xl font-semibold text-text-main mb-2">深呼吸一下</h2>
        <p className="text-text-secondary">跟着节奏，60秒快速放松</p>
      </div>

      <div className="relative w-56 h-56 flex items-center justify-center mb-12">
        <div className={`absolute inset-0 rounded-full bg-primary/20 transition-transform duration-1000 ease-in-out ${scaleClass[phase]}`} />
        <div className={`absolute inset-6 rounded-full bg-primary/30 transition-transform duration-1000 ease-in-out ${scaleClass[phase]}`} style={{ transitionDelay: '0.1s' }} />
        <div className={`absolute inset-12 rounded-full bg-primary/50 transition-transform duration-1000 ease-in-out ${scaleClass[phase]}`} style={{ transitionDelay: '0.2s' }} />
        <div className="relative z-10 text-center">
          <div className="text-3xl font-semibold text-primary-dark mb-1">{phaseText[phase]}</div>
          <div className="text-sm text-text-secondary">{count > 0 ? `第 ${count + 1} 轮` : '第 1 轮'}</div>
        </div>
      </div>

      <p className="text-text-secondary text-center px-8 max-w-xs">
        4秒吸气 · 3秒屏息 · 8秒呼气
        <br />
        把注意力放在呼吸上，感受身体的起伏
      </p>

      <button
        onClick={onClose}
        className="mt-12 px-8 py-3 rounded-btn bg-white text-primary border border-primary/30 font-medium"
      >
        结束，感觉好多了
      </button>
    </div>
  )
}
