import { NextRequest } from 'next/server'
import { designInterfaces } from '@/lib/ai-service'
import { createApiHandler, validateRequest } from '@/lib/api-utils'

interface DesignInterfacesRequest {
  requirements: string
}

export const POST = createApiHandler(async (req: NextRequest) => {
  const { requirements } = await validateRequest<DesignInterfacesRequest>(req, ['requirements'])
  return await designInterfaces(requirements)
})
