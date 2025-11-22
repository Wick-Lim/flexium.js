/**
 * Flexium JSX Development Runtime
 *
 * This module provides the JSX development runtime.
 * It's used during development for better debugging and warnings.
 *
 * For now, it's identical to the production runtime, but could be
 * extended in the future with:
 * - Component name tracking
 * - Prop validation
 * - Development warnings
 * - Source location tracking
 */

export { jsx, jsxs, Fragment, jsxDEV } from './jsx-runtime';
