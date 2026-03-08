import { NextRequest } from 'next/server'
import { designDatabase } from '@/lib/ai-service'
import { createApiHandler, validateRequest } from '@/lib/api-utils'

interface DesignDatabaseRequest {
  requirements: string
  systemPrompt?: string
}

export const POST = createApiHandler(async (req: NextRequest) => {
  const { requirements, systemPrompt } = await validateRequest<DesignDatabaseRequest>(req, ['requirements'])
  return await designDatabase(requirements, systemPrompt)
})
