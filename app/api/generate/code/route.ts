import { NextRequest, NextResponse } from 'next/server';
import { generateCode } from '@/lib/ai-service';

export async function POST(req: NextRequest) {
  try {
    const { requirements, interfaces, businessLogic } = await req.json();
    const result = await generateCode(requirements, interfaces, businessLogic);

    return NextResponse.json({
      code: '000000',
      msg: '调用成功',
      data: result,
    });
  } catch (error) {
    console.error('生成代码失败:', error);
    return NextResponse.json({
      code: '000001',
      msg: '生成代码失败',
      data: null,
    });
  }
}
