import type { CareTask, Caregiver, HandoffRecord, ElderProfile } from '../types'

export const mockTasks: CareTask[] = [
  {
    id: '1',
    title: '晨间服药',
    type: 'medication',
    time: '07:00',
    period: 'morning',
    completed: true,
    steps: [
      { id: 's1', title: '准备药物', description: '取出降压药、阿司匹林各一片，放在干净的药盒中。', tip: '核对药名和剂量，确认在有效期内' },
      { id: 's2', title: '准备温水', description: '准备一杯约200ml的温水，温度以不烫嘴为宜。', tip: '避免用茶水、牛奶送服药物' },
      { id: 's3', title: '协助老人坐起', description: '慢慢扶起老人，保持半卧位至少30度。', tip: '动作要慢，防止体位性低血压' },
      { id: 's4', title: '送服药物', description: '将药片放入老人舌后，喝水咽下。', tip: '确认药物全部咽下，没有残留' },
      { id: 's5', title: '休息观察', description: '保持坐姿15分钟，观察有无不适反应。', tip: '如出现头晕、恶心等症状，及时记录' },
    ],
  },
  {
    id: '2',
    title: '协助翻身',
    type: 'turning',
    time: '09:00',
    period: 'morning',
    completed: false,
    steps: [
      { id: 's1', title: '翻身前准备', description: '关好门窗，调节室温，掀开盖被。', tip: '注意保暖，避免着凉' },
      { id: 's2', title: '移动老人双腿', description: '将老人双膝轻轻弯曲，双脚平放床上。', tip: '动作轻柔，避免拉扯关节' },
      { id: 's3', title: '转身侧卧', description: '一手扶肩，一手扶髋，将老人轻轻转向对侧。', tip: '翻身时注意保护老人头部和管路' },
      { id: 's4', title: '垫枕支撑', description: '背部垫软枕，双腿间夹软垫，保持舒适体位。', tip: '足跟、耳廓等骨突处要悬空减压' },
      { id: 's5', title: '检查皮肤', description: '检查受压部位皮肤情况，有无发红、破损。', tip: '皮肤发红超过30分钟不消退要警惕压疮' },
    ],
  },
  {
    id: '3',
    title: '测量血压血糖',
    type: 'vitals',
    time: '08:00',
    period: 'morning',
    completed: true,
    steps: [
      { id: 's1', title: '准备仪器', description: '准备血压计、血糖仪、试纸、采血针。', tip: '检查试纸有效期' },
      { id: 's2', title: '测量血压', description: '静坐5分钟后，袖带绑于肘上2cm处测量。', tip: '手臂与心脏同高' },
      { id: 's3', title: '测量血糖', description: '指尖采血，滴于试纸上读取数值。', tip: '采血部位轮换，避免反复扎同一处' },
      { id: 's4', title: '记录数值', description: '将血压、血糖数值记录到健康档案中。', tip: '异常数值标注颜色提醒' },
    ],
  },
  {
    id: '4',
    title: '午餐协助进食',
    type: 'feeding',
    time: '12:00',
    period: 'noon',
    completed: false,
    steps: [
      { id: 's1', title: '餐前准备', description: '协助老人洗手、戴好围兜，取舒适坐位。', tip: '餐前30分钟避免剧烈活动' },
      { id: 's2', title: '食物温度检查', description: '触摸餐盘外壁确认温度适宜，取少量试尝。', tip: '防止烫伤，温度以不烫手为宜' },
      { id: 's3', title: '协助进食', description: '每次一小勺，确认咽下后再喂下一口。', tip: '速度要慢，每口量约1/2勺' },
      { id: 's4', title: '餐后清洁', description: '协助擦嘴、漱口，整理衣物。', tip: '餐后保持坐位30分钟再躺下' },
    ],
  },
  {
    id: '5',
    title: '下午翻身',
    type: 'turning',
    time: '15:00',
    period: 'evening',
    completed: false,
    steps: [
      { id: 's1', title: '翻身前准备', description: '关好门窗，调节室温，掀开盖被。', tip: '注意保暖，避免着凉' },
      { id: 's2', title: '移动老人双腿', description: '将老人双膝轻轻弯曲，双脚平放床上。', tip: '动作轻柔，避免拉扯关节' },
      { id: 's3', title: '转身侧卧', description: '一手扶肩，一手扶髋，将老人轻轻转向对侧。', tip: '翻身时注意保护老人头部和管路' },
      { id: 's4', title: '垫枕支撑', description: '背部垫软枕，双腿间夹软垫，保持舒适体位。', tip: '足跟、耳廓等骨突处要悬空减压' },
    ],
  },
  {
    id: '6',
    title: '晚间服药',
    type: 'medication',
    time: '20:00',
    period: 'night',
    completed: false,
    steps: [
      { id: 's1', title: '准备药物', description: '取出晚间药物，核对药名和剂量。' },
      { id: 's2', title: '温水送服', description: '用温水送服，确认全部咽下。' },
      { id: 's3', title: '观察反应', description: '服药后观察15分钟，有无不适。' },
    ],
  },
  {
    id: '7',
    title: '睡前洗漱',
    type: 'hygiene',
    time: '21:00',
    period: 'night',
    completed: false,
    steps: [
      { id: 's1', title: '洗脸洗手', description: '用温水帮老人洗脸、洗手。' },
      { id: 's2', title: '口腔护理', description: '协助刷牙或使用口腔清洁棉。', tip: '不能自理的老人要做口腔护理' },
      { id: 's3', title: '温水擦脚', description: '用温水泡脚5-10分钟，擦干。', tip: '糖尿病老人注意水温，检查足部皮肤' },
      { id: 's4', title: '整理床铺', description: '更换枕套，整理被褥，取舒适睡姿。' },
    ],
  },
]

