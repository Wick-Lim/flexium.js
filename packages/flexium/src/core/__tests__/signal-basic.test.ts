import { describe, it, expect } from 'vitest';
import { signal } from '../signal';

describe('Basic Signal Test', () => {
  it('should create and update signal', () => {
    const count = signal(0);
    expect(count.value).toBe(0);
    count.value = 5;
    expect(count.value).toBe(5);
    count.set(10);
    expect(count.value).toBe(10);
  });
});
