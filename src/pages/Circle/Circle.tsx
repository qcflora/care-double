import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UserPlus,
  ArrowRight,
  Clock,
  Pill,
  Utensils,
  Heart,
  Activity,
  AlertTriangle,
  User,
  Mic,
  Sparkles,
  Loader2,
  ArrowLeft,
  X,
  Trash2,
  Check,
  Settings,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { generateHandoffSummary } from '../../services/aiService'
import type { HandoffRecord, CareRole } from '../../types'

const sampleHandoffText = '嗯，今天上午那个降压药已经吃了，血压量了一下135到85，还算正常。早餐吃的不太好，就喝了半碗粥，一个鸡蛋都没吃完，说没什么胃口。下午的时候老太太情绪有点低落，一直说想儿子了，我陪她聊了一会儿。然后下午三点翻了一次身，皮肤还好没有发红。对了，血糖量了一下8.2，比正常高了一点，要注意。'

const roleOptions: { value: CareRole; label: string }[] = [
  { value: 'primary', label: '核心照护者' },
  { value: 'assistant', label: '协助照护' },
  { value: 'remote', label: '远程子女' },
  { value: 'professional', label: '专业护工' },
]

export default function Circle() {
  const navigate = useNavigate()
  const { caregivers, handoffs, elder, addHandoff, addCaregiver, removeCaregiver, toggleDuty } = useApp()
  const [showHandoffModal, setShowHandoffModal] = useState(false)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [aiProcessing, setAiProcessing] = useState(false)
  const [aiResult, setAiResult] = useState<Partial<HandoffRecord> | null>(null)
  const [handoffText, setHandoffText] = useState('')

  // 添加成员表单
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState<CareRole>('assistant')

  const onDutyCaregiver = caregivers.find(c => c.isOnDuty)

  const roleColors: Record<string, string> = {
    primary: 'bg-primary-lightest text-primary-dark',
    assistant: 'bg-ochre-lighter text-ochre',
    remote: 'bg-lavender/20 text-lavender',
    professional: 'bg-jade-lightest text-jade',
  }

  const roleLabels: Record<string, string> = {
    primary: '核心照护者',
    assistant: '协助照护',
    remote: '远程子女',
    professional: '专业护工',
  }

  // 根据照护者数量计算环形位置
  const getMemberPosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2
    const radius = 42 // 百分比
    const x = 50 + radius * Math.cos(angle)
    const y = 50 + radius * Math.sin(angle)
    return {
      left: `${x}%`,
      top: `${y}%`,
      transform: 'translate(-50%, -50%)',
    }
  }

  const handleAddMember = () => {
    if (!newName.trim()) return
    const roleLabel = roleOptions.find(r => r.value === newRole)?.label || '协助照护'
    addCaregiver(newName.trim(), newRole, roleLabel)
    setNewName('')
    setNewRole('assistant')
  }

  return (
    <div className="min-h-full bg-warm-bg pb-6">
      <div className="flex items-center px-5 pt-6 pb-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-neutral-600">
          <ArrowLeft size={22} />
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold text-neutral-900 font-display">照护圈</h1>
          <p className="text-xs text-neutral-500">{elder.name}的照护团队 · {caregivers.length}人</p>
        </div>
        <button
          onClick={() => setShowMemberModal(true)}
          className="w-10 h-10 rounded-full bg-primary-lightest flex items-center justify-center text-primary"
        >
          <Settings size={20} />
        </button>
      </div>

      <div className="px-5 space-y-5">
        {/* 双环成员展示 - 动态计算位置 */}
        <div className="bg-white border border-border rounded-card p-5 shadow-soft">
          <div className="relative w-full aspect-square max-w-[300px] mx-auto">
            {/* 外环 */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                border: '2px dashed #f4c682',
                background: 'linear-gradient(135deg, rgba(244,198,130,0.06), transparent)',
              }}
            />
            {/* 外环标签 */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-1 rounded-full border border-ochre-light flex items-center gap-1.5 shadow-sm z-10">
              <div className="w-1.5 h-1.5 rounded-full bg-ochre" />
              <span className="text-xs font-medium text-ochre-dark">外环 · 智慧协同</span>
            </div>

            {/* 内环 */}
            <div
              className="absolute inset-[18%] rounded-full"
              style={{
                border: '2px solid #e4912a',
                background: 'linear-gradient(135deg, #fef5e4, #fffdf8)',
              }}
            />
            {/* 内环标签 */}
            <div className="absolute bottom-[18%] left-1/2 -translate-x-1/2 translate-y-1/2 bg-white px-3 py-1 rounded-full border border-primary flex items-center gap-1.5 shadow-sm z-10">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-xs font-medium text-primary-dark">内环 · 心理支持</span>
            </div>

            {/* 中心 - 被照护者 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-2 shadow-primary-glow">
                <User size={28} className="text-white" />
              </div>
              <span className="text-sm font-medium text-neutral-900 font-display">{elder.name}</span>
              <span className="text-xs text-neutral-500">{elder.careLevel}</span>
            </div>

            {/* 照护者 - 动态环形布局 */}
            {caregivers.map((c, i) => {
              const pos = getMemberPosition(i, caregivers.length)
              return (
                <div
                  key={c.id}
                  className="absolute flex flex-col items-center cursor-pointer"
                  style={pos}
                  onClick={() => toggleDuty(c.id)}
                >
                  <div className={`relative w-12 h-12 rounded-full ${c.isOnDuty ? 'bg-primary ring-2 ring-primary-lightest' : 'bg-white border-2 border-primary-lightest'} flex items-center justify-center shadow-sm active:scale-95 transition-transform`}>
                    <span className={`text-sm font-medium ${c.isOnDuty ? 'text-white' : 'text-primary-dark'}`}>
                      {c.name.charAt(0)}
                    </span>
                    {c.isOnDuty && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] bg-primary text-white px-1.5 py-0.5 rounded-full whitespace-nowrap">
                        值班
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-600 mt-1 text-center max-w-[60px] truncate">{c.name}</span>
                </div>
              )
            })}
          </div>

          {/* 提示 */}
          <p className="text-center text-xs text-neutral-400 mt-2">点击成员头像可切换值班状态</p>

          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {caregivers.map(c => (
              <span key={c.id} className={`text-xs px-2.5 py-1 rounded-full ${roleColors[c.role] || 'bg-neutral-100 text-neutral-600'}`}>
                {c.name} · {roleLabels[c.role] || c.roleLabel}
              </span>
            ))}
          </div>
        </div>

        {/* 当前值班 + 交班按钮 */}
        <div className="bg-white border border-border rounded-card p-4 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-neutral-500 mb-1">当前值班</p>
              <p className="font-medium text-neutral-900 font-display">{onDutyCaregiver?.name || '暂无'}</p>
            </div>
            <button
              onClick={() => setShowHandoffModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-btn text-sm font-medium active:bg-primary-hover transition-colors shadow-primary-glow"
            >
              <ArrowRight size={16} />
              交班
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Clock size={14} />
            <span>已值班 4小时30分</span>
          </div>
        </div>

        {/* 交接班看板 */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-base font-medium text-neutral-900 font-display">交接班记录</h3>
            <button className="text-sm text-primary">查看全部</button>
          </div>

          <div className="space-y-3">
            {handoffs.map((h) => (
              <div
                key={h.id}
                onClick={() => navigate(`/handoff/${h.id}`)}
                className="bg-white border border-border rounded-card p-4 active:bg-primary-lightest/20 transition-colors cursor-pointer shadow-soft"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-neutral-900">{h.fromName}</span>
                    <ArrowRight size={14} className="text-neutral-400" />
                    <span className="font-medium text-neutral-900">{h.toName}</span>
                  </div>
                  <span className="text-xs text-neutral-500">{h.time}</span>
                </div>

                {h.abnormalItems.length > 0 && (
                  <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-cinnabar-lighter/60 rounded-lg">
                    <AlertTriangle size={16} className="text-cinnabar flex-shrink-0" />
                    <span className="text-sm text-cinnabar font-medium">
                      {h.abnormalItems.length} 项需要关注
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1.5 text-neutral-600">
                    <Pill size={14} className="text-primary flex-shrink-0" />
                    <span className="truncate">用药：{h.medicationNotes.slice(0, 12)}...</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-600">
                    <Utensils size={14} className="text-primary flex-shrink-0" />
                    <span className="truncate">饮食：{h.dietNotes.slice(0, 10)}...</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-600">
                    <Heart size={14} className="text-primary flex-shrink-0" />
                    <span className="truncate">情绪：{h.moodNotes.slice(0, 10)}...</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-600">
                    <Activity size={14} className="text-primary flex-shrink-0" />
                    <span className="truncate">身体：{h.healthNotes.slice(0, 10)}...</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 成员管理弹窗 */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowMemberModal(false)}>
          <div className="w-full max-w-md bg-warm-bg rounded-t-2xl p-6 max-h-[85vh] overflow-y-auto animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-neutral-900 font-display">成员管理</h3>
              <button onClick={() => setShowMemberModal(false)} className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
                <X size={18} className="text-neutral-500" />
              </button>
            </div>

            {/* 添加新成员 */}
            <div className="bg-white border border-border rounded-card p-4 mb-4">
              <p className="text-sm font-medium text-neutral-900 mb-3">添加照护成员</p>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="输入姓名"
                className="w-full px-3 py-2.5 mb-3 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
              />
              <div className="flex flex-wrap gap-2 mb-3">
                {roleOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setNewRole(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      newRole === opt.value
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <button
                onClick={handleAddMember}
                disabled={!newName.trim()}
                className="w-full py-2.5 bg-primary text-white rounded-btn text-sm font-medium active:bg-primary-hover disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus size={16} />
                添加成员
              </button>
            </div>

            {/* 现有成员列表 */}
            <p className="text-sm font-medium text-neutral-900 mb-3">当前成员（{caregivers.length}人）</p>
            <div className="space-y-2">
              {caregivers.map(c => (
                <div key={c.id} className="bg-white border border-border rounded-card p-3 flex items-center gap-3">
                  <button
                    onClick={() => toggleDuty(c.id)}
                    className={`w-10 h-10 rounded-full ${c.isOnDuty ? 'bg-primary' : 'bg-primary-lightest'} flex items-center justify-center flex-shrink-0`}
                  >
                    {c.isOnDuty ? (
                      <Check size={18} className="text-white" />
                    ) : (
                      <span className="text-sm font-medium text-primary-dark">{c.name.charAt(0)}</span>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-900 text-sm">{c.name}</span>
                      {c.isOnDuty && (
                        <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-full">值班中</span>
                      )}
                    </div>
                    <span className={`text-xs ${roleColors[c.role]?.split(' ')[1] || 'text-neutral-500'}`}>
                      {roleLabels[c.role] || c.roleLabel}
                    </span>
                  </div>
                  <button
                    onClick={() => removeCaregiver(c.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 active:text-cinnabar active:bg-cinnabar-lighter transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <p className="text-xs text-neutral-400 text-center mt-4">
              点击成员头像可切换值班状态
            </p>
          </div>
        </div>
      )}

      {/* 交班确认弹窗 - 接入 TRAE AI */}
      {showHandoffModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => { setShowHandoffModal(false); setAiResult(null); setHandoffText('') }}>
          <div className="w-full max-w-md bg-warm-bg rounded-t-2xl p-6 max-h-[85vh] overflow-y-auto animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-1 text-center font-display">语音交班</h3>
            <p className="text-xs text-neutral-500 text-center mb-5">说话即可，TRAE AI 自动整理成交接单</p>

            {!aiResult && !aiProcessing && (
              <div className="mb-5">
                <button
                  onClick={async () => {
                    setHandoffText(sampleHandoffText)
                    setAiProcessing(true)
                    const result = await generateHandoffSummary({
                      rawText: sampleHandoffText,
                      fromName: onDutyCaregiver?.name || '',
                      toName: '张护工',
                    })
                    setAiResult(result)
                    setAiProcessing(false)
                  }}
                  className="w-full flex flex-col items-center justify-center py-8 bg-white border border-border rounded-card active:bg-primary-lightest/30 transition-colors"
                >
                  <div className="w-16 h-16 rounded-full bg-primary-lightest flex items-center justify-center mb-3">
                    <Mic size={28} className="text-primary" />
                  </div>
                  <span className="font-medium text-neutral-900">点击开始语音交班</span>
                  <span className="text-xs text-neutral-500 mt-1">或点击下方使用示例文本</span>
                </button>
                <button
                  onClick={async () => {
                    setAiProcessing(true)
                    const result = await generateHandoffSummary({
                      rawText: sampleHandoffText,
                      fromName: onDutyCaregiver?.name || '',
                      toName: '张护工',
                    })
                    setAiResult(result)
                    setAiProcessing(false)
                  }}
                  className="w-full mt-3 p-3 bg-primary-lightest/50 rounded-lg text-xs text-neutral-600 text-left"
                >
                  <span className="font-medium">示例交班内容（点击体验）：</span>
                  {sampleHandoffText.slice(0, 50)}...
                </button>
              </div>
            )}

            {aiProcessing && (
              <div className="py-12 flex flex-col items-center">
                <div className="flex items-center gap-2 text-primary mb-3">
                  <Loader2 size={20} className="animate-spin" />
                  <Sparkles size={20} />
                </div>
                <p className="font-medium text-neutral-900">TRAE AI 正在整理交接内容</p>
                <p className="text-sm text-neutral-500 mt-1">提取用药、饮食、情绪、身体信息...</p>
              </div>
            )}

            {aiResult && !aiProcessing && (
              <>
                <div className="bg-white border border-border rounded-card p-4 mb-4">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Sparkles size={14} className="text-primary" />
                    <span className="text-xs text-primary font-medium">TRAE AI 自动提取</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">用药情况</p>
                      <p className="text-sm text-neutral-800">{aiResult.medicationNotes}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">饮食情况</p>
                      <p className="text-sm text-neutral-800">{aiResult.dietNotes}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">情绪状态</p>
                      <p className="text-sm text-neutral-800">{aiResult.moodNotes}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">身体状况</p>
                      <p className="text-sm text-neutral-800">{aiResult.healthNotes}</p>
                    </div>
                  </div>

                  {aiResult.abnormalItems && aiResult.abnormalItems.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={16} className="text-cinnabar" />
                        <span className="text-sm font-medium text-cinnabar">AI 检测到异常</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {aiResult.abnormalItems.map((item, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-cinnabar-lighter text-cinnabar rounded-full">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setAiResult(null); setHandoffText('') }}
                    className="flex-1 py-3.5 rounded-btn border border-border text-neutral-600 font-medium active:bg-neutral-50"
                  >
                    重新输入
                  </button>
                  <button
                    onClick={() => {
                      const newHandoff: HandoffRecord = {
                        id: `h-${Date.now()}`,
                        fromName: onDutyCaregiver?.name || '王阿姨',
                        toName: '张护工',
                        time: `刚刚 ${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`,
                        pendingTasks: ['晚间服药 20:00', '睡前洗漱 21:00'],
                        medicationNotes: aiResult.medicationNotes || '',
                        dietNotes: aiResult.dietNotes || '',
                        moodNotes: aiResult.moodNotes || '',
                        healthNotes: aiResult.healthNotes || '',
                        abnormalItems: aiResult.abnormalItems || [],
                      }
                      addHandoff(newHandoff)
                      setShowHandoffModal(false)
                      setAiResult(null)
                      setHandoffText('')
                    }}
                    className="flex-1 py-3.5 rounded-btn bg-primary text-white font-medium active:bg-primary-hover shadow-primary-glow"
                  >
                    确认交班
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
