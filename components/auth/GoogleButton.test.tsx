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

    // hl=en keeps Google's button text in English regardless of the browser language.
    expect(scriptProps.current).toMatchObject({
      src: 'https://accounts.google.com/gsi/client?hl=en',
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
      text: 'signin_with',
      shape: 'pill',
      locale: 'en',
    });
    expect(typeof options.width).toBe('number');
  });

  describe('options', () => {
    it('uses "signin_with" by default and "signup_with" when asked', () => {
      const api = installFakeGoogle();

      const first = render(<GoogleButton clientId="test-id" onCredential={vi.fn()} />);
      expect(api.renderButton.mock.calls[0][1].text).toBe('signin_with');
      first.unmount();

      render(<GoogleButton clientId="test-id" text="signup_with" onCredential={vi.fn()} />);
      expect(api.renderButton.mock.calls[1][1].text).toBe('signup_with');
    });

    it('always asks for the English locale, the pill shape and the large size', () => {
      const api = installFakeGoogle();

      render(<GoogleButton clientId="test-id" text="signup_with" onCredential={vi.fn()} />);

      expect(api.renderButton.mock.calls[0][1]).toMatchObject({
        locale: 'en',
        shape: 'pill',
        size: 'large',
      });
    });

    it('redraws with the new wording if the text prop changes', () => {
      const api = installFakeGoogle();
      const { rerender } = render(<GoogleButton clientId="test-id" onCredential={vi.fn()} />);

      rerender(<GoogleButton clientId="test-id" text="signup_with" onCredential={vi.fn()} />);

      const last = api.renderButton.mock.calls.at(-1)![1];
      expect(last.text).toBe('signup_with');
    });
  });

  describe('width', () => {
    let clientWidth: { mockReturnValue: (value: number) => unknown; mockRestore: () => void };

    afterEach(() => {
      clientWidth.mockRestore();
    });

    function widthDrawnFor(measured: number): number {
      clientWidth = vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(measured);
      const api = installFakeGoogle();
      render(<GoogleButton clientId="test-id" onCredential={vi.fn()} />);
      return api.renderButton.mock.calls[0][1].width;
    }

    it('matches the container width at card widths used on desktop and phone', () => {
      expect(widthDrawnFor(366)).toBe(366);
      cleanup();
      clientWidth.mockRestore();
      expect(widthDrawnFor(262)).toBe(262);
    });

    it('stays within the range Google allows (200 to 400 pixels)', () => {
      expect(widthDrawnFor(150)).toBe(200);
      cleanup();
      clientWidth.mockRestore();
      expect(widthDrawnFor(900)).toBe(400);
    });

    it('falls back to a default width when the container has no measurable width', () => {
      expect(widthDrawnFor(0)).toBe(320);
    });

    describe('when the card is resized', () => {
      type ObserverCallback = () => void;
      const observers: { callback: ObserverCallback; disconnect: ReturnType<typeof vi.fn> }[] = [];

      beforeEach(() => {
        observers.length = 0;
        vi.stubGlobal(
          'ResizeObserver',
          class {
            disconnect = vi.fn();
            observe = vi.fn();
            constructor(callback: ObserverCallback) {
              observers.push({ callback, disconnect: this.disconnect });
            }
          },
        );
      });

      afterEach(() => {
        vi.unstubAllGlobals();
      });

      it('redraws at the new width, and only when the width really changed', () => {
        clientWidth = vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(366);
        const api = installFakeGoogle();
        render(<GoogleButton clientId="test-id" onCredential={vi.fn()} />);
        expect(api.renderButton).toHaveBeenCalledTimes(1);

        // Same width: nothing to do.
        observers[0].callback();
        expect(api.renderButton).toHaveBeenCalledTimes(1);

        // The card shrinks to phone width: Google's fixed-pixel button is redrawn to match.
        clientWidth.mockReturnValue(262);
        observers[0].callback();
        expect(api.renderButton).toHaveBeenCalledTimes(2);
        expect(api.renderButton.mock.calls[1][1].width).toBe(262);
      });

      it('does not draw on resize before Google has loaded, and stops observing on unmount', () => {
        clientWidth = vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(366);
        const { unmount } = render(<GoogleButton clientId="test-id" onCredential={vi.fn()} />);

        expect(() => observers[0].callback()).not.toThrow();

        unmount();
        expect(observers[0].disconnect).toHaveBeenCalled();
      });
    });
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
