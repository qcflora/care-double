/**
 * TRAE AI 服务层
 *
 * 三个核心链路：
 * 1. RAG 动态语音引导生成
 * 2. 语音交接班自动摘要 + 异常检测
 * 3. 同源多模态内容生成
 *
 * 每个链路包含完整的 Prompt 模板和知识库检索逻辑，
 * 可对接真实 LLM API（如 TRAE AI 引擎）。
 */

import { ragKnowledgeBase } from './knowledgeBase'
import type { ElderProfile, GuideStep, HandoffRecord } from '../types'

// ============================================================
// 链路一：RAG 动态语音引导生成
// ============================================================

interface GuideRequest {
  taskType: string
  taskTitle: string
  elder: ElderProfile
  todayStatus?: {
    bloodPressure?: string
    bloodSugar?: number
    mood?: string
  }
}

/**
 * 根据老人档案 + 当天状态，通过 RAG 检索 + LLM 生成个性化引导脚本
 */
export async function generateGuideSteps(request: GuideRequest): Promise<GuideStep[]> {
  // 1. RAG 检索相关知识片段
  const relevantKnowledge = retrieveRelevantKnowledge(request.taskType, request.elder.conditions)

  // 2. 构建 Prompt
  const prompt = buildGuidePrompt(request, relevantKnowledge)

  // 3. 调用 LLM（此处模拟 TRAE AI 引擎调用，实际可替换为真实 API）
  const result = await callLLM(prompt, 'guide')

  return result
}

function retrieveRelevantKnowledge(taskType: string, conditions: string[]) {
  const knowledge: string[] = []

  // 根据任务类型检索
  const taskKnowledge = ragKnowledgeBase[taskType]
  if (taskKnowledge) {
    knowledge.push(...taskKnowledge.general)
  }

  // 根据疾病检索特殊注意事项
  conditions.forEach(condition => {
    if (taskKnowledge?.conditionSpecific?.[condition]) {
      knowledge.push(...taskKnowledge.conditionSpecific[condition])
    }
  })

  return knowledge
}

function buildGuidePrompt(request: GuideRequest, knowledge: string[]): string {
  const { elder, taskTitle, todayStatus } = request

  return `系统角色：你是一位资深养老护理专家，精通WHO照护标准和国家"九防"规范。

用户输入：
- 老人档案：${elder.age}岁${elder.gender}，${elder.conditions.join('、')}
- 当前用药：${elder.medications.join('、')}
- 当天状态：${todayStatus?.bloodPressure ? `血压${todayStatus.bloodPressure}` : '未测'}，${todayStatus?.bloodSugar ? `血糖${todayStatus.bloodSugar}mmol/L` : '未测'}，${todayStatus?.mood || '情绪正常'}
- 任务类型：${taskTitle}

请生成5步以内的指导脚本，要求：
1. 每步包含标题、操作描述、注意事项
2. 语言通俗，适合50-70岁照护者理解
3. 输出为JSON数组格式

RAG 检索上下文：
${knowledge.map(k => `[${k}]`).join('\n')}

请根据老人疾病和当天状态，在 tip 中体现个性化提醒。`
}

// ============================================================
// 链路二：语音交接班自动摘要 + 异常检测
// ============================================================

interface HandoffRequest {
  rawText: string
  fromName: string
  toName: string
}

/**
 * 将照护者的口语化交接内容，结构化提取为交接单
 */
export async function generateHandoffSummary(request: HandoffRequest): Promise<Partial<HandoffRecord>> {
  // 1. 构建提取 Prompt
  const prompt = buildHandoffPrompt(request.rawText)

  // 2. 调用 LLM 进行结构化提取
  const result = await callLLM(prompt, 'handoff')

  return result
}

function buildHandoffPrompt(rawText: string): string {
  return `系统角色：你是一位养老护理交接班记录员，请将照护者的口语化交接内容提取为结构化交接单。

用户语音转文字：
"${rawText}"

请提取为以下JSON格式：
{
  "medicationNotes": "用药情况摘要",
  "dietNotes": "饮食情况摘要",
  "moodNotes": "情绪状态摘要",
  "healthNotes": "身体状况摘要",
  "abnormalItems": ["异常项列表"],
  "pendingTasks": ["待办任务列表"]
}

异常判定规则：
- 血糖 > 7.0 mmol/L 标记为异常
- 血压 > 140/90 标记为异常
- 食欲明显下降标记为异常
- 情绪低落持续标记为异常
- 皮肤发红/破损标记为异常`
}

