/**
 * Component Hook System
 * 
 * Manages component instances and hook state for state() API
 */

export interface ComponentInstance {
  id: symbol
  hookIndex: number
  hooks: unknown[]
}

let currentComponent: ComponentInstance | null = null

export function setCurrentComponent(instance: ComponentInstance | null): void {
  currentComponent = instance
}

export function getCurrentComponent(): ComponentInstance | null {
  return currentComponent
}

export function createComponentInstance(): ComponentInstance {
  return {
    id: Symbol('component'),
    hookIndex: 0,
    hooks: [],
  }
}

export function resetHookIndex(instance: ComponentInstance): void {
  instance.hookIndex = 0
}
