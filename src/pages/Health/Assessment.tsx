import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Printer, ChevronRight } from 'lucide-react'

interface Question {
  id: string
  question: string
  options: { label: string; score: number }[]
  category: string
}

const questions: Question[] = [
  {
    id: 'q1',
    question: '老人最近一个月的食欲如何？',
    category: '身体状况',
    options: [
      { label: '很好，和平时一样', score: 0 },
      { label: '一般，比以前少了一些', score: 1 },
      { label: '很差，吃的很少', score: 2 },
    ],
  },
  {
    id: 'q2',
    question: '老人最近一个月睡眠质量如何？',
    category: '身体状况',
    options: [
      { label: '很好，能睡6小时以上', score: 0 },
      { label: '一般，夜间容易醒', score: 1 },
      { label: '很差，经常失眠', score: 2 },
    ],
  },
  {
    id: 'q3',
    question: '老人最近一个月的情绪状态如何？',
    category: '心理状态',
    options: [
      { label: '心情愉快，对事物有兴趣', score: 0 },
      { label: '有时候会情绪低落', score: 1 },
      { label: '经常感到悲伤、无助', score: 2 },
    ],
  },
  {
    id: 'q4',
    question: '老人最近一个月记忆力如何？',
    category: '认知功能',
    options: [
      { label: '很好，和以前差不多', score: 0 },
      { label: '有时候忘事，但不影响生活', score: 1 },
      { label: '经常忘事，有时影响生活', score: 2 },
    ],
  },
  {
    id: 'q5',
    question: '老人最近一个月活动能力如何？',
    category: '身体状况',
    options: [
      { label: '可以自由活动，生活完全自理', score: 0 },
      { label: '行动有些缓慢，但基本自理', score: 1 },
      { label: '需要他人协助才能活动', score: 2 },
    ],
  },
  {
    id: 'q6',
    question: '作为照护者，您最近感到的压力如何？',
    category: '照护者状态',
    options: [
      { label: '比较轻松，可以应对', score: 0 },
      { label: '有些压力，但还能承受', score: 1 },
      { label: '压力很大，感到疲惫不堪', score: 2 },
    ],
  },
  {
    id: 'q7',
    question: '您在照护过程中遇到的最大困难是什么？',
    category: '照护者状态',
    options: [
      { label: '没有特别的困难', score: 0 },
      { label: '缺乏专业知识，不知道怎么照护', score: 1 },
      { label: '身心疲惫，没有人可以分担', score: 2 },
    ],
  },
]

