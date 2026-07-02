import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Phone,
  AlertTriangle,
  CheckCircle,
  Volume2,
} from 'lucide-react'

const guides: Record<string, { title: string; steps: { title: string; desc: string; tip?: string }[] }> = {
  choking: {
    title: '噎食急救（海姆立克法）',
    steps: [
      {
        title: '第一步：判断情况',
        desc: '观察老人是否突然无法说话、咳嗽，双手抓住喉咙，面色发紫。',
        tip: '如果老人还能咳嗽或说话，鼓励其用力咳嗽，不要盲目施救',
      },
      {
        title: '第二步：站到身后',
        desc: '站在老人身后，双臂环抱其腰部，让老人身体前倾。',
        tip: '如果是意识不清的老人，使其仰卧，骑跨在髋部两侧',
      },
      {
        title: '第三步：找准位置',
        desc: '一手握拳，拇指侧顶住老人腹部正中线脐上方两横指处。',
        tip: '位置：肚脐上方两指、剑突下方的腹部正中',
      },
      {
        title: '第四步：快速冲击',
        desc: '另一手包住拳头，快速向内向上冲击腹部，反复进行。',
        tip: '用力方向：向内、向上，要有爆发力但不要过猛',
      },
      {
        title: '第五步：观察效果',
        desc: '每次冲击后检查异物是否排出，直到异物排出或专业人员到达。',
        tip: '如果老人失去意识，立即停止，等待120急救人员',
      },
    ],
  },
  fall: {
    title: '跌倒急救',
    steps: [
      { title: '第一步：不要急于扶起', desc: '先观察老人意识是否清醒，询问哪里疼痛。', tip: '盲目搬动可能造成二次伤害' },
      { title: '第二步：检查伤情', desc: '检查有无外伤、出血，四肢能否活动，有无剧烈疼痛。', tip: '特别注意头部、脊柱和髋部' },
      { title: '第三步：呼叫帮助', desc: '如果怀疑骨折或意识不清，立即拨打120，不要移动老人。', tip: '可以为老人盖上毛毯保暖' },
      { title: '第四步：轻微情况处理', desc: '如果只是轻微擦伤，帮助缓慢起身，到安全位置休息。', tip: '起身时慢慢来，先坐再站，防止头晕' },
      { title: '第五步：观察后续', desc: '跌倒后24-48小时密切观察，如有头痛、头晕加重及时就医。', tip: '老年人慢性硬膜下血肿可能迟发' },
    ],
  },
  cardiac: {
    title: '心脏骤停急救（CPR）',
    steps: [
      { title: '第一步：判断意识', desc: '轻拍双肩，大声呼叫，观察有无反应。', tip: '同时观察胸廓有无起伏（5-10秒）' },
      { title: '第二步：呼叫急救', desc: '立即拨打120，寻找附近的AED设备。', tip: '让别人去打120，自己开始急救' },
      { title: '第三步：胸外按压', desc: '双手掌根重叠，放在胸骨中下段，垂直向下按压5-6cm，频率100-120次/分。', tip: '手臂伸直，用上身力量按压，保证胸廓充分回弹' },
      { title: '第四步：人工呼吸', desc: '每30次按压后，进行2次人工呼吸（有防护时）。', tip: '没有防护可以只做胸外按压，不要延误时间' },
      { title: '第五步：持续进行', desc: '持续心肺复苏直到专业人员到达或老人恢复自主呼吸。', tip: '换人按压时尽量缩短中断时间（<10秒）' },
    ],
  },
  burn: {
    title: '烫伤急救',
    steps: [
      { title: '第一步：冲', desc: '立即用流动的冷水冲洗烫伤部位15-30分钟。', tip: '水温15-25℃为宜，不要用冰水' },
      { title: '第二步：脱', desc: '在冷水中小心脱去衣物，粘连部分剪掉，不要强行撕扯。', tip: '如果是烫伤的水泡，不要弄破' },
      { title: '第三步：泡', desc: '继续在冷水中浸泡10-30分钟，减轻疼痛。', tip: '大面积烫伤注意保暖，防止低体温' },
      { title: '第四步：盖', desc: '用干净的纱布或保鲜膜轻轻覆盖伤口。', tip: '不要涂抹牙膏、酱油、酒精等' },
      { title: '第五步：送', desc: '严重烫伤（面积大、起大泡、深度烫伤）及时送医。', tip: '面部、手部、关节部位烫伤要格外重视' },
    ],
  },
  lost: {
    title: '老人走失应对',
    steps: [
      { title: '第一步：立即搜索', desc: '在走失地点周围500米范围内快速搜索，询问路人。', tip: '重点关注公园、菜场、车站等老人常去的地方' },
      { title: '第二步：联系家人', desc: '通知所有亲属、邻居，分头寻找。', tip: '留一个人在家门口等，防止老人自己回来' },
      { title: '第三步：查看监控', desc: '联系小区物业、附近商铺，查看监控录像。', tip: '记下走失时间、地点、老人衣着特征' },
      { title: '第四步：报警求助', desc: '走失超过2小时立即拨打110报警，提供老人照片和信息。', tip: '可以申请"天眼"系统协助查找' },
      { title: '第五步：后续预防', desc: '找到后为老人佩戴定位设备，制作联系信息卡。', tip: '建议在老人衣兜内放置写有家庭地址和联系电话的卡片' },
    ],
  },
}

