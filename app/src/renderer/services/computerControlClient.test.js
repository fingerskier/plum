import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  sendComputerControlPrompt,
  iterateComputerControlActions,
  _parseComputerControlResponse,
} from './computerControlClient.js';

const originalEnv = { ...import.meta.env };

beforeEach(() => {
  Object.assign(import.meta.env, originalEnv);
  vi.restoreAllMocks();
});

afterEach(() => {
  Object.assign(import.meta.env, originalEnv);
});

describe('sendComputerControlPrompt', () => {
  it('throws when the API key is missing', async () => {
    delete import.meta.env.VITE_OPENAI_API_KEY;

    await expect(() => sendComputerControlPrompt('hello')).rejects.toThrow(/VITE_OPENAI_API_KEY/);
  });

  it('sends the prompt to the Responses API with attachments and defaults', async () => {
    import.meta.env.VITE_OPENAI_API_KEY = 'test-key';
    const attachments = [{ name: 'context.txt', content: 'hello', mime_type: 'text/plain' }];
    const mockResponse = {
      ok: true,
      text: vi.fn().mockResolvedValue(JSON.stringify({ output: [] })),
    };
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    await sendComputerControlPrompt('Launch app', { attachments, temperature: 0.1 });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/responses',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-key',
        },
      }),
    );

    const body = JSON.parse(globalThis.fetch.mock.calls[0][1].body);
    expect(body).toMatchObject({
      model: 'o4-mini',
      input: 'Launch app',
      tool_choice: 'auto',
      tools: [{ type: 'computer' }],
      temperature: 0.1,
    });
    expect(body.attachments).toEqual(attachments);
  });

  it('parses text and computer actions from the response', async () => {
    import.meta.env.VITE_OPENAI_API_KEY = 'test-key';

    const apiResponse = {
      output: [
        { type: 'output_text', text: 'Opening the settings.' },
        {
          type: 'tool_call',
          name: 'computer',
          input: {
            actions: [
              { type: 'mouse', action: 'move', position: { x: 10, y: 20 } },
              { type: 'keyboard', action: 'press', key: 'Enter' },
            ],
          },
        },
      ],
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue(JSON.stringify(apiResponse)),
    });

    const result = await sendComputerControlPrompt('Open settings');
    expect(result.textSummary).toBe('Opening the settings.');
    expect(result.actions).toEqual(apiResponse.output[1].input.actions);
  });
});

describe('iterateComputerControlActions', () => {
  it('yields executable steps for known action types', async () => {
    const actions = [
      { type: 'mouse', action: 'move', position: { x: 1, y: 2 } },
      { type: 'keyboard', action: 'press', key: 'A' },
      { type: 'wait', duration_ms: 100 },
      { type: 'custom', payload: { value: 1 } },
    ];

    const mouseHandler = vi.fn();
    const keyboardHandler = vi.fn();
    const waitHandler = vi.fn();
    const defaultHandler = vi.fn();

    const steps = Array.from(
      iterateComputerControlActions(actions, {
        mouse: mouseHandler,
        keyboard: keyboardHandler,
        wait: waitHandler,
        default: defaultHandler,
      }),
    );

    expect(steps.map((step) => step.type)).toEqual(['mouse', 'keyboard', 'wait', 'custom']);

    for (const step of steps) {
      await step.perform();
    }

    expect(mouseHandler).toHaveBeenCalledWith(actions[0]);
    expect(keyboardHandler).toHaveBeenCalledWith(actions[1]);
    expect(waitHandler).toHaveBeenCalledWith(actions[2]);
    expect(defaultHandler).toHaveBeenCalledWith('custom', actions[3].payload);
  });
});

describe('_parseComputerControlResponse', () => {
  it('collects content from multiple response shapes', () => {
    const payload = {
      output: [{ type: 'output_text', text: 'Result A' }],
      output_text: ['Result B'],
      choices: [
        {
          message: {
            content: [
              { type: 'output_text', text: 'Result C' },
              { type: 'tool_call', name: 'computer', input: { instructions: [{ type: 'mouse' }] } },
            ],
          },
        },
      ],
    };

    const parsed = _parseComputerControlResponse(payload);
    expect(parsed.textSummary).toBe(['Result A', 'Result B', 'Result C'].join('\n'));
    expect(parsed.actions).toEqual([{ type: 'mouse' }]);
  });
});