export default function Assessment() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [completed, setCompleted] = useState(false)

  const q = questions[current]
  const progress = ((current + (answers[q.id] !== undefined ? 1 : 0)) / questions.length) * 100

  const handleSelect = (score: number) => {
    setAnswers(prev => ({ ...prev, [q.id]: score }))
    setTimeout(() => {
      if (current < questions.length - 1) {
        setCurrent(current + 1)
      } else {
        setCompleted(true)
      }
    }, 300)
  }

  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0)
  const maxScore = questions.length * 2
  const percentage = Math.round((1 - totalScore / maxScore) * 100)

  let level = '良好'
  let levelColor = 'text-success'
  let levelBg = 'bg-success/20'
  let advice = '老人整体状况良好，继续保持规律的生活作息和健康的照护方式。'

  if (percentage < 60) {
    level = '需关注'
    levelColor = 'text-accent'
    levelBg = 'bg-accent/20'
    advice = '近期状况需要关注，建议增加与老人的沟通，必要时寻求专业帮助，也别忘了照顾好自己。'
  } else if (percentage < 80) {
    level = '一般'
    levelColor = 'text-amber-500'
    levelBg = 'bg-amber-100'
    advice = '整体状况尚可，但有些方面需要留意。建议多关注老人的情绪和饮食，定期做健康检查。'
  }

  if (completed) {
    return (
      <div className="min-h-full bg-warm-bg">
        <div className="sticky top-0 z-30 bg-warm-bg/95 backdrop-blur-sm border-b border-border/50">
          <div className="flex items-center px-5 py-4">
            <button onClick={() => navigate('/health')} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-text-secondary">
              <ArrowLeft size={22} />
            </button>
            <h1 className="flex-1 text-center text-lg font-semibold text-text-main">评估报告</h1>
            <div className="w-10" />
          </div>
        </div>

        <div className="px-5 py-6 space-y-5">
          {/* 总评分 */}
          <div className="bg-white border border-border rounded-card p-6 text-center">
            <p className="text-text-secondary mb-3">综合健康评分</p>
            <div className="text-5xl font-bold text-text-main mb-2">{percentage}<span className="text-2xl">分</span></div>
            <div className={`inline-block px-4 py-1 rounded-full ${levelBg} ${levelColor} font-medium text-sm`}>
              整体状况{level}
            </div>
          </div>

          {/* 各维度 */}
          <div className="bg-white border border-border rounded-card p-4">
            <h3 className="font-medium text-text-main mb-4">各维度评分</h3>
            <div className="space-y-4">
              {['身体状况', '心理状态', '认知功能', '照护者状态'].map(cat => {
                const catQs = questions.filter(q => q.category === cat)
                const catScore = catQs.reduce((sum, q) => sum + (answers[q.id] || 0), 0)
                const catMax = catQs.length * 2
                const catPct = Math.round((1 - catScore / catMax) * 100)
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-text-secondary">{cat}</span>
                      <span className="text-sm font-medium text-text-main">{catPct}分</span>
                    </div>
                    <div className="h-2 bg-border rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${catPct >= 80 ? 'bg-success' : catPct >= 60 ? 'bg-amber-400' : 'bg-accent'}`}
                        style={{ width: `${catPct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 建议 */}
          <div className="bg-primary/5 border border-primary/20 rounded-card p-4">
            <div className="flex items-start gap-3">
              <CheckCircle size={22} className="text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-text-main mb-2">照护建议</p>
                <p className="text-sm text-text-secondary leading-relaxed">{advice}</p>
              </div>
            </div>
          </div>

          {/* 打印 */}
          <button className="w-full flex items-center justify-center gap-2 p-4 bg-white border border-border rounded-card active:bg-sand-light/30 transition-colors">
            <Printer size={20} className="text-primary" />
            <span className="font-medium text-primary">打印纸质版报告</span>
            <ChevronRight size={20} className="text-text-muted ml-auto" />
          </button>

          {/* 返回 */}
          <button
            onClick={() => navigate('/health')}
            className="w-full py-3.5 bg-primary text-white rounded-btn font-medium active:bg-primary-dark transition-colors"
          >
            返回健康档案
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-warm-bg">
      {/* 顶部栏 */}
      <div className="sticky top-0 z-30 bg-warm-bg/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center px-5 py-4">
          <button onClick={() => navigate('/health')} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-text-secondary">
            <ArrowLeft size={22} />
          </button>
          <div className="flex-1 text-center">
            <p className="text-sm text-text-secondary">月度健康评估</p>
            <p className="text-xs text-text-muted mt-0.5">第 {current + 1} / {questions.length} 题</p>
          </div>
          <div className="w-10" />
        </div>
        <div className="h-1 bg-border mx-5 mb-4 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* 题目内容 */}
      <div className="flex-1 flex flex-col justify-center px-6 pb-12">
        <div className="text-xs text-primary font-medium mb-2">{q.category}</div>
        <h2 className="text-xl font-semibold text-text-main mb-8 leading-relaxed">{q.question}</h2>

        <div className="space-y-3">
          {q.options.map((opt, idx) => {
            const selected = answers[q.id] === opt.score
            return (
              <button
                key={idx}
                onClick={() => handleSelect(opt.score)}
                className={`w-full p-5 rounded-card text-left transition-all border ${
                  selected
                    ? 'bg-primary/10 border-primary text-primary font-medium'
                    : 'bg-white border-border text-text-main active:bg-sand-light/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${
                    selected ? 'bg-primary text-white' : 'bg-sand-light text-text-secondary'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className="flex-1">{opt.label}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 底部操作 */}
      <div className="px-5 pb-8">
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>约需 3 分钟</span>
          <span>您的隐私将得到保护</span>
        </div>
      </div>
    </div>
  )
}