export default function EmergencyGuide() {
  const navigate = useNavigate()
  const { type } = useParams<{ type: string }>()
  const guide = guides[type || 'choking'] || guides.choking

  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [called120, setCalled120] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const step = guide.steps[currentStep]
  const progress = ((currentStep + 1) / guide.steps.length) * 100

  const handleNext = () => {
    if (currentStep < guide.steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-accent/10 to-warm-bg">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full bg-white/60 flex items-center justify-center text-text-secondary">
          <ArrowLeft size={22} />
        </button>
        <div className="text-center">
          <div className="text-sm text-text-secondary">{guide.title}</div>
          <div className="text-lg font-bold text-accent mt-0.5">{formatTime(elapsed)}</div>
        </div>
        <button className="w-10 h-10 -mr-2 rounded-full bg-white/60 flex items-center justify-center text-text-muted">
          <Volume2 size={20} />
        </button>
      </div>

      {/* 黄金救援提示 */}
      <div className="px-5 mb-4">
        <div className="bg-accent text-white rounded-card px-4 py-3 flex items-center gap-3 animate-pulse-soft">
          <AlertTriangle size={22} />
          <div className="flex-1">
            <p className="text-sm font-medium">黄金救援时间</p>
            <p className="text-xs opacity-90">时间就是生命，请尽快行动</p>
          </div>
        </div>
      </div>

      {/* 进度条 */}
      <div className="h-1.5 bg-white/50 mx-5 rounded-full overflow-hidden mb-4">
        <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* 步骤内容 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full bg-white rounded-card p-6 mb-6 shadow-soft">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-lg">
              {currentStep + 1}
            </div>
            <h2 className="text-lg font-semibold text-text-main">{step.title}</h2>
          </div>
          <p className="text-text-secondary leading-relaxed">{step.desc}</p>
          {step.tip && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
              <p className="text-sm text-amber-700">
                <span className="font-medium">重要提示：</span>
                {step.tip}
              </p>
            </div>
          )}
        </div>

        {/* 家人通知状态 */}
        <div className="w-full bg-white/80 rounded-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-success" />
            <span className="text-sm text-text-secondary">已自动通知紧急联系人</span>
          </div>
          <span className="text-xs text-text-muted">2人已读</span>
        </div>
      </div>

      {/* 底部控制 */}
      <div className="px-5 pb-[env(safe-area-inset-bottom)] pb-6">
        <div className="flex items-center justify-center gap-6 mb-5">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-text-secondary disabled:opacity-40 active:scale-95 transition-transform"
          >
            <SkipBack size={22} />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center active:scale-95 transition-transform shadow-lg shadow-accent/30"
          >
            {isPlaying ? <Pause size={28} strokeWidth={1.5} /> : <Play size={28} strokeWidth={1.5} className="ml-1" />}
          </button>
          <button
            onClick={handleNext}
            disabled={currentStep === guide.steps.length - 1}
            className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-text-secondary disabled:opacity-40 active:scale-95 transition-transform"
          >
            <SkipForward size={22} />
          </button>
        </div>

        {!called120 ? (
          <button
            onClick={() => setCalled120(true)}
            className="w-full py-4 bg-accent text-white rounded-card font-semibold text-lg flex items-center justify-center gap-2 active:bg-accent/90 transition-colors"
          >
            <Phone size={22} />
            我已拨打 120
          </button>
        ) : (
          <div className="w-full py-4 bg-success/20 text-success rounded-card font-semibold text-lg flex items-center justify-center gap-2">
            <CheckCircle size={22} />
            已确认拨打 120
          </div>
        )}
      </div>
    </div>
  )
}
