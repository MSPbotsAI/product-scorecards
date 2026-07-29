---
name: mb-ai
description: Call an LLM from an MSPBots Node app via the MSPBots AI Gateway using LangChain. Use when the user wants AI/LLM features — chat, summarize, classify, extract, generate text, build an agent with tools, structured output, or RAG. Provides createMspBotsModel() (a LangChain chat model wired to aigateway.mspbots.ai) plus chain/agent/RAG patterns.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# AI (LangChain + MSPBots AI Gateway)

LLM access routed through the **MSPBots AI Gateway** (Portkey). `createMspBotsModel()`
returns a standard LangChain chat model, so all LangChain patterns (invoke/stream,
chains, agents, tools, structured output, RAG) work — only the model construction is
MSPBots-specific. **Run LLM calls on the backend (`service/server.ts`), never in the
browser** (the API key must stay server-side).

## When to use

Any AI feature: answering questions, summarizing/classifying/extracting from text,
chatbots, tool-using agents, or retrieval over documents.

## Integration steps

### 1. Install LangChain

```bash
pnpm add langchain@^1 @langchain/core @langchain/openai
# Add more only as features need them, e.g.:
# pnpm add @langchain/community @langchain/textsplitters
```

### 2. Add the model factory

Copy [`reference/mspbots-model.ts`](reference/mspbots-model.ts) to `service/lib/mspbots-model.ts`.

### 3. Provide credentials

`createMspBotsModel()` reads two env vars by default (override per-call with
`{ apiKey, model }`). Set them in `.env.local` for local dev; the platform provides them
in production:

```env
APP_MODE_KEY=<your-gateway-api-key>
APP_MODEL_NAME=gemini-3-flash-preview
```

The **model name is required** (no silent default). Available models include:

```
gemini-3-flash-preview   gemini-3-pro-preview   gemini-3.1-pro-preview   gemini-2.5-flash
azure/gpt-4o   azure/gpt-4o-mini   azure/gpt-4.1   azure/gpt-5.2   azure/gpt-5.3-codex
```

### 4. Use it in a handler

```typescript
import { createMspBotsModel } from './lib/mspbots-model.ts'

app.post('/api/ask', async (c) => {
  const { question } = await c.req.json()
  const model = createMspBotsModel({ model: 'gemini-3-flash-preview' })
  const answer = await model.invoke(question)
  return c.json({ answer: answer.content })
})
```

For chains (LCEL), agents + tools, structured output, and RAG, see
[`reference/examples.md`](reference/examples.md).

## Checklist

- [ ] `pnpm add langchain@^1 @langchain/core @langchain/openai`
- [ ] `service/lib/mspbots-model.ts` copied
- [ ] `APP_MODE_KEY` + `APP_MODEL_NAME` set (or passed explicitly)
- [ ] LLM calls live in `service/server.ts` (backend only)

## Common issues

- **`API key … is required`** → `APP_MODE_KEY` not set and not passed in.
- **`model name … is required`** → always pass `model` or set `APP_MODEL_NAME`.
- **Gateway 4xx/5xx** → bad key, unknown model name, or rejected payload; the error includes the gateway's response body.
- **No real token streaming** → the gateway wrapper returns the full completion as one chunk; `.stream()` still works but won't stream token-by-token.
