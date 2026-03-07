import { NextRequest } from 'next/server'
import { analyzeRequirements } from '@/lib/ai-service'
import { createApiHandler, validateRequest } from '@/lib/api-utils'

interface AnalyzeRequest {
  description: string
}

export const POST = createApiHandler(async (req: NextRequest) => {
  const { description } = await validateRequest<AnalyzeRequest>(req, ['description'])
  return await analyzeRequirements(description)
})
