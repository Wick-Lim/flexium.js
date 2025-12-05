import { describe, it, expect } from 'vitest';
import { rules, configs } from '../index';

describe('eslint-plugin-flexium', () => {
  it('should export rules', () => {
    expect(rules).toBeDefined();
    expect(rules['no-signal-outside-reactive']).toBeDefined();
    expect(rules['effect-cleanup']).toBeDefined();
    expect(rules['no-side-effect-in-computed']).toBeDefined();
    expect(rules['prefer-batch']).toBeDefined();
    expect(rules['no-missing-dependencies']).toBeDefined();
    expect(rules['effect-dependencies-complete']).toBeDefined();
    expect(rules['no-signal-mutation']).toBeDefined();
    expect(rules['no-effect-in-render']).toBeDefined();
    expect(rules['prefer-computed']).toBeDefined();
    expect(rules['no-circular-dependency']).toBeDefined();
    expect(rules['component-naming']).toBeDefined();
    expect(rules['no-signal-reassignment']).toBeDefined();
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
    expect(recommended.rules['flexium/no-missing-dependencies']).toBe('warn');
    expect(recommended.rules['flexium/effect-dependencies-complete']).toBe('warn');
    expect(recommended.rules['flexium/no-signal-mutation']).toBe('warn');
    expect(recommended.rules['flexium/no-effect-in-render']).toBe('error');
    expect(recommended.rules['flexium/prefer-computed']).toBe('off');
    expect(recommended.rules['flexium/no-circular-dependency']).toBe('error');
    expect(recommended.rules['flexium/component-naming']).toBe('warn');
    expect(recommended.rules['flexium/no-signal-reassignment']).toBe('error');
  });

  it('strict config should have stricter rule settings', () => {
    const strict = configs.strict;

    expect(strict.rules['flexium/no-signal-outside-reactive']).toBe('error');
    expect(strict.rules['flexium/effect-cleanup']).toBe('error');
    expect(strict.rules['flexium/no-side-effect-in-computed']).toBe('error');
    expect(strict.rules['flexium/prefer-batch']).toBe('warn');
    expect(strict.rules['flexium/no-missing-dependencies']).toBe('error');
    expect(strict.rules['flexium/effect-dependencies-complete']).toBe('error');
    expect(strict.rules['flexium/no-signal-mutation']).toBe('error');
    expect(strict.rules['flexium/no-effect-in-render']).toBe('error');
    expect(strict.rules['flexium/prefer-computed']).toBe('warn');
    expect(strict.rules['flexium/no-circular-dependency']).toBe('error');
    expect(strict.rules['flexium/component-naming']).toBe('error');
    expect(strict.rules['flexium/no-signal-reassignment']).toBe('error');
  });
});
