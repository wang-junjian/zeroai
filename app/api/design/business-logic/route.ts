import { NextRequest, NextResponse } from 'next/server';
import { designBusinessLogic } from '@/lib/ai-service';

export async function POST(req: NextRequest) {
  try {
    const { interfaces } = await req.json();
    const result = await designBusinessLogic(interfaces);

    return NextResponse.json({
      code: '000000',
      msg: '调用成功',
      data: result,
    });
  } catch (error) {
    console.error('设计业务逻辑失败:', error);
    return NextResponse.json({
      code: '000001',
      msg: '设计业务逻辑失败',
      data: null,
    });
  }
}
