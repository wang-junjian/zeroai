import { NextRequest, NextResponse } from 'next/server';
import { analyzeRequirements } from '@/lib/ai-service';

export async function POST(req: NextRequest) {
  try {
    const { description } = await req.json();
    const result = await analyzeRequirements(description);

    return NextResponse.json({
      code: '000000',
      msg: '调用成功',
      data: result,
    });
  } catch (error) {
    console.error('分析需求失败:', error);
    return NextResponse.json({
      code: '000001',
      msg: '分析需求失败',
      data: null,
    });
  }
}