// ============================================================
// 链路三：同源多模态内容生成
// ============================================================

interface MultimodalRequest {
  sourceContent: string
  title: string
}

interface MultimodalResult {
  audioScript: string
  imageCards: { step: number; title: string; description: string; imagePrompt: string }[]
  printLayout: string
}

/**
 * 同一份源知识，生成语音/图文/打印三种形态
 */
export async function generateMultimodalContent(request: MultimodalRequest): Promise<MultimodalResult> {
  const prompt = buildMultimodalPrompt(request)

  const result = await callLLM(prompt, 'multimodal')

  return result
}

function buildMultimodalPrompt(request: MultimodalRequest): string {
  return `系统角色：你是照护内容多模态生成引擎，请将同一份照护知识输出为三种形态。

源知识：
${request.sourceContent}

请分别生成：

【语音版】适合低识字率照护者的口语化播报脚本，每步30秒以内，语气亲切温和。

【图文版】5张步骤卡片，每张含：步骤编号、标题（8字内）、操作描述（30字内）、插图提示词。

【打印版】A4纸排版格式，含标题、步骤详情、注意事项框。

输出JSON格式：
{
  "audioScript": "完整语音脚本文本",
  "imageCards": [{"step": 1, "title": "", "description": "", "imagePrompt": ""}],
  "printLayout": "Markdown格式的A4排版内容"
}`
}

// ============================================================
// LLM 调用层（可对接真实 TRAE AI 引擎）
// ============================================================

/**
 * 调用 LLM 进行推理
 *
 * 实际部署时替换为真实 TRAE AI API 调用：
 *   const response = await fetch('https://api.trae.ai/v1/chat/completions', {
 *     method: 'POST',
 *     headers: { 'Authorization': `Bearer ${API_KEY}` },
 *     body: JSON.stringify({ model: 'trae-large', messages: [...] })
 *   })
 *
 * 当前 Demo 使用预配置的智能响应模拟，展示完整数据流和 Prompt 工程
 */
async function callLLM(prompt: string, type: 'guide' | 'handoff' | 'multimodal'): Promise<any> {
  // 模拟网络延迟，体现真实 AI 调用感
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 600))

  // 根据类型返回预配置的智能响应
  // 实际项目中此处为真实 LLM API 调用
  switch (type) {
    case 'guide':
      return getGuideResponse(prompt)
    case 'handoff':
      return getHandoffResponse(prompt)
    case 'multimodal':
      return getMultimodalResponse(prompt)
  }
}

// ============================================================
// 预配置智能响应（模拟 LLM 输出）
// ============================================================

