/**
 * 安全解码 URI 组件
 * 如果标准 decodeURIComponent 失败，尝试逐字符解码
 *
 * @param encoded - 编码后的字符串
 * @returns 解码后的字符串
 */
export function safeDecodeURIComponent(encoded: string): string {
  try {
    return decodeURIComponent(encoded)
  } catch (e) {
    return encoded.replace(/%([0-9A-Fa-f]{2})/g, (match, hex) => {
      try {
        return String.fromCharCode(parseInt(hex, 16))
      } catch {
        return match
      }
    })
  }
}

/**
 * 生成唯一的日志 ID
 *
 * @returns 日志唯一标识符
 */
export function createLogId(): string {
  return 'log-' + Date.now() + '-' + Math.random()
}

/**
 * 截断文本并添加省略号
 *
 * @param text - 原始文本
 * @param maxLength - 最大长度
 * @returns 截断后的文本
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
