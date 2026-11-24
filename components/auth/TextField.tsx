'use client';

import type { InputHTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../lib/utils';

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className'> {
  id: string;
  label: string;
  /** Validation message. When set, the input is marked invalid. */
  error?: string;
  /** Extra id(s) of elements that describe this input, for example a requirements list. */
  describedBy?: string;
  /** Element rendered inside the right edge of the input, for example a toggle button. */
  endAdornment?: ReactNode;
  inputRef?: Ref<HTMLInputElement>;
}

export default function TextField({
  id,
  label,
  error,
  describedBy,
  endAdornment,
  inputRef,
  ...inputProps
}: TextFieldProps) {
  const errorId = `${id}-error`;
  const describedByIds = [error ? errorId : null, describedBy].filter(Boolean).join(' ');

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="font-bebas text-sm uppercase tracking-[0.2em] text-white/70"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          ref={inputRef}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedByIds || undefined}
          className={cn(
            'w-full rounded-lg border bg-white/[0.04] px-4 py-3 text-base text-white',
            'placeholder:text-white/30 outline-none transition-colors duration-300',
            'focus-visible:border-[#00E5FF] focus-visible:ring-2 focus-visible:ring-[#00E5FF]/60',
            'disabled:cursor-not-allowed disabled:opacity-60',
            error ? 'border-red-400' : 'border-white/15',
            endAdornment ? 'pr-12' : undefined,
          )}
          {...inputProps}
        />
        {endAdornment ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">{endAdornment}</div>
        ) : null}
      </div>

      {error ? (
        <p id={errorId} role="alert" className="text-sm text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
