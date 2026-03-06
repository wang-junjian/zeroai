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

export function createLogId(): string {
  return 'log-' + Date.now() + '-' + Math.random()
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
