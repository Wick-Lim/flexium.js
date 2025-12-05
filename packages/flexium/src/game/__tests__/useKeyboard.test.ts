import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useKeyboard, Keys } from '../useKeyboard';

describe('useKeyboard', () => {
  let target: EventTarget;

  beforeEach(() => {
    target = new EventTarget();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create keyboard state with all methods', () => {
    const keyboard = useKeyboard(target);

    expect(keyboard).toBeDefined();
    expect(typeof keyboard.isPressed).toBe('function');
    expect(typeof keyboard.isJustPressed).toBe('function');
    expect(typeof keyboard.isJustReleased).toBe('function');
    expect(typeof keyboard.getPressedKeys).toBe('function');
    expect(typeof keyboard.clearFrameState).toBe('function');
    expect(typeof keyboard.dispose).toBe('function');
    expect(keyboard.keys).toBeDefined();

    keyboard.dispose();
  });

  it('should detect key press', () => {
    const keyboard = useKeyboard(target);

    expect(keyboard.isPressed('KeyA')).toBe(false);

    target.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'KeyA' })
    );

    expect(keyboard.isPressed('KeyA')).toBe(true);
    expect(keyboard.isPressed('keya')).toBe(true); // Case insensitive

    keyboard.dispose();
  });

  it('should detect key release', () => {
    const keyboard = useKeyboard(target);

    target.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'KeyA' })
    );
    expect(keyboard.isPressed('KeyA')).toBe(true);

    target.dispatchEvent(
      new KeyboardEvent('keyup', { code: 'KeyA' })
    );
    expect(keyboard.isPressed('KeyA')).toBe(false);

    keyboard.dispose();
  });

  it('should track just pressed state', () => {
    const keyboard = useKeyboard(target);

    expect(keyboard.isJustPressed('KeyA')).toBe(false);

    target.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'KeyA' })
    );

    expect(keyboard.isJustPressed('KeyA')).toBe(true);

    // After clearing frame state, just pressed should be false
    keyboard.clearFrameState();
    expect(keyboard.isJustPressed('KeyA')).toBe(false);

    keyboard.dispose();
  });

  it('should track just released state', () => {
    const keyboard = useKeyboard(target);

    target.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'KeyA' })
    );
    target.dispatchEvent(
      new KeyboardEvent('keyup', { code: 'KeyA' })
    );

    expect(keyboard.isJustReleased('KeyA')).toBe(true);

    keyboard.clearFrameState();
    expect(keyboard.isJustReleased('KeyA')).toBe(false);

    keyboard.dispose();
  });

  it('should get all pressed keys', () => {
    const keyboard = useKeyboard(target);

    target.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'KeyA' })
    );
    target.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'KeyB' })
    );

    const pressed = keyboard.getPressedKeys();
    expect(pressed).toContain('keya');
    expect(pressed).toContain('keyb');
    expect(pressed.length).toBe(2);

    keyboard.dispose();
  });

  it('should update keys signal on key events', () => {
    const keyboard = useKeyboard(target);

    expect(keyboard.keys().size).toBe(0);

    target.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'Space' })
    );

    expect(keyboard.keys().has('space')).toBe(true);

    keyboard.dispose();
  });

  it('should not register same key twice', () => {
    const keyboard = useKeyboard(target);

    target.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'KeyA' })
    );
    target.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'KeyA' })
    );

    expect(keyboard.getPressedKeys().length).toBe(1);

    keyboard.dispose();
  });

  it('should cleanup event listeners on dispose', () => {
    const removeEventListenerSpy = vi.spyOn(target, 'removeEventListener');
    const keyboard = useKeyboard(target);

    keyboard.dispose();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
  });
});

describe('Keys constants', () => {
  it('should have arrow keys', () => {
    expect(Keys.ArrowUp).toBe('arrowup');
    expect(Keys.ArrowDown).toBe('arrowdown');
    expect(Keys.ArrowLeft).toBe('arrowleft');
    expect(Keys.ArrowRight).toBe('arrowright');
  });

  it('should have WASD keys', () => {
    expect(Keys.KeyW).toBe('keyw');
    expect(Keys.KeyA).toBe('keya');
    expect(Keys.KeyS).toBe('keys');
    expect(Keys.KeyD).toBe('keyd');
  });

  it('should have common keys', () => {
    expect(Keys.Space).toBe('space');
    expect(Keys.Enter).toBe('enter');
    expect(Keys.Escape).toBe('escape');
  });
});
