import { NextRequest } from 'next/server'
import { designDatabase } from '@/lib/ai-service'
import { createApiHandler, validateRequest } from '@/lib/api-utils'

interface DesignDatabaseRequest {
  requirements: string
}

export const POST = createApiHandler(async (req: NextRequest) => {
  const { requirements } = await validateRequest<DesignDatabaseRequest>(req, ['requirements'])
  return await designDatabase(requirements)
})
