/**
 * README: Computer Control Client
 *
 * This module wraps the OpenAI Responses API to run prompts against a
 * computer-control capable model. Configure your OpenAI API key from the
 * Settings panel (stored in `localStorage`) or via the `VITE_OPENAI_API_KEY`
 * environment variable before importing and invoking the helpers here.
 *
 * Usage:
 * ```js
 * import { sendComputerControlPrompt, iterateComputerControlActions } from './services/computerControlClient.js';
 *
 * const { textSummary, actions } = await sendComputerControlPrompt('Open the browser');
 * for (const step of iterateComputerControlActions(actions, handlers)) {
 *   await step.perform();
 * }
 * ```
 *
 * Optional attachments or extra request parameters can be passed as the
 * `options` argument to `sendComputerControlPrompt`. Attachments should match
 * the structure expected by the Responses API.
 */

import { readOpenAIApiKey } from './apiKeyStore.js';

const OPENAI_API_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_MODEL = 'o4-mini';
const COMPUTER_TOOL_NAMES = new Set(['computer_use_preview', 'computer_use', 'computer']);

function ensureApiKey() {
  const storedKey = readOpenAIApiKey();
  if (storedKey) {
    return storedKey;
  }

  const envKey = import.meta?.env?.VITE_OPENAI_API_KEY ?? process?.env?.VITE_OPENAI_API_KEY;
  if (envKey) {
    return envKey;
  }

  throw new Error('OpenAI API key is not set. Please add your key from the Settings panel.');
}

function normaliseActions(candidate) {
  if (!candidate || typeof candidate !== 'object') {
    return [];
  }

  if (Array.isArray(candidate)) {
    return candidate.flatMap(normaliseActions);
  }

  if (Array.isArray(candidate.actions)) {
    return candidate.actions.flatMap(normaliseActions);
  }

  if (Array.isArray(candidate.instructions)) {
    return candidate.instructions.flatMap(normaliseActions);
  }

  if (Array.isArray(candidate.steps)) {
    return candidate.steps.flatMap(normaliseActions);
  }

  if ('type' in candidate || 'event' in candidate || 'name' in candidate) {
    return [candidate];
  }

  return [];
}

function extractOutputs(payload) {
  const outputs = Array.isArray(payload?.output) ? [...payload.output] : [];

  if (Array.isArray(payload?.outputs)) {
    outputs.push(...payload.outputs);
  }

  if (typeof payload?.output_text === 'string') {
    outputs.push({ type: 'output_text', text: payload.output_text });
  } else if (Array.isArray(payload?.output_text)) {
    outputs.push(...payload.output_text.map((text) => ({ type: 'output_text', text })));
  }

  if (Array.isArray(payload?.choices)) {
    for (const choice of payload.choices) {
      const content = choice?.message?.content;
      if (Array.isArray(content)) {
        outputs.push(...content);
      } else if (typeof content === 'string') {
        outputs.push({ type: 'output_text', text: content });
      }
    }
  }

  if (Array.isArray(payload?.actions)) {
    outputs.push({ type: 'tool_call', name: 'computer_use_preview', input: { actions: payload.actions } });
  }

  return outputs;
}

function parseResponse(payload) {
  const outputs = extractOutputs(payload);
  const textParts = [];
  const actions = [];

  for (const item of outputs) {
    if (!item) continue;

    const type = item.type ?? item.kind ?? item.event;

    if (type === 'output_text' || type === 'text' || type === 'message') {
      const text = item.text ?? item.content ?? item.value;
      if (typeof text === 'string' && text.trim()) {
        textParts.push(text.trim());
      }
      continue;
    }

    if (type === 'tool_call' || COMPUTER_TOOL_NAMES.has(type)) {
      const toolName = item.name ?? item.tool_name ?? item.tool?.name ?? item.tool;
      const isComputerTool =
        COMPUTER_TOOL_NAMES.has(toolName) || COMPUTER_TOOL_NAMES.has(type);
      if (isComputerTool) {
        const toolInput = item.input ?? item.arguments ?? item.tool_input ?? item.payload ?? item;
        actions.push(...normaliseActions(toolInput));
      }
    }
  }

  const textSummary = textParts.join('\n');
  return { textSummary, actions };
}

export async function sendComputerControlPrompt(prompt, options = {}) {
  if (typeof prompt !== 'string' || !prompt.trim()) {
    throw new Error('Prompt must be a non-empty string.');
  }

  const apiKey = ensureApiKey();

  const {
    attachments = [],
    model,
    tools,
    ...requestOverrides
  } = options ?? {};

  const requestBody = {
    ...requestOverrides,
    model: model ?? DEFAULT_MODEL,
    input: prompt,
    tool_choice: 'auto',
    tools: tools ?? [{ type: 'computer_use_preview' }],
  };

  if (attachments.length > 0) {
    requestBody.attachments = attachments.map((attachment) => ({ ...attachment }));
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  const responseText = await response.text();
  if (!response.ok) {
    let message = `OpenAI request failed with status ${response.status}`;
    try {
      const errorPayload = responseText ? JSON.parse(responseText) : null;
      const errorMessage = errorPayload?.error?.message ?? errorPayload?.message;
      if (errorMessage) {
        message += `: ${errorMessage}`;
      }
    } catch (error) {
      if (responseText) {
        message += `: ${responseText}`;
      }
    }
    throw new Error(message);
  }

  const payload = responseText ? JSON.parse(responseText) : {};
  return parseResponse(payload);
}

export function* iterateComputerControlActions(actions = [], handlers = {}) {
  if (!Array.isArray(actions)) {
    return;
  }

  for (const action of actions) {
    if (!action || typeof action !== 'object') continue;

    const eventType = action.type ?? action.event ?? action.name ?? 'unknown';
    const payload = action.payload ?? action;

    const performer = () => {
      if (eventType === 'mouse' && typeof handlers.mouse === 'function') {
        return handlers.mouse(payload);
      }
      if (eventType === 'keyboard' && typeof handlers.keyboard === 'function') {
        return handlers.keyboard(payload);
      }
      if (eventType === 'wait' && typeof handlers.wait === 'function') {
        return handlers.wait(payload);
      }
      if (typeof handlers.default === 'function') {
        return handlers.default(eventType, payload);
      }
      return payload;
    };

    yield {
      type: eventType,
      payload,
      perform: performer,
    };
  }
}

export { parseResponse as _parseComputerControlResponse };
