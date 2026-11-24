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
    // The divider word, then the visible face label. Nothing else is rendered.
    expect(container.textContent).toBe('orSign in with Google');
    expect(getByRole('group', { name: 'Sign in with Google' })).toBeTruthy();
  });

  it('initialises Google and asks it to render its own button once the script is ready', () => {
    const api = installFakeGoogle();
    // Simulate the script arriving after mount: remove it, render, then add it back.
    delete googleWindow.google;
    const { container } = render(<GoogleButton clientId="test-id" onCredential={vi.fn()} />);
    expect(api.renderButton).not.toHaveBeenCalled();

    googleWindow.google = { accounts: { id: api } };
    fireScriptReady();

    expect(api.initialize).toHaveBeenCalledTimes(1);
    expect(api.initialize.mock.calls[0][0].client_id).toBe('test-id');

    expect(api.renderButton).toHaveBeenCalledTimes(1);
    const [parent, options] = api.renderButton.mock.calls[0];
    // Google draws into the container inside the invisible overlay, never into the visible face.
    expect(parent.closest('[data-google-overlay]')).toBe(container.querySelector('[data-google-overlay]'));
    expect(parent.closest('[data-google-face]')).toBeNull();
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

  describe('visible face and invisible overlay', () => {
    const tokens = (el: Element) => el.className.toString().split(/\s+/);
    const faceOf = (container: HTMLElement) => container.querySelector('[data-google-face]') as HTMLElement;
    const overlayOf = (container: HTMLElement) => container.querySelector('[data-google-overlay]') as HTMLElement;

    it('words the face from the text prop and gives the group the same accessible name', () => {
      const cases = [
        ['signin_with', 'Sign in with Google'],
        ['signup_with', 'Sign up with Google'],
        ['continue_with', 'Continue with Google'],
      ] as const;

      for (const [text, label] of cases) {
        const { container, getByRole, unmount } = render(
          <GoogleButton clientId="test-id" text={text} onCredential={vi.fn()} />,
        );
        expect(faceOf(container).textContent, text).toBe(label);
        expect(getByRole('group', { name: label }), text).toBeTruthy();
        unmount();
      }
    });

    it('is a relative wrapper as tall as the Log In button (44px), and the face fills it', () => {
      const { container, getByRole } = render(<GoogleButton clientId="test-id" onCredential={vi.fn()} />);

      for (const token of ['group', 'relative', 'h-11', 'w-full', 'rounded-full']) {
        expect(tokens(getByRole('group')), token).toContain(token);
      }
      for (const token of ['h-full', 'w-full', 'rounded-full']) {
        expect(tokens(faceOf(container)), token).toContain(token);
      }
    });

    it('gives the face the same look as the Log In button: white pill, bold uppercase black text', () => {
      const { container } = render(<GoogleButton clientId="test-id" onCredential={vi.fn()} />);

      for (const token of [
        'bg-white',
        'rounded-full',
        'px-7',
        'gap-3',
        'text-xs',
        'font-bold',
        'uppercase',
        'tracking-widest',
        'text-black',
      ]) {
        expect(tokens(faceOf(container)), token).toContain(token);
      }
    });

    it('shows the four-colour Google "G" left of the label, hidden from assistive technology', () => {
      const { container } = render(<GoogleButton clientId="test-id" onCredential={vi.fn()} />);
      const face = faceOf(container);
      const svg = face.querySelector('svg') as SVGSVGElement;

      expect(svg).toBeTruthy();
      expect(svg.getAttribute('aria-hidden')).toBe('true');
      expect(svg.getAttribute('focusable')).toBe('false');
      expect(svg.getAttribute('viewBox')).toBe('0 0 48 48');
      expect(Array.from(svg.querySelectorAll('path')).map((p) => p.getAttribute('fill'))).toEqual([
        '#EA4335',
        '#4285F4',
        '#FBBC05',
        '#34A853',
      ]);
      // The logo comes before the label.
      expect(face.firstElementChild).toBe(svg);
      expect(face.lastElementChild?.textContent).toBe('Sign in with Google');
    });

    it('keeps the face as decoration only: hidden from assistive technology and not focusable', () => {
      const { container } = render(<GoogleButton clientId="test-id" onCredential={vi.fn()} />);
      const face = faceOf(container);

      expect(face.getAttribute('aria-hidden')).toBe('true');
      expect(face.querySelector('a, button, input, select, textarea, [tabindex], [role="button"]')).toBeNull();
    });

    it('lays Google\'s button over the whole face, almost invisible, and on top', () => {
      const { container } = render(<GoogleButton clientId="test-id" onCredential={vi.fn()} />);
      const overlay = overlayOf(container);
      const face = faceOf(container);

      for (const token of ['absolute', 'inset-0', 'z-10', 'cursor-pointer', 'overflow-hidden', 'opacity-[0.01]']) {
        expect(tokens(overlay), token).toContain(token);
      }
      // It is a sibling after the face, so it paints above it, and the face is not inside it.
      expect(overlay.contains(face)).toBe(false);
      expect(face.compareDocumentPosition(overlay) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('stretches Google\'s 40px button to the 44px height of the face', () => {
      installFakeGoogle();
      const { container } = render(<GoogleButton clientId="test-id" onCredential={vi.fn()} />);
      const target = overlayOf(container).firstElementChild as HTMLElement;

      expect(target.style.height).toBe('40px');
      expect(target.style.transform).toBe('scaleY(1.1)');
      // The stretch grows downward from the top-left corner. jsdom may write the
      // two keywords in either order, so compare them as a set.
      expect(target.style.transformOrigin.split(' ').sort()).toEqual(['left', 'top']);
    });

    it('copies the Log In hover effect through the group and uses a cyan focus-within ring', () => {
      const { container, getByRole } = render(<GoogleButton clientId="test-id" onCredential={vi.fn()} />);

      for (const token of [
        'focus-within:ring-2',
        'focus-within:ring-[#00E5FF]',
        'focus-within:ring-offset-2',
        'focus-within:ring-offset-[#080808]',
      ]) {
        expect(tokens(getByRole('group')), token).toContain(token);
      }
      for (const token of ['transition-all', 'duration-300', 'group-hover:scale-[1.02]', 'group-active:scale-95']) {
        expect(tokens(faceOf(container)), token).toContain(token);
      }
    });

    it('dims the face and blocks pointer events on the overlay while disabled', () => {
      const { container, getByRole, rerender } = render(
        <GoogleButton clientId="test-id" onCredential={vi.fn()} />,
      );
      expect(getByRole('group').getAttribute('aria-disabled')).toBeNull();
      expect(tokens(overlayOf(container))).not.toContain('pointer-events-none');
      expect(tokens(faceOf(container))).not.toContain('opacity-60');

      rerender(<GoogleButton clientId="test-id" onCredential={vi.fn()} disabled />);

      expect(getByRole('group').getAttribute('aria-disabled')).toBe('true');
      expect(tokens(getByRole('group'))).toContain('cursor-not-allowed');
      expect(tokens(overlayOf(container))).toContain('pointer-events-none');
      expect(tokens(faceOf(container))).toContain('opacity-60');
      // No hover growth while disabled.
      expect(tokens(faceOf(container))).not.toContain('group-hover:scale-[1.02]');
    });

    it('still renders the real Google button only inside the overlay when disabled', () => {
      const api = installFakeGoogle();
      const { container } = render(<GoogleButton clientId="test-id" onCredential={vi.fn()} disabled />);

      const [parent] = api.renderButton.mock.calls[0];
      expect(parent.closest('[data-google-overlay]')).toBe(overlayOf(container));
    });
  });
});
