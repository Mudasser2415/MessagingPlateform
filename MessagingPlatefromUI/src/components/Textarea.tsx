import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, error, ...props }) => {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <textarea 
        className={`form-input ${error ? 'border-red-500' : ''}`} 
        style={{ minHeight: '120px', resize: 'vertical' }}
        {...props} 
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};
