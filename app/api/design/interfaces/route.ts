import { NextRequest } from 'next/server'
import { designInterfaces } from '@/lib/ai-service'
import { createApiHandler, validateRequest } from '@/lib/api-utils'

interface DesignInterfacesRequest {
  requirements: string
  systemPrompt?: string
}

export const POST = createApiHandler(async (req: NextRequest) => {
  const { requirements, systemPrompt } = await validateRequest<DesignInterfacesRequest>(req, ['requirements'])
  return await designInterfaces(requirements, systemPrompt)
})