export const mockCaregivers: Caregiver[] = [
  { id: 'c1', name: '王阿姨', avatar: '', role: 'primary', roleLabel: '核心照护者', isOnDuty: true },
  { id: 'c2', name: '李先生', avatar: '', role: 'remote', roleLabel: '远程子女', isOnDuty: false },
  { id: 'c3', name: '张护工', avatar: '', role: 'professional', roleLabel: '专业护工', isOnDuty: false },
  { id: 'c4', name: '刘阿姨', avatar: '', role: 'assistant', roleLabel: '协助照护', isOnDuty: false },
]

export const mockHandoffs: HandoffRecord[] = [
  {
    id: 'h1',
    fromName: '张护工',
    toName: '王阿姨',
    time: '今天 08:00',
    pendingTasks: ['协助翻身 09:00', '午餐协助进食 12:00', '下午翻身 15:00'],
    medicationNotes: '晨间降压药已服用，血压135/85，正常',
    dietNotes: '早餐吃了半碗粥、一个鸡蛋，食欲良好',
    moodNotes: '早上精神不错，看了一会儿电视',
    healthNotes: '夜间睡眠6小时，起夜2次，无异常',
    abnormalItems: [],
  },
  {
    id: 'h2',
    fromName: '王阿姨',
    toName: '张护工',
    time: '昨天 20:00',
    pendingTasks: ['晚间服药 20:00', '睡前洗漱 21:00'],
    medicationNotes: '下午血糖8.2mmol/L，略高',
    dietNotes: '晚餐吃得不多，说胃口不太好',
    moodNotes: '下午情绪有点低落，想儿子了',
    healthNotes: '午后有点头晕，休息后缓解',
    abnormalItems: ['血糖略高', '午后头晕'],
  },
]

export const mockElder: ElderProfile = {
  name: '李奶奶',
  age: 82,
  gender: '女',
  conditions: ['高血压', '2型糖尿病', '轻度骨质疏松'],
  medications: ['苯磺酸氨氯地平片（降压）', '盐酸二甲双胍（降糖）', '碳酸钙D3（补钙）', '阿司匹林肠溶片'],
  careLevel: '中度照护',
}
