import { describe, it, expect } from 'vitest';
import { rules, configs } from '../index';

describe('eslint-plugin-flexium', () => {
  it('should export rules', () => {
    expect(rules).toBeDefined();
    expect(rules['no-signal-outside-reactive']).toBeDefined();
    expect(rules['effect-cleanup']).toBeDefined();
    expect(rules['no-side-effect-in-computed']).toBeDefined();
    expect(rules['prefer-batch']).toBeDefined();
  });

  it('should export configs', () => {
    expect(configs).toBeDefined();
    expect(configs.recommended).toBeDefined();
    expect(configs.strict).toBeDefined();
    expect(configs.all).toBeDefined();
  });

  it('recommended config should have correct rule settings', () => {
    const recommended = configs.recommended;

    expect(recommended.plugins).toContain('flexium');
    expect(recommended.rules['flexium/no-signal-outside-reactive']).toBe('warn');
    expect(recommended.rules['flexium/effect-cleanup']).toBe('warn');
    expect(recommended.rules['flexium/no-side-effect-in-computed']).toBe('error');
    expect(recommended.rules['flexium/prefer-batch']).toBe('off');
  });

  it('strict config should have stricter rule settings', () => {
    const strict = configs.strict;

    expect(strict.rules['flexium/no-signal-outside-reactive']).toBe('error');
    expect(strict.rules['flexium/effect-cleanup']).toBe('error');
    expect(strict.rules['flexium/no-side-effect-in-computed']).toBe('error');
    expect(strict.rules['flexium/prefer-batch']).toBe('warn');
  });
});