function getGuideResponse(prompt: string): GuideStep[] {
  const hasOsteoporosis = prompt.includes('骨质疏松')
  const hasHypertension = prompt.includes('高血压')
  const hasDiabetes = prompt.includes('糖尿病')
  const highBloodSugar = prompt.includes('血糖8.2') || prompt.includes('略高')
  const lowMood = prompt.includes('情绪低落')

  const taskTitleMatch = prompt.match(/任务类型：(.+)/)
  const taskTitle = taskTitleMatch ? taskTitleMatch[1].trim() : ''

  if (taskTitle.includes('翻身')) {
    return [
      {
        id: 'ai-1',
        title: '翻身前准备',
        description: '关好门窗，调节室温。轻轻告诉老人"我要帮你翻个身"，观察老人反应。',
        tip: hasOsteoporosis
          ? '李奶奶有骨质疏松，翻身时动作要特别轻柔，避免拉扯手臂关节'
          : '动作要轻柔，提前告知老人，让其有心理准备'
      },
      {
        id: 'ai-2',
        title: '移动双腿',
        description: '将老人双膝轻轻弯曲，双脚平放床上。一手托住膝部，一手扶住脚踝。',
        tip: hasOsteoporosis
          ? '骨质疏松患者关节脆弱，切勿用力拉扯膝关节'
          : '动作轻柔，避免拉扯关节'
      },
      {
        id: 'ai-3',
        title: '侧身翻转',
        description: '一手扶肩一手扶髋，缓慢转向对侧。整个过程约10秒，中间可停顿。',
        tip: hasHypertension
          ? '高血压患者翻身速度要慢，翻身后半卧位休息2分钟，防止头晕'
          : '翻身速度不宜过快，留意老人反应'
      },
      {
        id: 'ai-4',
        title: '垫枕支撑',
        description: '背部垫软枕，双腿间夹软垫。检查足跟、骶尾部、耳廓是否悬空。',
        tip: highBloodSugar && hasDiabetes
          ? '今日血糖略高，翻身时注意观察皮肤弹性，如有干燥脱水迹象及时补水'
          : '检查骨突部位是否悬空减压，预防压疮'
      },
      {
        id: 'ai-5',
        title: '检查与记录',
        description: '检查受压部位皮肤颜色，记录翻身时间。与老人简单交流，了解舒适度。',
        tip: lowMood
          ? '老人今日情绪低落，翻身时可轻声聊天，这也是心理支持的好时机'
          : '翻身时与老人交流，既了解舒适度，也给予心理陪伴'
      },
    ]
  }

  if (taskTitle.includes('药') || taskTitle.includes('服药')) {
    return [
      {
        id: 'ai-1',
        title: '核对药物',
        description: '取出药物，仔细核对药名、剂量和有效期，确认无误。',
        tip: hasHypertension ? '降压药建议晨起空腹服用，效果最佳' : '按医嘱时间服用'
      },
      {
        id: 'ai-2',
        title: '准备温水',
        description: '准备一杯约200ml的温水，温度以不烫嘴为宜。',
        tip: '避免用茶水、牛奶送服药物，以免影响药效'
      },
      {
        id: 'ai-3',
        title: '协助坐起',
        description: '慢慢扶起老人，保持半卧位至少30度。',
        tip: hasHypertension ? '动作要慢，防止体位性低血压导致头晕' : '动作缓慢，让老人适应'
      },
      {
        id: 'ai-4',
        title: '送服药物',
        description: '将药片放入老人舌后，喝水咽下。确认药物全部咽下。',
        tip: hasDiabetes ? '服药后留意有无低血糖反应（心慌、出汗）' : '确认药物咽下，无残留'
      },
      {
        id: 'ai-5',
        title: '观察记录',
        description: '保持坐姿15分钟，观察有无不适反应，记录服药时间。',
        tip: highBloodSugar ? '今日血糖偏高，服药后关注血糖变化趋势' : '如出现不适，及时记录并告知'
      },
    ]
  }

  if (taskTitle.includes('进食') || taskTitle.includes('喂') || taskTitle.includes('餐')) {
    return [
      {
        id: 'ai-1',
        title: '餐前准备',
        description: '协助老人洗手、戴好围兜，取舒适坐位。',
        tip: '餐前30分钟避免剧烈活动'
      },
      {
        id: 'ai-2',
        title: '检查食物温度',
        description: '触摸餐盘外壁确认温度适宜，取少量试尝。',
        tip: hasDiabetes ? '注意控制碳水摄入量，监测餐后血糖' : '防止烫伤，温度以不烫手为宜'
      },
      {
        id: 'ai-3',
        title: '协助进食',
        description: '每次一小勺，确认咽下后再喂下一口。',
        tip: '速度要慢，每口量约1/2勺，观察吞咽情况防误吸'
      },
      {
        id: 'ai-4',
        title: '餐后清洁',
        description: '协助擦嘴、漱口，整理衣物。',
        tip: '餐后保持坐位30分钟再躺下，防止反流'
      },
    ]
  }

  if (taskTitle.includes('洗漱') || taskTitle.includes('澡') || taskTitle.includes('清洁')) {
    return [
      {
        id: 'ai-1',
        title: '准备用物',
        description: '准备温水、毛巾、洗漱用品、干净衣物，调节室温和水温。',
        tip: '水温以38-40度为宜，用手腕内侧试温不烫手'
      },
      {
        id: 'ai-2',
        title: '洗脸洗手',
        description: '先用温水湿润面部和双手，再用洁面产品轻柔清洁，最后冲洗干净。',
        tip: '注意清洁眼角、耳后、指缝等容易藏污纳垢的部位'
      },
      {
        id: 'ai-3',
        title: '口腔护理',
        description: '协助老人刷牙，或用口腔清洁棉擦拭牙齿和牙龈。',
        tip: '不能自理的老人要做口腔护理，预防口腔感染和吸入性肺炎'
      },
      {
        id: 'ai-4',
        title: '温水擦身/泡脚',
        description: '用温水毛巾擦拭身体，或泡脚5-10分钟，擦干涂润肤乳。',
        tip: hasDiabetes
          ? '糖尿病老人注意水温不宜过高，仔细检查足部皮肤有无破损'
          : '注意保暖，只暴露正在清洁的部位，避免着凉'
      },
      {
        id: 'ai-5',
        title: '整理床铺',
        description: '更换枕套，整理被褥，协助老人取舒适睡姿。',
        tip: lowMood ? '睡前可以陪老人聊两句，安抚情绪有助睡眠' : '检查床铺是否平整，有无碎屑，预防压疮'
      },
    ]
  }

  if (taskTitle.includes('血压') || taskTitle.includes('血糖') || taskTitle.includes('测量')) {
    return [
      {
        id: 'ai-1',
        title: '准备仪器',
        description: '准备血压计、血糖仪、试纸、采血针、酒精棉。',
        tip: '检查试纸有效期，确保仪器电量充足'
      },
      {
        id: 'ai-2',
        title: '测量血压',
        description: '静坐5分钟后，袖带绑于肘上2cm处，与心脏同高。',
        tip: hasHypertension ? '测量前30分钟避免吸烟、饮咖啡，放松情绪' : '手臂与心脏同高，不要说话'
      },
      {
        id: 'ai-3',
        title: '测量血糖',
        description: '酒精消毒指尖，待干后采血，滴于试纸上读取数值。',
        tip: hasDiabetes ? '采血部位轮换，避免反复扎同一处，定期校准仪器' : '采血量要足够，避免结果不准'
      },
      {
        id: 'ai-4',
        title: '记录数值',
        description: '将血压、血糖数值记录到健康档案中。',
        tip: highBloodSugar && hasDiabetes ? '今日血糖偏高，记录后留意饮食和用药情况' : '异常数值及时标注提醒'
      },
    ]
  }

  // 默认通用步骤
  return [
    { id: 'ai-1', title: '准备', description: '准备好所需物品，调节环境舒适度。', tip: '提前告知老人即将进行的操作' },
    { id: 'ai-2', title: '执行', description: '按照标准流程进行操作，动作轻柔。', tip: '随时观察老人反应，如有不适立即停止' },
    { id: 'ai-3', title: '检查', description: '操作完成后检查老人状态，确认无异常。', tip: '记录操作时间和老人状态' },
  ]
}

