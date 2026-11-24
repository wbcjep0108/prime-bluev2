'use client';

import { useState } from 'react';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import TextField, { type TextFieldProps } from './TextField';

type PasswordFieldProps = Omit<TextFieldProps, 'type' | 'endAdornment'>;

export default function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const noun = props.label.toLowerCase();

  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      endAdornment={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? `Hide ${noun}` : `Show ${noun}`}
          aria-pressed={visible}
          aria-controls={props.id}
          className="flex h-9 w-9 items-center justify-center rounded-md text-white/60 transition-colors duration-300 hover:text-white focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF]/60"
        >
          {visible ? (
            <EyeSlash size={20} aria-hidden="true" />
          ) : (
            <Eye size={20} aria-hidden="true" />
          )}
        </button>
      }
    />
  );
}
