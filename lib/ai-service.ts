import OpenAI from 'openai';
import { SYSTEM_PROMPTS } from '@/constants/project';

const openai = new OpenAI({
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.longcat.chat/openai/',
  apiKey: process.env.OPENAI_API_KEY || 'NONE',
});

export const generateResponse = async (systemPrompt: string, userPrompt: string) => {
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

    return completion.choices[0].message.content || '';
  } catch (error) {
    console.error('AI请求失败:', error);
    throw new Error('AI服务暂时不可用');
  }
};

export const analyzeRequirements = async (description: string) => {
  const systemPrompt = SYSTEM_PROMPTS[0];

  const userPrompt = `请分析以下软件项目描述的需求：

${description}`;

  return await generateResponse(systemPrompt, userPrompt);
};

export const designInterfaces = async (requirements: string) => {
  const systemPrompt = SYSTEM_PROMPTS[1];

  const userPrompt = `请根据以下需求分析结果设计软件系统的接口：

${requirements}`;

  return await generateResponse(systemPrompt, userPrompt);
};

export const designDatabase = async (requirements: string) => {
  const systemPrompt = SYSTEM_PROMPTS[2];

  const userPrompt = `请根据以下需求分析结果设计软件系统的数据库结构：

${requirements}`;

  return await generateResponse(systemPrompt, userPrompt);
};

export const designBusinessLogic = async (interfaces: string) => {
  const systemPrompt = SYSTEM_PROMPTS[3];

  const userPrompt = `请根据以下接口设计结果设计软件系统的处理逻辑：

${interfaces}`;

  return await generateResponse(systemPrompt, userPrompt);
};

export const generateCode = async (requirements: string, interfaces: string, businessLogic: string) => {
  const systemPrompt = SYSTEM_PROMPTS[4];

  const userPrompt = `请根据以下需求分析结果、接口设计结果和处理逻辑设计结果生成软件源代码：

需求分析结果：
${requirements}

接口设计结果：
${interfaces}

处理逻辑设计结果：
${businessLogic}`;

  return await generateResponse(systemPrompt, userPrompt);
};
