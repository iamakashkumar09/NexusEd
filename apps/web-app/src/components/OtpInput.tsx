import React, { useRef, KeyboardEvent, ClipboardEvent } from 'react';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
}

export function OtpInput({ value, onChange, length = 6 }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (!val) return;

    // Use only the last character if they typed multiple
    const char = val[val.length - 1];
    
    const newOtp = value.split('');
    newOtp[index] = char;
    
    // Fill the rest with empty string if they are undefined
    const paddedOtp = Array.from({ length }, (_, i) => newOtp[i] || '');
    onChange(paddedOtp.join(''));

    // Move to next input
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newOtp = value.split('');
      
      if (newOtp[index]) {
        // If there's a value in current input, delete it
        newOtp[index] = '';
        onChange(newOtp.join(''));
      } else if (index > 0) {
        // If current is empty, delete previous and focus it
        newOtp[index - 1] = '';
        onChange(newOtp.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/[^0-9]/g, '');
    if (!pastedData) return;

    const pastedArray = pastedData.split('').slice(0, length);
    const newOtp = Array.from({ length }, (_, i) => pastedArray[i] || value[i] || '');
    onChange(newOtp.join(''));

    // Focus the next empty input or the last one
    const focusIndex = Math.min(pastedArray.length, length - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          style={{
            width: '100%',
            aspectRatio: '1',
            textAlign: 'center',
            fontSize: 24,
            fontWeight: 600,
            background: 'var(--surface-2)',
            border: '1px solid var(--hairline-strong)',
            borderRadius: 'var(--r-md)',
            color: 'var(--ink)',
            outline: 'none',
            transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--primary)';
            e.target.style.boxShadow = 'var(--shadow-glow)';
            e.target.style.transform = 'translateY(-2px)';
            e.target.select();
          }}
          onBlur={(e) => {
            e.target.style.borderColor = value[i] ? 'var(--primary-light)' : 'var(--hairline-strong)';
            e.target.style.boxShadow = 'none';
            e.target.style.transform = 'none';
          }}
        />
      ))}
    </div>
  );
}
