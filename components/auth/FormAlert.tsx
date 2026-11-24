'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface FormAlertProps {
  variant: 'error' | 'success';
  message?: string | null;
}

/**
 * Form-level message area. Errors use role="alert", success uses role="status".
 * Renders nothing when there is no message.
 */
export default function FormAlert({ variant, message }: FormAlertProps) {
  const reduceMotion = useReducedMotion();

  if (!message) return null;

  return (
    <motion.div
      role={variant === 'error' ? 'alert' : 'status'}
      initial={reduceMotion ? false : { opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'rounded-lg border px-4 py-3 text-sm leading-relaxed',
        variant === 'error'
          ? 'border-red-400/40 bg-red-400/10 text-red-200'
          : 'border-[#00E5FF]/40 bg-[#00E5FF]/10 text-[#b8f5ff]',
      )}
    >
      {message}
    </motion.div>
  );
}
