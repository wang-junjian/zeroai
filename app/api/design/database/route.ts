import { NextRequest, NextResponse } from 'next/server';
import { designDatabase } from '@/lib/ai-service';

export async function POST(req: NextRequest) {
  try {
    const { requirements } = await req.json();
    const result = await designDatabase(requirements);

    return NextResponse.json({
      code: '000000',
      msg: '调用成功',
      data: result,
    });
  } catch (error) {
    console.error('设计数据库失败:', error);
    return NextResponse.json({
      code: '000001',
      msg: '设计数据库失败',
      data: null,
    });
  }
}
