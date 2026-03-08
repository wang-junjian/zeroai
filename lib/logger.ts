import fs from 'fs';
import path from 'path';

// 确保日志目录存在
const LOGS_DIR = path.join(process.cwd(), 'logs');
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// 格式化时间戳（YYYY-MM-DD HH:mm:ss.SSS）
const formatTimestamp = (date: Date = new Date()): string => {
  const pad = (n: number): string => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${(date.getMilliseconds() / 1000).toFixed(3).slice(2, 5)}`;
};

// 生成文件名（YYYY-MM-DD_logs.txt）
const getLogFileName = (): string => {
  const today = new Date();
  const pad = (n: number): string => n.toString().padStart(2, '0');
  return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}_logs.txt`;
};

// 记录日志到文件
const writeToLog = (message: string): void => {
  try {
    const logFile = path.join(LOGS_DIR, getLogFileName());
    const timestamp = formatTimestamp();
    const logEntry = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(logFile, logEntry, 'utf8');
    console.log(logEntry.trim()); // 同时输出到控制台
  } catch (error) {
    console.error('日志写入失败:', error);
  }
};

// 记录 AI 调用的完整信息
export const logAICall = (
  stepName: string,
  systemPrompt: string,
  userPrompt: string,
  response: string
): void => {
  // 截断过长的内容以避免日志过大
  const truncate = (text: string, maxLength: number = 1000): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  writeToLog(`=== 开始步骤：${stepName} ===`);
  writeToLog(`系统提示：${truncate(systemPrompt)}`);
  writeToLog(`用户输入：${truncate(userPrompt)}`);
  writeToLog(`AI 响应：${truncate(response)}`);
  writeToLog('=== 步骤完成 ===\n');
};

// 记录错误信息
export const logError = (stepName: string, error: string): void => {
  writeToLog(`=== 步骤：${stepName} 出错 ===`);
  writeToLog(`错误信息：${error}`);
  writeToLog('=== 错误完成 ===\n');
};

// 记录一般信息
export const logInfo = (stepName: string, message: string): void => {
  writeToLog(`=== 步骤：${stepName} ===`);
  writeToLog(`信息：${message}`);
  writeToLog('=== 信息完成 ===\n');
};

export { LOGS_DIR };
