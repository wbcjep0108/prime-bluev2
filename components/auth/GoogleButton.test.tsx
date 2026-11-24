// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import GoogleButton from './GoogleButton';

// next/script is replaced so no real script is ever loaded. The captured props
// let each test play the part of the browser: onReady, onError.
const { scriptProps } = vi.hoisted(() => ({
  scriptProps: { current: null as Record<string, unknown> | null },
}));

vi.mock('next/script', () => ({
  default: (props: Record<string, unknown>) => {
    scriptProps.current = props;
    return null;
  },
}));

interface FakeGoogleApi {
  initialize: ReturnType<typeof vi.fn>;
  renderButton: ReturnType<typeof vi.fn>;
}

const googleWindow = window as unknown as { google?: unknown };

/** Stands in for the object the real Google script adds to window. */
function installFakeGoogle(): FakeGoogleApi {
  const api: FakeGoogleApi = { initialize: vi.fn(), renderButton: vi.fn() };
  googleWindow.google = { accounts: { id: api } };
  return api;
}

function fireScriptReady() {
  (scriptProps.current?.onReady as () => void)();
}

beforeEach(() => {
  scriptProps.current = null;
  delete googleWindow.google;
});

afterEach(() => {
  cleanup();
  delete googleWindow.google;
});

describe('GoogleButton', () => {
  it('renders nothing and loads no script when there is no client id', () => {
    const { container } = render(<GoogleButton clientId="" onCredential={vi.fn()} />);

    expect(container.innerHTML).toBe('');
    expect(scriptProps.current).toBeNull();
  });

  it('loads the Google Identity Services script with next/script and shows the divider', () => {
    const { container, getByRole } = render(<GoogleButton clientId="test-id" onCredential={vi.fn()} />);

    expect(scriptProps.current).toMatchObject({
      src: 'https://accounts.google.com/gsi/client',
      strategy: 'afterInteractive',
    });
    expect(container.textContent).toBe('or');
    expect(getByRole('group', { name: 'Continue with Google' })).toBeTruthy();
  });

  it('initialises Google and asks it to render its own button once the script is ready', () => {
    const api = installFakeGoogle();
    // Simulate the script arriving after mount: remove it, render, then add it back.
    delete googleWindow.google;
    const { getByRole } = render(<GoogleButton clientId="test-id" onCredential={vi.fn()} />);
    expect(api.renderButton).not.toHaveBeenCalled();

    googleWindow.google = { accounts: { id: api } };
    fireScriptReady();

    expect(api.initialize).toHaveBeenCalledTimes(1);
    expect(api.initialize.mock.calls[0][0].client_id).toBe('test-id');

    expect(api.renderButton).toHaveBeenCalledTimes(1);
    const [parent, options] = api.renderButton.mock.calls[0];
    expect(parent).toBe(getByRole('group', { name: 'Continue with Google' }));
    expect(options).toMatchObject({
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'pill',
    });
    expect(typeof options.width).toBe('number');
  });

  it('draws the button immediately when the script is already on the page', () => {
    const api = installFakeGoogle();

    render(<GoogleButton clientId="test-id" onCredential={vi.fn()} />);

    expect(api.initialize).toHaveBeenCalledTimes(1);
    expect(api.renderButton).toHaveBeenCalledTimes(1);
  });

  it('does nothing, and does not throw, if the script is ready but window.google is missing', () => {
    render(<GoogleButton clientId="test-id" onCredential={vi.fn()} />);

    expect(() => fireScriptReady()).not.toThrow();
  });

  it('passes the credential from Google to onCredential', () => {
    const api = installFakeGoogle();
    const onCredential = vi.fn();
    render(<GoogleButton clientId="test-id" onCredential={onCredential} />);

    const { callback } = api.initialize.mock.calls[0][0];
    callback({ credential: 'google-id-token' });

    expect(onCredential).toHaveBeenCalledTimes(1);
    expect(onCredential).toHaveBeenCalledWith('google-id-token');
  });

  it('ignores a Google response that has no credential', () => {
    const api = installFakeGoogle();
    const onCredential = vi.fn();
    render(<GoogleButton clientId="test-id" onCredential={onCredential} />);

    const { callback } = api.initialize.mock.calls[0][0];
    callback({});
    callback({ credential: '' });

    expect(onCredential).not.toHaveBeenCalled();
  });

  it('always calls the latest onCredential, without initialising Google again', () => {
    const api = installFakeGoogle();
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = render(<GoogleButton clientId="test-id" onCredential={first} />);

    rerender(<GoogleButton clientId="test-id" onCredential={second} />);
    api.initialize.mock.calls[0][0].callback({ credential: 'token' });

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith('token');
    expect(api.initialize).toHaveBeenCalledTimes(1);
  });

  it('initialises once per page but draws again when the form is remounted', () => {
    const api = installFakeGoogle();
    const onCredential = vi.fn();

    const first = render(<GoogleButton clientId="test-id" onCredential={onCredential} />);
    first.unmount();
    render(<GoogleButton clientId="test-id" onCredential={onCredential} />);

    expect(api.initialize).toHaveBeenCalledTimes(1);
    expect(api.renderButton).toHaveBeenCalledTimes(2);

    // The single Google callback now reaches the newly mounted instance.
    api.initialize.mock.calls[0][0].callback({ credential: 'after-remount' });
    expect(onCredential).toHaveBeenCalledWith('after-remount');
  });

  it('reports a script load failure through onError', () => {
    const onError = vi.fn();
    render(<GoogleButton clientId="test-id" onCredential={vi.fn()} onError={onError} />);

    (scriptProps.current?.onError as () => void)();

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toMatch(/could not be loaded/i);
  });

  it('is blocked while disabled', () => {
    const { getByRole, rerender } = render(<GoogleButton clientId="test-id" onCredential={vi.fn()} />);
    expect(getByRole('group').getAttribute('aria-disabled')).toBeNull();

    rerender(<GoogleButton clientId="test-id" onCredential={vi.fn()} disabled />);
    const group = getByRole('group');
    expect(group.getAttribute('aria-disabled')).toBe('true');
    expect(group.className).toContain('pointer-events-none');
  });

  it('never draws its own Google logo or button', () => {
    installFakeGoogle();
    const { container } = render(<GoogleButton clientId="test-id" onCredential={vi.fn()} />);

    // Google renders the real button into the empty container. This component
    // adds no icon, image or button of its own.
    expect(container.querySelector('svg, img, button')).toBeNull();
    expect(container.querySelector('[role="group"]')?.childElementCount).toBe(0);
  });
});
