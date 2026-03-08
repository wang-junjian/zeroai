import { NextRequest } from 'next/server'
import { generateCode } from '@/lib/ai-service'
import { createApiHandler, validateRequest } from '@/lib/api-utils'

interface GenerateCodeRequest {
  requirements: string
  interfaces: string
  businessLogic: string
  systemPrompt?: string
}

export const POST = createApiHandler(async (req: NextRequest) => {
  const { requirements, interfaces, businessLogic, systemPrompt } = await validateRequest<GenerateCodeRequest>(
    req,
    ['requirements', 'interfaces', 'businessLogic']
  )
  return await generateCode(requirements, interfaces, businessLogic, systemPrompt)
})
