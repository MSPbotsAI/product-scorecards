// Copy to: service/lib/mspbots-model.ts
//
// A LangChain chat model backed by the MSPBots AI Gateway (Portkey). Use it
// anywhere a LangChain `BaseChatModel` is expected — invoke/stream, chains (LCEL),
// agents, RAG. Reads APP_MODE_KEY / APP_MODEL_NAME from the environment by default.
//
// Requires: pnpm add langchain @langchain/core @langchain/openai
//
// Net: POSTs to https://aigateway.mspbots.ai/v1/chat/completions (no manifest needed on Node).

import { SimpleChatModel, type BaseChatModelParams } from '@langchain/core/language_models/chat_models'
import type { BaseMessage } from '@langchain/core/messages'

const GATEWAY_URL = 'https://aigateway.mspbots.ai/v1/chat/completions'

export interface MspBotsModelOptions extends BaseChatModelParams {
  /** Defaults to process.env.APP_MODE_KEY */
  apiKey?: string
  /** Required — defaults to process.env.APP_MODEL_NAME. e.g. "gemini-3-flash-preview", "azure/gpt-4o" */
  model?: string
  /** Optional upper bound on generated tokens (gateway default: 512). */
  maxTokens?: number
}

class UniversalChatModel extends SimpleChatModel {
  executor: (messages: BaseMessage[]) => Promise<string>

  constructor(fields: BaseChatModelParams & { executor: (messages: BaseMessage[]) => Promise<string> }) {
    const { executor, ...rest } = fields
    super(rest)
    this.executor = executor
  }

  _llmType(): string {
    return 'mspbots_chat_model'
  }

  async _call(messages: BaseMessage[]): Promise<string> {
    return this.executor(messages)
  }
}

/**
 * Create a chat model that talks to the MSPBots AI Gateway.
 * Model name is mandatory (never silently default to an arbitrary model).
 *
 * @example
 *   const model = createMspBotsModel({ model: 'gemini-3-flash-preview' })
 *   const res = await model.invoke('Why do parrots talk?')
 */
export function createMspBotsModel(opts: MspBotsModelOptions = {}) {
  const apiKey = opts.apiKey ?? process.env.APP_MODE_KEY
  const model = opts.model ?? process.env.APP_MODEL_NAME
  const maxTokens = opts.maxTokens ?? 512
  if (!apiKey) throw new Error('createMspBotsModel: missing API key — set APP_MODE_KEY or pass { apiKey }.')
  if (!model) throw new Error('createMspBotsModel: missing model name — set APP_MODEL_NAME or pass { model }.')

  return new UniversalChatModel({
    executor: async (messages: BaseMessage[]) => {
      const body = {
        model,
        max_tokens: maxTokens,
        messages: messages.map((m) => {
          const type = m._getType()
          const role = type === 'system' ? 'system' : type === 'ai' ? 'assistant' : 'user'
          const content = typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
          return { role, content }
        }),
      }
      const res = await fetch(GATEWAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-portkey-api-key': apiKey },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`MSPBots AI Gateway error: ${res.status} ${await res.text()}`)
      const data = await res.json()
      return data?.choices?.[0]?.message?.content ?? ''
    },
  })
}
