import { useState } from 'react';

export default function PasswordField({ label, registration, error, disabled, autoComplete = 'new-password', hint, ...inputProps }) {
  const [visible, setVisible] = useState(false);
  const errorId = `${inputProps.name}-error`;
  const hintId = hint ? `${inputProps.name}-hint` : undefined;
  const describedBy = [error ? errorId : null, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="form-field">
      <label htmlFor={inputProps.name}>{label}</label>
      <div className="password-input-wrap">
        <input
          {...inputProps}
          {...registration}
          id={inputProps.name}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
        />
        <button type="button" className="password-toggle" aria-pressed={visible} disabled={disabled} onClick={() => setVisible((current) => !current)}>
          {visible ? 'Hide password' : 'Show password'}
        </button>
      </div>
      {hint && <small id={hintId} className="field-hint">{hint}</small>}
      {error && <small id={errorId} className="field-error">{error.message}</small>}
    </div>
  );
}