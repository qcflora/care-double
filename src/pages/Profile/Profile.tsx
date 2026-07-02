import { useState } from 'react'
import {
  User,
  Settings,
  Phone,
  Bell,
  HelpCircle,
  Info,
  ChevronRight,
  Type,
  Languages,
  LogOut,
  Heart,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import PageHeader from '../../components/Layout/PageHeader'

type ContentPref = 'audio' | 'text' | 'print'
type FontSize = 'normal' | 'large' | 'xlarge'

export default function Profile() {
  const navigate = useNavigate()
  const { userRole, setIsOnboarded, resetData } = useApp()
  const [contentPref, setContentPref] = useState<ContentPref>('text')
  const [fontSize, setFontSize] = useState<FontSize>('normal')

  const roleLabel = {
    primary: '核心照护者',
    assistant: '协助照护者',
    remote: '远程子女',
    professional: '专业护工/护士',
  }[userRole || 'primary']

  const contentPrefs: { value: ContentPref; label: string }[] = [
    { value: 'audio', label: '语音优先' },
    { value: 'text', label: '图文优先' },
    { value: 'print', label: '纸质版偏好' },
  ]

  const fontSizes: { value: FontSize; label: string }[] = [
    { value: 'normal', label: '标准' },
    { value: 'large', label: '大' },
    { value: 'xlarge', label: '特大' },
  ]

  const handleLogout = () => {
    if (confirm('确定要切换身份吗？所有本地数据将被清除。')) {
      resetData()
    }
  }

  return (
    <div className="min-h-full">
      <PageHeader title="我的" />

      <div className="px-5 pb-6 space-y-5">
        {/* 用户信息卡片 */}
        <div className="bg-gradient-to-r from-primary/20 to-lavender/20 rounded-card p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center">
              <User size={32} className="text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-text-main">王阿姨</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 bg-white/80 text-primary rounded-full">
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="bg-white/70 rounded-lg p-3 text-center">
              <p className="text-lg font-semibold text-text-main">28</p>
              <p className="text-xs text-text-muted">照护天数</p>
            </div>
            <div className="bg-white/70 rounded-lg p-3 text-center">
              <p className="text-lg font-semibold text-text-main">156</p>
              <p className="text-xs text-text-muted">完成任务</p>
            </div>
            <div className="bg-white/70 rounded-lg p-3 text-center">
              <p className="text-lg font-semibold text-text-main">12</p>
              <p className="text-xs text-text-muted">心理支持</p>
            </div>
          </div>
        </div>

        {/* 内容偏好 */}
        <div className="bg-white border border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Languages size={20} className="text-primary" />
            <h3 className="font-medium text-text-main">内容偏好</h3>
          </div>
          <div className="flex gap-2">
            {contentPrefs.map(p => (
              <button
                key={p.value}
                onClick={() => setContentPref(p.value)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  contentPref === p.value
                    ? 'bg-primary text-white'
                    : 'bg-sand-light text-text-secondary'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-text-muted mt-3">
            AI 将根据您的偏好，自动适配内容呈现形式
          </p>
        </div>

        {/* 字体大小 */}
        <div className="bg-white border border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Type size={20} className="text-primary" />
            <h3 className="font-medium text-text-main">字体大小</h3>
          </div>
          <div className="flex gap-2">
            {fontSizes.map(f => (
              <button
                key={f.value}
                onClick={() => setFontSize(f.value)}
                className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${
                  fontSize === f.value
                    ? 'bg-primary text-white'
                    : 'bg-sand-light text-text-secondary'
                } ${f.value === 'xlarge' ? 'text-lg' : f.value === 'large' ? 'text-base' : 'text-sm'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 设置列表 */}
        <div className="bg-white border border-border rounded-card divide-y divide-border">
          <button className="w-full flex items-center gap-3 p-4 active:bg-sand-light/30 transition-colors text-left">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Phone size={20} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-text-main">紧急联系人</p>
              <p className="text-sm text-text-muted mt-0.5">儿子 138****8888</p>
            </div>
            <ChevronRight size={20} className="text-text-muted" />
          </button>

          <button className="w-full flex items-center gap-3 p-4 active:bg-sand-light/30 transition-colors text-left">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
              <Bell size={20} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-text-main">提醒设置</p>
              <p className="text-sm text-text-muted mt-0.5">用药、任务提醒已开启</p>
            </div>
            <ChevronRight size={20} className="text-text-muted" />
          </button>

          <button className="w-full flex items-center gap-3 p-4 active:bg-sand-light/30 transition-colors text-left">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
              <Settings size={20} className="text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-text-main">身份切换</p>
              <p className="text-sm text-text-muted mt-0.5">当前：{roleLabel}</p>
            </div>
            <ChevronRight size={20} className="text-text-muted" />
          </button>
        </div>

        {/* 其他 */}
        <div className="bg-white border border-border rounded-card divide-y divide-border">
          <button
            onClick={() => navigate('/multimodal')}
            className="w-full flex items-center gap-3 p-4 active:bg-sand-light/30 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-text-main">AI 多模态适配演示</p>
              <p className="text-sm text-text-muted mt-0.5">体验智能内容适配</p>
            </div>
            <ChevronRight size={20} className="text-text-muted" />
          </button>

          <button className="w-full flex items-center gap-3 p-4 active:bg-sand-light/30 transition-colors text-left">
            <div className="w-10 h-10 rounded-full bg-sand-light flex items-center justify-center">
              <HelpCircle size={20} className="text-text-secondary" />
            </div>
            <p className="flex-1 font-medium text-text-main">使用帮助</p>
            <ChevronRight size={20} className="text-text-muted" />
          </button>

          <button className="w-full flex items-center gap-3 p-4 active:bg-sand-light/30 transition-colors text-left">
            <div className="w-10 h-10 rounded-full bg-sand-light flex items-center justify-center">
              <Info size={20} className="text-text-secondary" />
            </div>
            <p className="flex-1 font-medium text-text-main">关于照护双环</p>
            <ChevronRight size={20} className="text-text-muted" />
          </button>
        </div>

        {/* 退出 */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-4 bg-white border border-border rounded-card text-accent active:bg-accent/5 transition-colors"
        >
          <LogOut size={18} />
          <span className="font-medium">切换身份/退出</span>
        </button>

        <div className="text-center text-xs text-text-muted pt-2">
          照护双环 v1.0.0
          <br />
          陪你一起照顾最爱的人
        </div>
      </div>
    </div>
  )
}
