'use client';

import { Check, Circle } from '@phosphor-icons/react';
import { getPasswordRuleStatus } from '../../lib/auth/validation';
import { cn } from '../../lib/utils';

interface PasswordRequirementsProps {
  id: string;
  password: string;
}

export default function PasswordRequirements({ id, password }: PasswordRequirementsProps) {
  const status = getPasswordRuleStatus(password);

  return (
    <ul id={id} aria-label="Password requirements" className="flex flex-col gap-1.5">
      {status.map(({ rule, met }) => (
        <li
          key={rule.id}
          data-met={met}
          className={cn(
            'flex items-center gap-2 text-sm transition-colors duration-300',
            met ? 'text-[#00E5FF]' : 'text-white/50',
          )}
        >
          {met ? (
            <Check size={16} weight="bold" aria-hidden="true" />
          ) : (
            <Circle size={16} aria-hidden="true" />
          )}
          <span>{rule.label}</span>
          <span className="sr-only">{met ? '(met)' : '(not met)'}</span>
        </li>
      ))}
    </ul>
  );
}
