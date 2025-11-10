const STORAGE_KEY = 'plum.openai.apiKey';

function getStorage() {
  if (typeof window !== 'undefined' && window?.localStorage) {
    return window.localStorage;
  }

  if (typeof globalThis !== 'undefined' && globalThis?.localStorage) {
    return globalThis.localStorage;
  }

  return undefined;
}

function normaliseKey(input) {
  if (typeof input !== 'string') {
    return '';
  }
  return input.trim();
}

export function readOpenAIApiKey() {
  const storage = getStorage();
  if (!storage) {
    return undefined;
  }

  try {
    const value = storage.getItem(STORAGE_KEY);
    const key = normaliseKey(value ?? '');
    return key || undefined;
  } catch (error) {
    console.warn('Unable to read OpenAI API key from storage:', error);
    return undefined;
  }
}

export function saveOpenAIApiKey(apiKey) {
  const storage = getStorage();
  if (!storage) {
    throw new Error('Local storage is not available.');
  }

  const value = normaliseKey(apiKey);
  if (!value) {
    throw new Error('OpenAI API key must be a non-empty string.');
  }

  try {
    storage.setItem(STORAGE_KEY, value);
    return value;
  } catch (error) {
    throw new Error(`Failed to save OpenAI API key: ${error.message ?? error}`);
  }
}

export function deleteOpenAIApiKey() {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    storage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Unable to remove OpenAI API key from storage:', error);
  }
}

export function maskOpenAIApiKey(apiKey) {
  const value = normaliseKey(apiKey);
  if (!value) {
    return '';
  }

  if (value.length <= 4) {
    return '•'.repeat(value.length);
  }

  const visible = value.slice(-4);
  const masked = '•'.repeat(Math.max(value.length - 4, 4));
  return `${masked}${visible}`;
}

export const _testing = { getStorage, normaliseKey };
