import { NextRequest } from 'next/server'
import { designBusinessLogic } from '@/lib/ai-service'
import { createApiHandler, validateRequest } from '@/lib/api-utils'

interface DesignBusinessLogicRequest {
  interfaces: string
  systemPrompt?: string
  techStack?: string[]
}

export const POST = createApiHandler(async (req: NextRequest) => {
  const { interfaces, systemPrompt, techStack } = await validateRequest<DesignBusinessLogicRequest>(req, ['interfaces'])
  return await designBusinessLogic(interfaces, systemPrompt, techStack)
})
