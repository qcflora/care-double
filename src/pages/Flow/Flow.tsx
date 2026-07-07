import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export default function Flow() {
  const navigate = useNavigate()

  return (
    <div className="min-h-full bg-warm-bg pb-20">
      {/* 顶部 */}
      <div className="flex items-center px-4 py-3 bg-white border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
        >
          <ChevronLeft size={22} className="text-neutral-700" />
        </button>
        <h1 className="ml-2 text-base font-semibold text-neutral-900 font-display">
          嵌入式心理支持闭环
        </h1>
      </div>

      {/* 流程图主体 */}
      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-border overflow-hidden">
          <img
            src="./closed-loop-flow.png"
            alt="嵌入式心理支持闭环流程图"
            className="w-full h-auto"
          />
        </div>
      </div>

      {/* 关键说明 */}
      <div className="px-4 pt-5">
        <h2 className="text-sm font-semibold text-neutral-900 font-display mb-3">
          5 个停顿 · 1 个闭环
        </h2>
        <div className="space-y-3">
          <Step
            num="01"
            color="#7BA394"
            title="勾选任务"
            desc="照护者完成翻身、喂药等日常照护后，在矩阵视图中勾选任务"
          />
          <Step
            num="02"
            color="#E4912A"
            title="情绪充电站"
            desc="完成 2 项任务后自动弹出，明确标注「照护者专属」"
          />
          <Step
            num="03"
            color="#E4912A"
            title="478 呼吸"
            desc="3 分钟 478 呼吸法（吸 4 · 屏 7 · 呼 8），不离开照护现场"
          />
          <Step
            num="04"
            color="#A0AF9B"
            title="照护语音"
            desc="RAG 动态生成下一步照护步骤，呼吸完无缝继续"
          />
          <Step
            num="05"
            color="#7BA394"
            title="交接班摘要"
            desc="AI 自动整理用药 / 饮食 / 情绪 / 异常，下班前 30 秒"
          />
        </div>
      </div>

      {/* 核心原则 */}
      <div className="mx-4 mt-6 p-4 rounded-card bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
        <h3 className="text-sm font-semibold text-amber-900 font-display mb-2">
          我们没有做的事
        </h3>
        <ul className="space-y-1.5 text-sm text-amber-900/80">
          <li>· 没有要求照护者「再学一套心理课程」</li>
          <li>· 没有强制「每天打卡 3 次」</li>
          <li>· 没有为心理调节「额外增加照护时间」</li>
        </ul>
      </div>
    </div>
  )
}

function Step({ num, color, title, desc }: { num: string; color: string; title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
        style={{ backgroundColor: color }}
      >
        {num}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-neutral-900 text-sm">{title}</div>
        <div className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{desc}</div>
      </div>
    </div>
  )
}