function getHandoffResponse(prompt: string): Partial<HandoffRecord> {
  // 从 prompt 中解析语音转文字内容，进行结构化提取
  const rawText = prompt.match(/"([^"]+)"/s)?.[1] || ''

  const hasMedication = rawText.includes('药') || rawText.includes('血压')
  const hasDiet = rawText.includes('吃') || rawText.includes('餐') || rawText.includes('食欲')
  const hasMood = rawText.includes('情绪') || rawText.includes('低落') || rawText.includes('想')
  const hasHealth = rawText.includes('翻身') || rawText.includes('皮肤') || rawText.includes('血糖')
  const hasAbnormal = rawText.includes('高') || rawText.includes('低落') || rawText.includes('没胃口') || rawText.includes('不好')

  const abnormalItems: string[] = []

  // 检测血糖异常
  const bloodSugarMatch = rawText.match(/血糖.*?(\d+\.?\d*)/)
  if (bloodSugarMatch && parseFloat(bloodSugarMatch[1]) > 7.0) {
    abnormalItems.push(`血糖偏高(${bloodSugarMatch[1]}mmol/L)`)
  }

  // 检测血压异常
  const bpMatch = rawText.match(/血压.*?(\d+)\D+(\d+)/)
  if (bpMatch && (parseInt(bpMatch[1]) > 140 || parseInt(bpMatch[2]) > 90)) {
    abnormalItems.push(`血压偏高(${bpMatch[1]}/${bpMatch[2]})`)
  }

  // 检测食欲下降
  if (rawText.includes('没胃口') || rawText.includes('没吃完') || rawText.includes('不好') || rawText.includes('半碗')) {
    abnormalItems.push('食欲下降')
  }

  // 检测情绪低落
  if (rawText.includes('低落') || rawText.includes('想儿子') || rawText.includes('想家')) {
    abnormalItems.push('情绪低落')
  }

  return {
    id: `h-${Date.now()}`,
    fromName: '',
    toName: '',
    time: `刚刚 ${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`,
    pendingTasks: [],
    medicationNotes: hasMedication
      ? extractSentence(rawText, ['药', '血压'])
      : '暂无用药记录',
    dietNotes: hasDiet
      ? extractSentence(rawText, ['吃', '餐', '粥', '鸡蛋'])
      : '暂无饮食记录',
    moodNotes: hasMood
      ? extractSentence(rawText, ['情绪', '低落', '想', '聊'])
      : '情绪状态正常',
    healthNotes: hasHealth
      ? extractSentence(rawText, ['翻身', '皮肤', '血糖'])
      : '身体状况正常',
    abnormalItems,
  }
}

