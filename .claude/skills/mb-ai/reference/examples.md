# LangChain patterns with `createMspBotsModel`

`createMspBotsModel()` returns a standard LangChain chat model, so every LangChain
JS/TS pattern works. The model is the only MSPBots-specific piece — the rest is
vanilla LangChain. Run all of this in `service/server.ts` (backend), never the browser.

## Invoke & stream

```typescript
import { createMspBotsModel } from './lib/mspbots-model.ts'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'

const model = createMspBotsModel({ model: 'gemini-3-flash-preview' })

// Single prompt
const res = await model.invoke('Why do parrots talk?')

// Conversation
await model.invoke([
  new SystemMessage('You translate English to French.'),
  new HumanMessage('Translate: I love programming.'),
])

// Streaming (the gateway returns one chunk; iteration shape still works)
for await (const chunk of await model.stream([new HumanMessage('Tell me a story')])) {
  process.stdout.write(chunk.content as string)
}
```

## Prompt templates + chains (LCEL)

```typescript
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'

const prompt = ChatPromptTemplate.fromTemplate('Tell me a joke about {topic}')
const chain = prompt.pipe(createMspBotsModel({ model: 'azure/gpt-4o' })).pipe(new StringOutputParser())
const joke = await chain.invoke({ topic: 'programming' })
```

`RunnableParallel.from({...})` and `RunnableBranch.from([...])` compose chains for
parallel/branching flows.

## Agents + tools

```typescript
import { createAgent, tool } from 'langchain'

const search = tool(({ query }) => `Results for: ${query}`, {
  name: 'search',
  description: 'Search for information',
  schema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
})

const agent = createAgent({
  model: createMspBotsModel({ model: 'azure/gpt-4o' }),
  tools: [search],
  systemPrompt: 'You are concise and accurate.',
})

const out = await agent.invoke({ messages: [{ role: 'user', content: 'Search for parrots.' }] })
```

## Structured output

```typescript
import { createAgent, providerStrategy } from 'langchain'

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
  },
  required: ['name', 'email', 'phone'],
}

const agent = createAgent({
  model: createMspBotsModel({ model: 'azure/gpt-4o' }),
  tools: [],
  responseFormat: providerStrategy(schema),
})
const result = await agent.invoke({
  messages: [{ role: 'user', content: 'Extract: John Doe, john@example.com, (555) 123-4567' }],
})
// result.structuredResponse → { name, email, phone }
```

## RAG (retrieval-augmented generation)

```typescript
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { OpenAIEmbeddings } from '@langchain/openai'
import { createRetrievalChain } from 'langchain/chains/retrieval'
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents'
import { ChatPromptTemplate } from '@langchain/core/prompts'

const splitDocs = await new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 }).splitDocuments(docs)
const store = await MemoryVectorStore.fromDocuments(splitDocs, new OpenAIEmbeddings())

const combineDocsChain = await createStuffDocumentsChain({
  llm: createMspBotsModel({ model: 'azure/gpt-4o' }),
  prompt: ChatPromptTemplate.fromTemplate('Answer from context:\n{context}\n\nQuestion: {input}'),
})
const ragChain = await createRetrievalChain({ retriever: store.asRetriever({ k: 4 }), combineDocsChain })
const answer = await ragChain.invoke({ input: 'What is the document about?' })
```

> Extra RAG/embedding integrations need their own packages (e.g. `@langchain/community`,
> `@langchain/textsplitters`) and `OpenAIEmbeddings` needs `OPENAI_API_KEY` +
> `OPENAI_BASE_URL`. Install only what a feature actually uses.
