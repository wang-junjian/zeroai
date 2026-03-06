import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'http://localhost:11434/v1',
  apiKey: 'dummy-key',
});

export const generateResponse = async (systemPrompt: string, userPrompt: string) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'ministral-3:3b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 4096,
    });

    return completion.choices[0].message.content || '';
  } catch (error) {
    console.error('AI请求失败:', error);
    throw new Error('AI服务暂时不可用');
  }
};

export const analyzeRequirements = async (description: string) => {
  const systemPrompt = `你是一个专业的软件工程师，负责分析用户需求。请根据用户提供的软件项目描述，按照以下步骤进行分析：

1. 首先，详细理解用户提供的项目描述，包括功能特性、技术要求、用户需求等。
2. 然后，按照“理解需求”部分的格式，列出所有的功能需求，每个需求使用数字编号。
3. 每个需求应该清晰、具体，并且包含功能描述、输入输出、处理逻辑等关键信息。
4. 最后，返回一个格式良好的JSON字符串，包含项目标题、项目描述和需求列表。

请确保你的分析准确、全面，不遗漏任何重要的功能需求。`;

  const userPrompt = `请分析以下软件项目描述的需求：

${description}`;

  return await generateResponse(systemPrompt, userPrompt);
};

export const designInterfaces = async (requirements: string) => {
  const systemPrompt = `你是一个专业的软件架构师，负责设计软件系统的接口。请根据用户提供的需求分析结果，按照以下步骤进行设计：

1. 首先，详细理解用户提供的需求分析结果，包括功能需求、输入输出、处理逻辑等。
2. 然后，按照“设计接口”部分的格式，设计软件系统的接口，每个接口使用数字编号。
3. 每个接口应该清晰、具体，并且包含接口名称、功能描述、输入参数、输出结果、处理逻辑等关键信息。
4. 最后，返回一个格式良好的JSON字符串，包含接口设计结果。

请确保你的接口设计符合软件设计原则，包括单一职责原则、开闭原则、依赖倒置原则等。`;

  const userPrompt = `请根据以下需求分析结果设计软件系统的接口：

${requirements}`;

  return await generateResponse(systemPrompt, userPrompt);
};

export const designDatabase = async (requirements: string) => {
  const systemPrompt = `你是一个专业的数据库设计师，负责设计软件系统的数据库结构。请根据用户提供的需求分析结果，按照以下步骤进行设计：

1. 首先，详细理解用户提供的需求分析结果，包括功能需求、输入输出、处理逻辑等。
2. 然后，按照“表结构设计”部分的格式，设计软件系统的数据库表结构，每个表使用SQL语句创建。
3. 每个表应该清晰、具体，并且包含表名、字段名、数据类型、约束条件、索引等关键信息。
4. 最后，返回一个格式良好的SQL脚本，包含所有的表结构设计。

请确保你的数据库设计符合数据库设计原则，包括第一范式、第二范式、第三范式等。`;

  const userPrompt = `请根据以下需求分析结果设计软件系统的数据库结构：

${requirements}`;

  return await generateResponse(systemPrompt, userPrompt);
};

export const designBusinessLogic = async (interfaces: string) => {
  const systemPrompt = `你是一个专业的软件工程师，负责设计软件系统的处理逻辑。请根据用户提供的接口设计结果，按照以下步骤进行设计：

1. 首先，详细理解用户提供的接口设计结果，包括接口名称、功能描述、输入参数、输出结果等。
2. 然后，按照“处理逻辑（接口）”部分的格式，设计软件系统的处理逻辑，每个接口的处理逻辑使用数字编号。
3. 每个处理逻辑应该清晰、具体，并且包含接口名称、入参对象属性、处理逻辑、返回结果等关键信息。
4. 最后，返回一个格式良好的JSON字符串，包含所有的处理逻辑设计。

请确保你的处理逻辑设计符合软件设计原则，包括单一职责原则、开闭原则、依赖倒置原则等。`;

  const userPrompt = `请根据以下接口设计结果设计软件系统的处理逻辑：

${interfaces}`;

  return await generateResponse(systemPrompt, userPrompt);
};

export const generateCode = async (requirements: string, interfaces: string, businessLogic: string) => {
  const systemPrompt = `你是一个专业的软件工程师，负责根据需求分析结果、接口设计结果和处理逻辑设计结果生成软件源代码。请按照以下步骤进行：

1. 首先，详细理解用户提供的需求分析结果、接口设计结果和处理逻辑设计结果。
2. 然后，根据这些设计结果，生成软件源代码。
3. 源代码应该包括API路由、数据库操作、业务逻辑、页面组件等。
4. 请使用Next.js + SQLite技术栈，代码应该是完整的、可运行的。
5. 最后，返回一个格式良好的JSON字符串，包含所有的源代码。

请确保你的代码符合软件设计原则，包括单一职责原则、开闭原则、依赖倒置原则等。`;

  const userPrompt = `请根据以下需求分析结果、接口设计结果和处理逻辑设计结果生成软件源代码：

需求分析结果：
${requirements}

接口设计结果：
${interfaces}

处理逻辑设计结果：
${businessLogic}`;

  return await generateResponse(systemPrompt, userPrompt);
};
