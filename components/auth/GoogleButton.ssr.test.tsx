// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import GoogleButton from './GoogleButton';

// A static export prerenders on the server, where there is no window at all.
vi.mock('next/script', () => ({ default: () => null }));

describe('GoogleButton during server rendering', () => {
  it('has no window in this environment', () => {
    expect(typeof window).toBe('undefined');
  });

  it('renders without touching window when a client id is set', () => {
    const html = renderToString(<GoogleButton clientId="test-id" onCredential={() => {}} />);

    expect(html).toContain('Sign in with Google');
    expect(html).toContain('>or<');
    expect(html).toContain('data-google-face');
    expect(html).toContain('data-google-overlay');
  });

  it('prerenders the sign-up wording and the four-colour logo', () => {
    const html = renderToString(
      <GoogleButton clientId="test-id" text="signup_with" onCredential={() => {}} />,
    );

    expect(html).toContain('Sign up with Google');
    for (const color of ['#EA4335', '#4285F4', '#FBBC05', '#34A853']) {
      expect(html).toContain(color);
    }
  });

  it('renders nothing without a client id', () => {
    expect(renderToString(<GoogleButton clientId="" onCredential={() => {}} />)).toBe('');
  });
});
