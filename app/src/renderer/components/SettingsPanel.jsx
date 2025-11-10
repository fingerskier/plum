import { useEffect, useMemo, useState } from 'react';
import {
  deleteOpenAIApiKey,
  maskOpenAIApiKey,
  readOpenAIApiKey,
  saveOpenAIApiKey,
} from '../services/apiKeyStore.js';

export default function SettingsPanel() {
  const [formKey, setFormKey] = useState('');
  const [storedKey, setStoredKey] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const existingKey = readOpenAIApiKey();
    if (existingKey) {
      setStoredKey(existingKey);
      setFormKey(existingKey);
    }
  }, []);

  const maskedKey = useMemo(() => maskOpenAIApiKey(storedKey), [storedKey]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setStatus('');
    setError('');

    try {
      const savedKey = saveOpenAIApiKey(formKey);
      setStoredKey(savedKey);
      setFormKey(savedKey);
      setStatus('OpenAI API key saved successfully.');
    } catch (saveError) {
      setError(saveError.message ?? 'Unable to save the OpenAI API key.');
    }
  };

  const handleDelete = () => {
    setStatus('');
    setError('');

    try {
      if (!storedKey) {
        setError('There is no stored OpenAI API key to delete.');
        return;
      }

      deleteOpenAIApiKey();
      setStoredKey('');
      setFormKey('');
      setStatus('OpenAI API key removed.');
    } catch (deleteError) {
      setError(deleteError.message ?? 'Unable to remove the OpenAI API key.');
    }
  };

  return (
    <section className="workspace-card settings-panel" aria-labelledby="settings-heading">
      <h2 id="settings-heading">Settings</h2>
      <p className="settings-description">
        Manage your OpenAI credentials and other application preferences.
      </p>

      <form className="settings-form" onSubmit={handleSubmit}>
        <div className="settings-field">
          <label className="settings-label" htmlFor="settings-openai-key">
            OpenAI API key
          </label>
          <input
            id="settings-openai-key"
            className="settings-input"
            type="password"
            value={formKey}
            onChange={(event) => setFormKey(event.target.value)}
            placeholder="sk-..."
            autoComplete="off"
            spellCheck={false}
            aria-describedby="settings-openai-key-help"
          />
          <p className="settings-help" id="settings-openai-key-help">
            {storedKey
              ? `Stored key: ${maskedKey}`
              : 'No OpenAI API key stored yet. Paste your key above to save it for future sessions.'}
          </p>
        </div>
        <div className="settings-actions">
          <button className="settings-button" type="submit">
            Save key
          </button>
          <button
            className="settings-button settings-button--secondary"
            type="button"
            onClick={handleDelete}
            disabled={!storedKey}
          >
            Delete key
          </button>
        </div>
      </form>

      {status && (
        <p className="settings-status" role="status">
          {status}
        </p>
      )}
      {error && (
        <p className="settings-status settings-status--error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
