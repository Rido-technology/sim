import { createLogger } from '@sim/logger'
import { getProviderFromModel, calculateCost } from '@/providers/utils'
import { buildAPIUrl, buildAuthHeaders, extractAPIErrorMessage } from '@/executor/utils/http'
import type { BlockHandler, ExecutionContext } from '@/executor/types'
import type { BlockOutput } from '@/blocks/types'
import type { SerializedBlock } from '@/serializer/types'

const logger = createLogger('TextSummarizerBlockHandler')

export class TextSummarizerBlockHandler implements BlockHandler {
  canHandle(block: SerializedBlock): boolean {
    return block.metadata?.id === 'text-summarizer'
  }

  async execute(
    ctx: ExecutionContext,
    block: SerializedBlock,
    inputs: Record<string, any>
  ): Promise<BlockOutput> {
    const model = inputs.model
    const providerId = getProviderFromModel(model)

    // Concaténer prompt et texte dans le même message user
    const prompt = inputs.prompt || 'Summarize the following text.'
    const text = inputs.text || ''
    const userMessage = {
      role: 'user',
      content: `${prompt}\n\n${text}`,
    }
    const providerRequest: Record<string, any> = {
      provider: providerId,
      model,
      messages: [userMessage],
      temperature: inputs.temperature ?? 0.7,
      apiKey: inputs.apiKey,
      azureEndpoint: inputs.azureEndpoint,
      azureApiVersion: inputs.azureApiVersion,
      vertexProject: inputs.vertexProject,
      vertexLocation: inputs.vertexLocation,
      bedrockAccessKeyId: inputs.bedrockAccessKeyId,
      bedrockSecretKey: inputs.bedrockSecretKey,
      bedrockRegion: inputs.bedrockRegion,
      workflowId: ctx.workflowId,
      workspaceId: ctx.workspaceId,
    }

    try {
      const url = buildAPIUrl('/api/providers', ctx.userId ? { userId: ctx.userId } : {})
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: await buildAuthHeaders(),
        body: JSON.stringify(providerRequest),
      })

      if (!response.ok) {
        const errorMessage = await extractAPIErrorMessage(response)
        throw new Error(errorMessage)
      }

      const result = await response.json()
      const inputTokens = result.tokens?.input || result.tokens?.prompt || 0
      const outputTokens = result.tokens?.output || result.tokens?.completion || 0
      const costCalculation = calculateCost(result.model, inputTokens, outputTokens, false)

      return {
        summary: result.content,
        model: result.model,
        tokens: {
          input: inputTokens,
          output: outputTokens,
          total: result.tokens?.total || inputTokens + outputTokens,
        },
        cost: {
          input: costCalculation.input,
          output: costCalculation.output,
          total: costCalculation.total,
        },
      }
    } catch (error) {
      logger.error('TextSummarizer execution failed:', error)
      throw error
    }
  }
}
