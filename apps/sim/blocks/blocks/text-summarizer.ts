import { BlockConfig } from '@/blocks/types'
import { AuthMode } from '@/blocks/types'
import { TextSummarizerIcon } from '@/components/icons'
import { getModelOptions, getApiKeyCondition } from '@/blocks/utils'
//import { createLogger } from '@sim/logger'

import {
  providers,
  MODELS_WITH_DEEP_RESEARCH,
  MODELS_WITH_REASONING_EFFORT,
  MODELS_WITH_THINKING,
  MODELS_WITH_VERBOSITY,
  MODELS_WITHOUT_MEMORY,
  supportsTemperature,
  getMaxTemperature,
  getBaseModelProviders,
} from '@/providers/utils'
/*const logger = createLogger('TextSummarizerBlock')*/
// Helper function to get the tool ID from a block type
const getToolIdFromBlock = (blockType: string): string | undefined => {
  try {
    const { getAllBlocks } = require('@/blocks/registry')
    const blocks = getAllBlocks()
    const block = blocks.find(
      (b: { type: string; tools?: { access?: string[] } }) => b.type === blockType
    )
    return block?.tools?.access?.[0]
  } catch (error) {
  //  logger.error('Error getting tool ID from block', { error })
    return undefined
  }
}

export const TextSummarizerBlock: BlockConfig = {
  type: 'text-summarizer',
  name: 'Text Summarizer',
  description: 'Summarize input text using LLMs',
  longDescription:
    'The Text Summarizer block uses LLMs to generate concise summaries of long texts.',
  authMode: AuthMode.ApiKey,
  docsLink: 'https://docs.sim.ai/blocks/text-summarizer',
  category: 'blocks',
  bgColor: 'var(--brand-primary-hex)',
  icon: TextSummarizerIcon,

  subBlocks: [
    {
      id: 'text',
      title: 'Text',
      type: 'long-input',
      required: true,
    },
    {
      id: 'prompt',
      title: 'Prompt',
      type: 'short-input',
      defaultValue:
        'Summarize the following text clearly and concisely.',
    },

    {
      id: 'model',
      title: 'Model',
      type: 'combobox',
      required: true,
      defaultValue: 'claude-sonnet-4-5',
      options: getModelOptions,
    },



    // API KEY
    {
      id: 'apiKey',
      title: 'API Key',
      type: 'short-input',
      password: true,
      required: true,
      condition: getApiKeyCondition(),
    },

    // Azure Endpoint
    {
      id: 'azureEndpoint',
      title: 'Azure Endpoint',
      type: 'short-input',
      password: true,
      placeholder: 'https://your-resource.services.ai.azure.com',
      connectionDroppable: false,
      condition: {
        field: 'model',
        value: [
          ...providers['azure-openai'].models,
          ...providers['azure-anthropic']?.models || [],
        ],
      },
    },
    {
      id: 'azureApiVersion',
      title: 'Azure API Version',
      type: 'short-input',
      placeholder: 'Enter API version',
      connectionDroppable: false,
      condition: {
        field: 'model',
        value: [
          ...providers['azure-openai'].models,
          ...providers['azure-anthropic']?.models || [],
        ],
      },
    },

    //   Reasoning
    {
      id: 'reasoningEffort',
      title: 'Reasoning Effort',
      type: 'dropdown',
      options: [
        { label: 'auto', id: 'auto' },
        { label: 'low', id: 'low' },
        { label: 'medium', id: 'medium' },
        { label: 'high', id: 'high' },
      ],
      condition: {
        field: 'model',
        value: MODELS_WITH_REASONING_EFFORT,
      },
    },

    //   Verbosity
    {
      id: 'verbosity',
      title: 'Verbosity',
      type: 'dropdown',
      options: [
        { label: 'auto', id: 'auto' },
        { label: 'low', id: 'low' },
        { label: 'medium', id: 'medium' },
        { label: 'high', id: 'high' },
      ],
      condition: {
        field: 'model',
        value: MODELS_WITH_VERBOSITY,
      },
    },

    //   Thinking
    {
      id: 'thinkingLevel',
      title: 'Thinking Level',
      type: 'dropdown',
      options: [
        { label: 'none', id: 'none' },
        { label: 'low', id: 'low' },
        { label: 'high', id: 'high' },
      ],
      condition: {
        field: 'model',
        value: MODELS_WITH_THINKING,
      },
    },

    //   Memory
    {
      id: 'memoryType',
      title: 'Memory',
      type: 'dropdown',
      options: [
        { label: 'None', id: 'none' },
        { label: 'Conversation', id: 'conversation' },
      ],
      condition: {
        field: 'model',
        value: MODELS_WITHOUT_MEMORY,
        not: true,
      },
    },

    {
      id: 'conversationId',
      title: 'Conversation ID',
      type: 'short-input',
      condition: {
        field: 'memoryType',
        value: ['conversation'],
      },
    },

    //   Temperature dynamique
    {
      id: 'temperature',
      title: 'Temperature',
      type: 'slider',
      min: 0,
      max: 1,
      defaultValue: 0.7,
      condition: () => ({
        field: 'model',
        value: Object.keys(getBaseModelProviders()).filter(
          (m) => supportsTemperature(m) && getMaxTemperature(m) === 1
        ),
      }),
    },
    {
      id: 'temperature',
      title: 'Temperature',
      type: 'slider',
      min: 0,
      max: 2,
      defaultValue: 0.7,
      condition: () => ({
        field: 'model',
        value: Object.keys(getBaseModelProviders()).filter(
          (m) => supportsTemperature(m) && getMaxTemperature(m) === 2
        ),
      }),
    },

    {
      id: 'maxTokens',
      title: 'Max Tokens',
      type: 'short-input',
    },

    //   Deep research
    {
      id: 'previousInteractionId',
      title: 'Previous Interaction ID',
      type: 'short-input',
      condition: {
        field: 'model',
        value: MODELS_WITH_DEEP_RESEARCH,
      },
    },
  ],

  tools: {
    access: [
      'openai_chat',
      'anthropic_chat',
      'google_chat',
      'xai_chat',
      'deepseek_chat',
    ],
    config: {
      tool: (params: Record<string, any>) => {
        const model = params.model || 'claude-sonnet-4-5'
        if (!model) {
          throw new Error('No model selected')
        }
        const tool = getBaseModelProviders()[model]
        if (!tool) {
          throw new Error(`Invalid model selected: ${model}`)
        }
        return tool
      },
      params: (params: Record<string, any>) => {
        // If tools array is provided, handle tool usage control
        if (params.tools && Array.isArray(params.tools)) {
          // Transform tools to include usageControl
          const transformedTools = params.tools
            // Filter out tools set to 'none' - they should never be passed to the provider
            .filter((tool: any) => {
              const usageControl = tool.usageControl || 'auto'
              return usageControl !== 'none'
            })
            .map((tool: any) => {
              const toolConfig = {
                id:
                  tool.type === 'custom-tool'
                    ? tool.schema?.function?.name
                    : tool.operation || getToolIdFromBlock(tool.type),
                name: tool.title,
                description: tool.type === 'custom-tool' ? tool.schema?.function?.description : '',
                params: tool.params || {},
                parameters: tool.type === 'custom-tool' ? tool.schema?.function?.parameters : {},
                usageControl: tool.usageControl || 'auto',
                type: tool.type,
              }
              return toolConfig
            })

          // Log which tools are being passed and which are filtered out
          const filteredOutTools = params.tools
            .filter((tool: any) => (tool.usageControl || 'auto') === 'none')
            .map((tool: any) => tool.title)

          if (filteredOutTools.length > 0) {
        //    logger.info('Filtered out tools set to none', { tools: filteredOutTools.join(', ') })
          }

          return { ...params, tools: transformedTools }
        }
        return params
      },
    },
  },

  inputs: {
    text: { type: 'string' },
    prompt: { type: 'string' },
    model: { type: 'string' },
  },

  outputs: {
    summary: { type: 'string' },
    model: { type: 'string' },
    tokens: { type: 'json' },
    cost: { type: 'json' },
  },
}