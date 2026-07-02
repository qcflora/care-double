import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Volume2,
  Image as ImageIcon,
  Printer,
  Play,
  Pause,
  Download,
  Sparkles,
  Loader2,
} from 'lucide-react'
import { generateMultimodalContent } from '../../services/aiService'
import { speak, stop as stopTTS, isTTSSupported } from '../../services/ttsService'

type Mode = 'audio' | 'image' | 'print'

interface MultimodalData {
  audioScript: string
  imageCards: { step: number; title: string; description: string; imagePrompt: string }[]
  printLayout: string
}

const sourceContent = `协助老人翻身的标准流程：
1. 准备：关门窗、调室温、掀盖被
2. 移腿：弯曲双膝，双脚平放
3. 侧身：扶肩扶髋，转向对侧
4. 垫枕：背部垫枕，腿间夹垫
5. 检查：查看皮肤，记录时间`

export default function Multimodal() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('image')
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<MultimodalData | null>(null)
  const ttsSupported = isTTSSupported()

  // 调用 TRAE AI 生成多模态内容
  useEffect(() => {
    let cancelled = false

    generateMultimodalContent({
      sourceContent,
      title: '如何帮老人安全翻身',
    }).then(result => {
      if (!cancelled) {
        setData(result)
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
      stopTTS()
    }
  }, [])

  const tabs = [
    { value: 'audio' as Mode, label: '语音版', icon: Volume2 },
    { value: 'image' as Mode, label: '图文版', icon: ImageIcon },
    { value: 'print' as Mode, label: '打印版', icon: Printer },
  ]

  const handlePlayAudio = () => {
    if (!data) return
    if (isPlaying) {
      stopTTS()
      setIsPlaying(false)
    } else {
      speak(data.audioScript, {
        onEnd: () => setIsPlaying(false),
      })
      setIsPlaying(true)
    }
  }

  return (
    <div className="min-h-full bg-warm-bg">
      {/* 顶部栏 */}
      <div className="sticky top-0 z-30 bg-warm-bg/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center px-5 py-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-text-secondary">
            <ArrowLeft size={22} />
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold text-text-main">AI多模态适配</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-5 py-5">
        {/* AI 智能识别提示 */}
        <div className="bg-gradient-to-r from-lavender/20 to-primary/20 rounded-card p-4 mb-5 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center flex-shrink-0">
            <Sparkles size={20} className="text-lavender" />
          </div>
          <div>
            <p className="font-medium text-text-main mb-1">TRAE AI 多模态生成</p>
            <p className="text-sm text-text-secondary">
              同一份照护知识，AI 一次性生成语音/图文/打印三种形态
            </p>
          </div>
        </div>

        {/* 加载中 */}
        {loading && (
          <div className="py-16 flex flex-col items-center">
            <Loader2 size={32} className="animate-spin text-primary mb-3" />
            <p className="font-medium text-text-main">TRAE AI 正在生成多模态内容</p>
            <p className="text-sm text-text-muted mt-1">语音脚本、图文卡片、A4排版...</p>
          </div>
        )}

        {/* 模式切换Tab */}
        {!loading && data && (
          <>
            <div className="flex gap-1 mb-5 p-1 bg-white border border-border rounded-xl">
              {tabs.map(t => {
                const Icon = t.icon
                const active = mode === t.value
                return (
                  <button
                    key={t.value}
                    onClick={() => { stopTTS(); setIsPlaying(false); setMode(t.value) }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active ? 'bg-primary text-white' : 'text-text-secondary'
                    }`}
                  >
                    <Icon size={16} />
                    {t.label}
                  </button>
                )
              })}
            </div>

            {/* 语音版 */}
            {mode === 'audio' && (
              <div className="bg-white border border-border rounded-card p-6">
                <h2 className="text-lg font-semibold text-text-main mb-4 text-center">如何帮老人安全翻身</h2>

                {/* 播放器 */}
                <div className="bg-gradient-to-b from-primary/10 to-sand-light rounded-card p-6 mb-5">
                  <div className="flex items-center justify-center mb-4">
                    <button
                      onClick={handlePlayAudio}
                      className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center active:scale-95 transition-transform"
                    >
                      {isPlaying ? <Pause size={32} strokeWidth={1.5} /> : <Play size={32} strokeWidth={1.5} className="ml-1" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs text-text-muted">0:00</span>
                    <div className="flex-1 h-1.5 bg-white/80 rounded-full overflow-hidden">
                      <div className={`h-full bg-primary rounded-full transition-all duration-1000 ${isPlaying ? 'w-1/3' : 'w-0'}`} />
                    </div>
                    <span className="text-xs text-text-muted">约3分钟</span>
                  </div>
                  <p className="text-center text-sm text-text-secondary">
                    {isPlaying
                      ? ttsSupported ? '正在语音播报...' : '当前浏览器不支持语音合成'
                      : '点击播放语音指导'}
                  </p>
                </div>

                {/* 文字转录 */}
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <Sparkles size={14} className="text-lavender" />
                    <p className="text-sm font-medium text-text-main">AI 生成的语音脚本</p>
                  </div>
                  <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-line max-h-60 overflow-y-auto">
                    {data.audioScript}
                  </div>
                </div>
              </div>
            )}

            {/* 图文版 */}
            {mode === 'image' && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-text-main text-center mb-4">如何帮老人安全翻身</h2>
                {data.imageCards.map((card) => (
                  <div key={card.step} className="bg-white border border-border rounded-card p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center">
                        {card.step}
                      </div>
                      <h3 className="font-medium text-text-main">{card.title}</h3>
                    </div>
                    {/* 模拟图片占位 */}
                    <div className="w-full h-32 bg-gradient-to-br from-sand-light to-primary/10 rounded-lg mb-3 flex items-center justify-center">
                      <div className="text-center text-text-muted">
                        <ImageIcon size={28} className="mx-auto mb-1 opacity-50" />
                        <span className="text-xs">AI 插图: {card.imagePrompt.slice(0, 30)}...</span>
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">{card.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* 打印版 */}
            {mode === 'print' && (
              <div className="bg-white border border-border rounded-card p-5 shadow-soft">
                {/* A4 模拟纸张 */}
                <div className="bg-white border border-gray-200 p-6 min-h-[500px]">
                  <div className="prose prose-sm max-w-none">
                    {data.printLayout.split('\n').map((line, i) => {
                      if (line.startsWith('# ')) {
                        return <h2 key={i} className="text-xl font-bold text-gray-800 mb-3 pb-2 border-b border-gray-300">{line.slice(2)}</h2>
                      }
                      if (line.startsWith('## ')) {
                        return <h3 key={i} className="text-base font-semibold text-gray-700 mt-4 mb-2">{line.slice(3)}</h3>
                      }
                      if (line.startsWith('**')) {
                        return <p key={i} className="font-semibold text-gray-800 mt-3">{line.replace(/\*\*/g, '')}</p>
                      }
                      if (line.startsWith('- ')) {
                        return <p key={i} className="text-sm text-gray-600 ml-4">{line}</p>
                      }
                      if (line.startsWith('|')) {
                        return <p key={i} className="text-xs text-gray-500 font-mono">{line}</p>
                      }
                      if (line.startsWith('---')) {
                        return <hr key={i} className="border-gray-200 my-3" />
                      }
                      if (line.trim()) {
                        return <p key={i} className="text-sm text-gray-600 leading-relaxed">{line}</p>
                      }
                      return null
                    })}
                  </div>
                </div>

                {/* 打印按钮 */}
                <button
                  onClick={() => window.print()}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-btn font-medium active:bg-primary-dark transition-colors"
                >
                  <Printer size={18} />
                  打印此页面
                </button>
                <button className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-white border border-border rounded-btn text-text-secondary font-medium active:bg-sand-light/30 transition-colors">
                  <Download size={18} />
                  下载PDF版
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
