import { NextRequest, NextResponse } from 'next/server';
import { designInterfaces } from '@/lib/ai-service';

export async function POST(req: NextRequest) {
  try {
    const { requirements } = await req.json();
    const result = await designInterfaces(requirements);

    return NextResponse.json({
      code: '000000',
      msg: '调用成功',
      data: result,
    });
  } catch (error) {
    console.error('设计接口失败:', error);
    return NextResponse.json({
      code: '000001',
      msg: '设计接口失败',
      data: null,
    });
  }
}
