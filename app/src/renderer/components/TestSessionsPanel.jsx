import { useState } from 'react';

import { sendComputerControlPrompt } from '../services/computerControlClient.js';

function formatError(error) {
  if (!error) return '';
  if (typeof error === 'string') return error;
  if (error instanceof Error) {
    return error.message || error.toString();
  }
  return String(error);
}

export default function TestSessionsPanel() {
  const [promptInput, setPromptInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSource, setLoadingSource] = useState('');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [selectedFilePath, setSelectedFilePath] = useState('');

  const runPrompt = async (input, source) => {
    if (typeof input !== 'string' || !input.trim()) {
      setError('Please provide some text to send to the operator client.');
      return;
    }

    setIsLoading(true);
    setLoadingSource(source);
    setError('');
    try {
      const result = await sendComputerControlPrompt(input.trim());
      setResponse({
        prompt: input.trim(),
        textSummary: result?.textSummary ?? '',
        actions: Array.isArray(result?.actions) ? result.actions : [],
        source,
      });
    } catch (err) {
      setError(formatError(err));
      setResponse(null);
    } finally {
      setIsLoading(false);
      setLoadingSource('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await runPrompt(promptInput, 'prompt');
  };

  const handleFileSelect = async () => {
    setError('');

    const opener = typeof window !== 'undefined' ? window?.desktop?.openTextFile : undefined;
    if (typeof opener !== 'function') {
      setError('File selection is not supported in this environment.');
      return;
    }

    try {
      const file = await opener();
      if (!file) {
        return;
      }

      const filePath = file?.path ?? '';
      const fileContents = file?.contents ?? '';
      setSelectedFilePath(filePath);

      if (!fileContents || !fileContents.trim()) {
        setError('The selected file did not contain any text to send.');
        return;
      }

      await runPrompt(fileContents, 'file');
    } catch (err) {
      setError(formatError(err));
    }
  };

  const hasActions = Array.isArray(response?.actions) && response.actions.length > 0;

  return (
    <div className="test-sessions-panel">
      <div className="test-sessions-grid">
        <section className="session-card">
          <header className="session-card__header">
            <h2>Send a computer control prompt</h2>
            <p>
              Enter a test instruction for the OpenAI computer control client. Responses include a
              text summary and any proposed actions.
            </p>
          </header>

          <form className="session-form" onSubmit={handleSubmit}>
            <label className="session-label" htmlFor="test-session-prompt">
              Prompt
            </label>
            <textarea
              id="test-session-prompt"
              className="session-textarea"
              rows="6"
              placeholder="e.g. Launch the telemetry dashboard and capture a screenshot."
              value={promptInput}
              onChange={(event) => setPromptInput(event.target.value)}
              disabled={isLoading && loadingSource === 'prompt'}
            />
            <div className="session-actions">
              <button
                type="submit"
                className="session-button"
                disabled={isLoading && loadingSource === 'prompt'}
              >
                {isLoading && loadingSource === 'prompt' ? 'Sending…' : 'Send prompt'}
              </button>
            </div>
          </form>
        </section>

        <section className="session-card">
          <header className="session-card__header">
            <h2>Run prompt from .txt file</h2>
            <p>
              Select a plain-text file to send its contents through the same operator client. Useful
              for replaying saved test procedures.
            </p>
          </header>

          <div className="session-upload">
            <button
              type="button"
              className="session-button"
              onClick={handleFileSelect}
              disabled={isLoading}
            >
              {isLoading && loadingSource === 'file' ? 'Processing…' : 'Select .txt file'}
            </button>
            {selectedFilePath ? (
              <p className="session-upload__meta" title={selectedFilePath}>
                Selected: {selectedFilePath}
              </p>
            ) : (
              <p className="session-upload__meta">No file selected yet.</p>
            )}
          </div>
        </section>
      </div>

      <section className="session-card session-card--result">
        <header className="session-card__header">
          <h2>Latest response</h2>
          {response?.source === 'file' ? (
            <span className="session-badge">From file</span>
          ) : response?.source === 'prompt' ? (
            <span className="session-badge">From prompt</span>
          ) : null}
        </header>

        {isLoading && !response ? (
          <p className="session-status is-loading">Waiting for response…</p>
        ) : null}

        {error ? <p className="session-status is-error">{error}</p> : null}

        {response ? (
          <div className="session-response">
            {response.textSummary ? (
              <div className="session-response__summary">
                <h3>Text summary</h3>
                <pre>{response.textSummary}</pre>
              </div>
            ) : (
              <p className="session-status">No summary returned.</p>
            )}

            <div className="session-response__actions">
              <h3>Proposed actions</h3>
              {hasActions ? (
                <ol>
                  {response.actions.map((action, index) => (
                    <li key={`${action.type ?? 'action'}-${index}`}>
                      <code>{JSON.stringify(action, null, 2)}</code>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="session-status">No actions returned.</p>
              )}
            </div>
          </div>
        ) : !error && !isLoading ? (
          <p className="session-status">Send a prompt to view responses here.</p>
        ) : null}
      </section>
    </div>
  );
}
