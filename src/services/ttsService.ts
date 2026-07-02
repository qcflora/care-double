/**
 * TTS 语音播报服务
 *
 * 使用浏览器内置 Web Speech API (SpeechSynthesis)
 * 提供语速控制、暂停/恢复/停止功能
 */

let currentUtterance: SpeechSynthesisUtterance | null = null
let savedRate: number = 1.0

/**
 * 检查浏览器是否支持语音合成
 */
export function isTTSSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

/**
 * 获取可用的中文语音
 */
function getChineseVoice(): SpeechSynthesisVoice | null {
  if (!isTTSSupported()) return null
  const voices = window.speechSynthesis.getVoices()
  return voices.find(v => v.lang.startsWith('zh')) || null
}

/**
 * 播放语音
 * @param text 要播放的文本
 * @param options 语速等选项
 * @param onEnd 播放结束回调
 */
export function speak(
  text: string,
  options?: { rate?: number; onEnd?: () => void; onStart?: () => void }
): void {
  if (!isTTSSupported()) {
    console.warn('TTS not supported in this browser')
    options?.onEnd?.()
    return
  }

  // 停止当前播放
  stop()

  const utterance = new SpeechSynthesisUtterance(text)
  const voice = getChineseVoice()
  if (voice) {
    utterance.voice = voice
  }
  utterance.lang = 'zh-CN'
  utterance.rate = options?.rate ?? savedRate
  utterance.pitch = 1.0
  utterance.volume = 1.0

  if (options?.onStart) {
    utterance.onstart = options.onStart
  }
  if (options?.onEnd) {
    utterance.onend = options.onEnd
    utterance.onerror = options.onEnd
  }

  currentUtterance = utterance
  window.speechSynthesis.speak(utterance)
}

/**
 * 暂停播放
 */
export function pause(): void {
  if (isTTSSupported()) {
    window.speechSynthesis.pause()
  }
}

/**
 * 恢复播放
 */
export function resume(): void {
  if (isTTSSupported()) {
    window.speechSynthesis.resume()
  }
}

/**
 * 停止播放
 */
export function stop(): void {
  if (isTTSSupported()) {
    window.speechSynthesis.cancel()
  }
  currentUtterance = null
}

/**
 * 是否正在播放
 */
export function isSpeaking(): boolean {
  return isTTSSupported() && window.speechSynthesis.speaking
}

/**
 * 设置语速
 */
export function setRate(rate: number): void {
  savedRate = rate
}

/**
 * 获取当前语速
 */
export function getRate(): number {
  return savedRate
}

/**
 * 初始化语音列表（某些浏览器需要异步加载）
 */
export function initVoices(): void {
  if (isTTSSupported()) {
    window.speechSynthesis.getVoices()
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices()
    }
  }
}
