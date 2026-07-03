import { useState } from 'react'
import {
  X,
  Plus,
  Trash2,
  Edit3,
  Pill,
  RotateCw,
  Utensils,
  Bath,
  Activity,
  Footprints,
  Clock,
  ChevronDown,
  Check,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { CareTask } from '../types'

const taskTypeOptions = [
  { value: 'medication', label: '用药', icon: Pill, color: 'text-primary' },
  { value: 'vitals', label: '测量', icon: Activity, color: 'text-jade' },
  { value: 'turning', label: '翻身', icon: RotateCw, color: 'text-ochre' },
  { value: 'feeding', label: '进食', icon: Utensils, color: 'text-cinnabar' },
  { value: 'hygiene', label: '洗漱', icon: Bath, color: 'text-blue-500' },
  { value: 'activity', label: '活动', icon: Footprints, color: 'text-purple-500' },
] as const

const periodOptions = [
  { value: 'morning', label: '早晨', timeRange: '06:00-10:00' },
  { value: 'noon', label: '中午', timeRange: '10:00-14:00' },
  { value: 'evening', label: '下午', timeRange: '14:00-18:00' },
  { value: 'night', label: '晚间', timeRange: '18:00-23:00' },
] as const

interface TaskEditorProps {
  task?: CareTask
  onSave: (task: Omit<CareTask, 'id' | 'completed'>) => void
  onCancel: () => void
  onDelete?: () => void
}

function TaskEditor({ task, onSave, onCancel, onDelete }: TaskEditorProps) {
  const [title, setTitle] = useState(task?.title || '')
  const [type, setType] = useState(task?.type || 'medication')
  const [time, setTime] = useState(task?.time || '08:00')
  const [period, setPeriod] = useState(task?.period || 'morning')
  const [stepTitle, setStepTitle] = useState('')
  const [stepDesc, setStepDesc] = useState('')
  const [stepTip, setStepTip] = useState('')
  const [steps, setSteps] = useState(task?.steps || [])

  const selectedType = taskTypeOptions.find(t => t.value === type)!
  const TypeIcon = selectedType.icon

  const addStep = () => {
    if (!stepTitle.trim()) return
    const newStep = {
      id: `s-${Date.now()}`,
      title: stepTitle.trim(),
      description: stepDesc.trim(),
      tip: stepTip.trim() || undefined,
    }
    setSteps([...steps, newStep])
    setStepTitle('')
    setStepDesc('')
    setStepTip('')
  }

  const removeStep = (stepId: string) => {
    setSteps(steps.filter(s => s.id !== stepId))
  }

  const handleSave = () => {
    if (!title.trim()) return
    onSave({
      title: title.trim(),
      type,
      time,
      period,
      steps: steps.length > 0 ? steps : [{
        id: `s-${Date.now()}`,
        title: '执行任务',
        description: `按照照护规范完成${title}。`,
      }],
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-neutral-700 mb-1.5 block">任务名称</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例如：晨间服药"
          className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-neutral-700 mb-1.5 block">任务类型</label>
        <div className="grid grid-cols-3 gap-2">
          {taskTypeOptions.map(opt => {
            const Icon = opt.icon
            const selected = type === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => setType(opt.value as CareTask['type'])}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
                  selected
                    ? 'border-primary bg-primary-lightest text-primary'
                    : 'border-border bg-white text-neutral-600 hover:border-neutral-300'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-neutral-700 mb-1.5 block">时间段</label>
          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as CareTask['period'])}
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary appearance-none bg-white pr-8"
            >
              {periodOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-neutral-700 mb-1.5 block">具体时间</label>
          <div className="relative">
            <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-neutral-700">任务步骤</label>
          <span className="text-xs text-neutral-400">{steps.length} 个步骤</span>
        </div>

        {steps.length > 0 && (
          <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-start gap-2 p-2.5 bg-neutral-50 rounded-lg">
                <div className="w-5 h-5 rounded-full bg-primary-lightest text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800 truncate">{step.title}</p>
                  {step.description && (
                    <p className="text-xs text-neutral-500 truncate">{step.description}</p>
                  )}
                </div>
                <button
                  onClick={() => removeStep(step.id)}
                  className="text-neutral-400 hover:text-cinnabar transition-colors flex-shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="p-3 border border-dashed border-neutral-200 rounded-lg space-y-2">
          <input
            type="text"
            value={stepTitle}
            onChange={(e) => setStepTitle(e.target.value)}
            placeholder="步骤标题"
            className="w-full px-2.5 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <textarea
            value={stepDesc}
            onChange={(e) => setStepDesc(e.target.value)}
            placeholder="步骤描述（选填）"
            rows={2}
            className="w-full px-2.5 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
          />
          <input
            type="text"
            value={stepTip}
            onChange={(e) => setStepTip(e.target.value)}
            placeholder="小提示（选填）"
            className="w-full px-2.5 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <button
            onClick={addStep}
            className="w-full py-2 text-sm text-primary font-medium bg-primary-lightest/50 rounded hover:bg-primary-lightest transition-colors"
          >
            + 添加步骤
          </button>
        </div>
      </div>

      {onDelete && (
        <button
          onClick={onDelete}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-cinnabar text-sm font-medium bg-cinnabar-lighter/30 rounded-lg hover:bg-cinnabar-lighter/50 transition-colors"
        >
          <Trash2 size={16} />
          删除此任务
        </button>
      )}

      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-lg border border-border text-neutral-600 font-medium text-sm hover:bg-neutral-50 transition-colors"
        >
          取消
        </button>
        <button
          onClick={handleSave}
          disabled={!title.trim()}
          className="flex-1 py-3 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          保存
        </button>
      </div>
    </div>
  )
}

interface TaskManagerModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TaskManagerModal({ isOpen, onClose }: TaskManagerModalProps) {
  const { tasks, addTask, removeTask, updateTask } = useApp()
  const [editingTask, setEditingTask] = useState<CareTask | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [activeTab, setActiveTab] = useState<CareTask['period'] | 'all'>('all')

  if (!isOpen) return null

  const filteredTasks = activeTab === 'all'
    ? tasks
    : tasks.filter(t => t.period === activeTab)

  const handleAdd = (task: Omit<CareTask, 'id' | 'completed'>) => {
    addTask(task)
    setIsAdding(false)
  }

  const handleUpdate = (task: Omit<CareTask, 'id' | 'completed'>) => {
    if (editingTask) {
      updateTask(editingTask.id, task)
      setEditingTask(null)
    }
  }

  const handleDelete = () => {
    if (editingTask) {
      removeTask(editingTask.id)
      setEditingTask(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] flex flex-col animate-fade-in-up">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-neutral-900 font-display">照护计划管理</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {isAdding || editingTask ? (
          <div className="p-5 overflow-y-auto flex-1">
            <button
              onClick={() => { setIsAdding(false); setEditingTask(null) }}
              className="text-sm text-primary mb-4 flex items-center gap-1"
            >
              ← 返回任务列表
            </button>
            <h3 className="text-base font-semibold text-neutral-900 mb-4">
              {editingTask ? '编辑任务' : '添加新任务'}
            </h3>
            <TaskEditor
              task={editingTask || undefined}
              onSave={editingTask ? handleUpdate : handleAdd}
              onCancel={() => { setIsAdding(false); setEditingTask(null) }}
              onDelete={editingTask ? handleDelete : undefined}
            />
          </div>
        ) : (
          <>
            <div className="px-5 pt-4 pb-2 border-b border-border">
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    activeTab === 'all'
                      ? 'bg-primary text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  全部 ({tasks.length})
                </button>
                {periodOptions.map(opt => {
                  const count = tasks.filter(t => t.period === opt.value).length
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setActiveTab(opt.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                        activeTab === opt.value
                          ? 'bg-primary text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {opt.label} ({count})
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                    <Activity size={28} className="text-neutral-400" />
                  </div>
                  <p className="text-neutral-500 text-sm">暂无任务</p>
                  <p className="text-neutral-400 text-xs mt-1">点击下方按钮添加</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTasks.map(task => {
                    const typeOpt = taskTypeOptions.find(t => t.value === task.type)!
                    const TypeIcon = typeOpt.icon
                    return (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                          <TypeIcon size={20} className={typeOpt.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-neutral-800 text-sm truncate">{task.title}</p>
                            {task.completed && (
                              <span className="flex-shrink-0 w-4 h-4 rounded-full bg-jade-lightest flex items-center justify-center">
                                <Check size={10} className="text-jade" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {periodOptions.find(p => p.value === task.period)?.label} · {task.time} · {task.steps.length}个步骤
                          </p>
                        </div>
                        <button
                          onClick={() => setEditingTask(task)}
                          className="w-8 h-8 rounded-lg text-neutral-400 hover:text-primary hover:bg-primary-lightest flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Edit3 size={16} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-border">
              <button
                onClick={() => setIsAdding(true)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-hover transition-colors"
              >
                <Plus size={18} />
                添加新任务
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