function extractSentence(text: string, keywords: string[]): string {
  const sentences = text.split(/[。\n，,]/).filter(s => s.trim())
  const matched = sentences.filter(s => keywords.some(k => s.includes(k)))
  return matched.length > 0 ? matched.join('，') : '暂无相关信息'
}

function getMultimodalResponse(prompt: string): MultimodalResult {
  const isTurning = prompt.includes('翻身')

  if (isTurning) {
    return {
      audioScript: `你好，现在我们来学习如何帮老人安全翻身。

首先，做好准备。关好门窗，调节室温，把盖被掀开。注意保暖，别让老人着凉。

第二步，移动老人的双腿。轻轻把老人的双膝弯曲，双脚平放在床上。动作一定要轻柔。

第三步，帮老人侧身。一手扶住肩膀，一手扶住髋部，慢慢转向另一侧。整个过程大约十秒钟，中间可以停顿一下。

第四步，垫好枕头。在老人背后垫一个软枕，两腿之间夹一个软垫。检查一下脚后跟、耳朵有没有被压住。

最后，检查皮肤和记录。看看刚才受压的部位皮肤有没有发红，记下翻身的时间。跟老人聊两句，问问舒不舒服。

做得很好，你很棒。`,
      imageCards: [
        { step: 1, title: '翻身准备', description: '关门窗调室温，掀开盖被', imagePrompt: 'nursing care, closing window, adjusting room temperature, elderly care scene' },
        { step: 2, title: '移动双腿', description: '弯曲双膝，双脚平放床上', imagePrompt: 'hands gently bending elderly person knees on bed, nursing illustration' },
        { step: 3, title: '侧身翻转', description: '扶肩扶髋，缓慢转向对侧', imagePrompt: 'caregiver helping elderly person turn sideways on bed' },
        { step: 4, title: '垫枕支撑', description: '背部垫枕，腿间夹垫', imagePrompt: 'placing pillows behind elderly person back and between legs' },
        { step: 5, title: '检查记录', description: '查看皮肤，记录时间', imagePrompt: 'caregiver checking elderly person skin, writing notes' },
      ],
      printLayout: `# 协助老人翻身操作手册（家庭版）

## 操作步骤

**第一步：翻身前准备**
关好门窗，调节室温，掀开盖被。注意保暖，避免着凉。

**第二步：移动双腿**
将老人双膝轻轻弯曲，双脚平放床上。动作轻柔，避免拉扯关节。

**第三步：侧身翻转**
一手扶肩，一手扶髋，将老人轻轻转向对侧。翻身时注意保护老人头部。

**第四步：垫枕支撑**
背部垫软枕，双腿间夹软垫。足跟、耳廓等骨突处悬空减压。

**第五步：检查记录**
检查受压部位皮肤，记录翻身时间。与老人交流了解舒适度。

## ⚠ 注意事项
- 操作时动作要轻柔，避免老人受伤
- 翻身频率建议每2小时一次
- 注意保暖，避免着凉
- 如有疑问请咨询医护人员

## 记录表
| 日期 | 时间 | 体位 | 皮肤情况 | 签名 |
|------|------|------|---------|------|
|      |      |      |         |      |

---
照护双环 · 家庭照护指导手册`,
    }
  }

  return {
    audioScript: '暂无语音脚本',
    imageCards: [],
    printLayout: '暂无打印内容',
  }
}
