import OpenAI from 'openai';
import { SYSTEM_PROMPTS } from '@/constants/project';
import { logAICall, logError } from './logger';

const openai = new OpenAI({
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.longcat.chat/openai/',
  apiKey: process.env.OPENAI_API_KEY || 'NONE',
});

// 为每个步骤定义名称
const STEP_NAMES = ['需求理解', '接口设计', '数据库设计', '业务逻辑设计', '代码生成'];

export const generateResponse = async (
  systemPrompt: string,
  userPrompt: string,
  stepName: string = '未知步骤'
): Promise<string> => {
  let response = '';
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'LongCat-Flash-Lite',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: parseFloat(process.env.TEMPERATURE || "0.7"),
      max_tokens: parseInt(process.env.MAX_TOKENS || "64000"),
    });

    response = completion.choices[0].message.content || '';
    return response;
  } catch (error) {
    console.error('AI请求失败:', error);
    logError(stepName, error instanceof Error ? error.message : String(error));
    throw new Error('AI服务暂时不可用');
  } finally {
    // 记录调用信息
    logAICall(stepName, systemPrompt, userPrompt, response);
  }
};

export const analyzeRequirements = async (description: string, systemPrompt?: string) => {
  const prompt = systemPrompt || SYSTEM_PROMPTS[0];

  const userPrompt = `请分析以下软件项目描述的需求：

${description}`;

  return await generateResponse(prompt, userPrompt, STEP_NAMES[0]);
};

export const designInterfaces = async (requirements: string, systemPrompt?: string) => {
  const prompt = systemPrompt || SYSTEM_PROMPTS[1];

  const userPrompt = `请根据以下需求分析结果设计软件系统的接口：

${requirements}`;

  return await generateResponse(prompt, userPrompt, STEP_NAMES[1]);
};

export const designDatabase = async (requirements: string, systemPrompt?: string) => {
  const prompt = systemPrompt || SYSTEM_PROMPTS[2];

  const userPrompt = `请根据以下需求分析结果设计软件系统的数据库结构：

${requirements}`;

  return await generateResponse(prompt, userPrompt, STEP_NAMES[2]);
};

export const designBusinessLogic = async (interfaces: string, systemPrompt?: string) => {
  const prompt = systemPrompt || SYSTEM_PROMPTS[3];

  const userPrompt = `请根据以下接口设计结果设计软件系统的处理逻辑：

${interfaces}`;

  return await generateResponse(prompt, userPrompt, STEP_NAMES[3]);
};

export const generateCode = async (requirements: string, interfaces: string, businessLogic: string, systemPrompt?: string) => {
  const prompt = systemPrompt || SYSTEM_PROMPTS[4];

  const userPrompt = `请根据以下需求分析结果、接口设计结果和处理逻辑设计结果生成软件源代码：

需求分析结果：
${requirements}

接口设计结果：
${interfaces}

处理逻辑设计结果：
${businessLogic}`;

  return await generateResponse(prompt, userPrompt, STEP_NAMES[4]);
};
