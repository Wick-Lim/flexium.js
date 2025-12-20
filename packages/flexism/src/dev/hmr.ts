/**
 * Flexism HMR (Hot Module Replacement)
 *
 * Granular component updates and CSS hot injection
 */

import * as fs from 'fs'
import * as path from 'path'
import type { DependencyGraph } from '../compiler/incremental'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type HMRUpdateType = 'full-reload' | 'css-update' | 'component-update' | 'error'

export interface HMRUpdate {
  type: HMRUpdateType
  file: string
  timestamp: number
  /** CSS content for hot injection */
  css?: string
  /** Module ID for component update */
  moduleId?: string
  /** Error message */
  error?: string
  /** Files affected by this change */
  affected?: string[]
}

export interface HMRClient {
  id: string
  send: (data: string) => void
  close: () => void
}

export interface HMRManagerOptions {
  /** Source directory */
  srcDir: string
  /** Output directory */
  outDir: string
  /** Enable CSS hot injection */
  cssHotReload?: boolean
  /** Enable granular component updates */
  granularUpdates?: boolean
  /** Debounce interval for file changes */
  debounceMs?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// HMR Manager
// ─────────────────────────────────────────────────────────────────────────────

/**
 * HMR Manager for development server
 *
 * Features:
 * - CSS hot injection (no page reload)
 * - Granular component updates
 * - Dependency-aware rebuilds
 * - Error overlay
 *
 * @example
 * ```ts
 * const hmr = new HMRManager({
 *   srcDir: './src',
 *   outDir: '.flexism',
 *   cssHotReload: true,
 * })
 *
 * hmr.on('update', (update) => {
 *   console.log(`[HMR] ${update.type}: ${update.file}`)
 * })
 *
 * hmr.start()
 * ```
 */
export class HMRManager {
  private clients: Map<string, HMRClient> = new Map()
  private clientIdCounter = 0
  private watcher: fs.FSWatcher | null = null
  private options: Required<HMRManagerOptions>
  private dependencyGraph: DependencyGraph | null = null
  private pendingChanges: Map<string, NodeJS.Timeout> = new Map()
  private listeners: Map<string, Set<(data: any) => void>> = new Map()

  constructor(options: HMRManagerOptions) {
    this.options = {
      srcDir: options.srcDir,
      outDir: options.outDir,
      cssHotReload: options.cssHotReload ?? true,
      granularUpdates: options.granularUpdates ?? true,
      debounceMs: options.debounceMs ?? 100,
    }
  }

  /**
   * Start file watching
   */
  start(): void {
    if (this.watcher) return

    this.watcher = fs.watch(
      this.options.srcDir,
      { recursive: true },
      (event, filename) => {
        if (!filename) return
        this.handleFileChange(filename, event)
      }
    )
  }

  /**
   * Stop file watching
   */
  stop(): void {
    if (this.watcher) {
      this.watcher.close()
      this.watcher = null
    }

    // Clear pending changes
    for (const timer of this.pendingChanges.values()) {
      clearTimeout(timer)
    }
    this.pendingChanges.clear()

    // Close all clients
    for (const client of this.clients.values()) {
      client.close()
    }
    this.clients.clear()
  }

  /**
   * Set dependency graph for affected file detection
   */
  setDependencyGraph(graph: DependencyGraph): void {
    this.dependencyGraph = graph
  }

  /**
   * Register HMR client
   */
  addClient(send: (data: string) => void, close: () => void): string {
    const id = String(++this.clientIdCounter)
    this.clients.set(id, { id, send, close })

    // Send connected message
    send(`data: ${JSON.stringify({ type: 'connected', id })}\n\n`)

    return id
  }

  /**
   * Remove HMR client
   */
  removeClient(id: string): void {
    this.clients.delete(id)
  }

  /**
   * Get client count
   */
  get clientCount(): number {
    return this.clients.size
  }

  /**
   * Add event listener
   */
  on(event: string, listener: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener)
  }

  /**
   * Remove event listener
   */
  off(event: string, listener: (data: any) => void): void {
    this.listeners.get(event)?.delete(listener)
  }

  /**
   * Emit event
   */
  private emit(event: string, data: any): void {
    this.listeners.get(event)?.forEach(listener => listener(data))
  }

  /**
   * Handle file change with debouncing
   */
  private handleFileChange(filename: string, event: string): void {
    const filePath = path.join(this.options.srcDir, filename)

    // Cancel pending update for this file
    const pending = this.pendingChanges.get(filePath)
    if (pending) {
      clearTimeout(pending)
    }

    // Debounce changes
    const timer = setTimeout(() => {
      this.pendingChanges.delete(filePath)
      this.processFileChange(filePath, event)
    }, this.options.debounceMs)

    this.pendingChanges.set(filePath, timer)
  }

  /**
   * Process file change after debounce
   */
  private async processFileChange(filePath: string, event: string): Promise<void> {
    const ext = path.extname(filePath)

    let update: HMRUpdate

    // CSS files - hot inject without reload
    if (this.options.cssHotReload && (ext === '.css' || ext === '.scss' || ext === '.less')) {
      update = await this.createCSSUpdate(filePath)
    }
    // TypeScript/JavaScript files
    else if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
      update = await this.createModuleUpdate(filePath)
    }
    // Other files - full reload
    else {
      update = {
        type: 'full-reload',
        file: filePath,
        timestamp: Date.now(),
      }
    }

    // Broadcast update
    this.broadcast(update)
    this.emit('update', update)
  }

  /**
   * Create CSS hot update
   */
  private async createCSSUpdate(filePath: string): Promise<HMRUpdate> {
    try {
      const css = await fs.promises.readFile(filePath, 'utf-8')
      return {
        type: 'css-update',
        file: filePath,
        timestamp: Date.now(),
        css,
        moduleId: this.getModuleId(filePath),
      }
    } catch {
      return {
        type: 'full-reload',
        file: filePath,
        timestamp: Date.now(),
      }
    }
  }

  /**
   * Create module update
   */
  private async createModuleUpdate(filePath: string): Promise<HMRUpdate> {
    // Get affected files from dependency graph
    const affected: string[] = [filePath]

    if (this.dependencyGraph) {
      const dependents = this.dependencyGraph.dependents.get(filePath)
      if (dependents) {
        affected.push(...dependents)
      }
    }

    // For now, component updates trigger full reload
    // Future: implement component-level HMR
    if (this.options.granularUpdates && this.isComponentFile(filePath)) {
      return {
        type: 'component-update',
        file: filePath,
        timestamp: Date.now(),
        moduleId: this.getModuleId(filePath),
        affected,
      }
    }

    return {
      type: 'full-reload',
      file: filePath,
      timestamp: Date.now(),
      affected,
    }
  }

  /**
   * Check if file is a component file
   */
  private isComponentFile(filePath: string): boolean {
    const filename = path.basename(filePath)
    // Component files typically have these patterns
    return /\.(tsx|jsx)$/.test(filename) &&
           !/^(layout|page|error|loading|middleware|route)\.[tj]sx?$/.test(filename)
  }

  /**
   * Get module ID for file
   */
  private getModuleId(filePath: string): string {
    const relative = path.relative(this.options.srcDir, filePath)
    return relative.replace(/\\/g, '/')
  }

  /**
   * Broadcast update to all clients
   */
  broadcast(update: HMRUpdate): void {
    const data = `data: ${JSON.stringify(update)}\n\n`

    for (const [id, client] of this.clients) {
      try {
        client.send(data)
      } catch {
        this.clients.delete(id)
      }
    }
  }

  /**
   * Send error to all clients
   */
  sendError(error: string): void {
    this.broadcast({
      type: 'error',
      file: '',
      timestamp: Date.now(),
      error,
    })
  }

  /**
   * Send keep-alive to all clients
   */
  keepAlive(): void {
    for (const client of this.clients.values()) {
      try {
        client.send(': keepalive\n\n')
      } catch {
        this.clients.delete(client.id)
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Client Script
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate HMR client script for browser injection
 */
export function getHMRClientScript(options: { endpoint?: string } = {}): string {
  const endpoint = options.endpoint ?? '/__hmr'

  return `
// Flexism HMR Client
(function() {
  if (typeof window === 'undefined') return;

  var HMR = {
    es: null,
    reconnectTimer: null,
    reconnectAttempts: 0,
    maxReconnectAttempts: 10,
    cssStylesheets: new Map(),

    connect: function() {
      this.es = new EventSource('${endpoint}');
      this.es.onopen = this.onOpen.bind(this);
      this.es.onmessage = this.onMessage.bind(this);
      this.es.onerror = this.onError.bind(this);
    },

    onOpen: function() {
      console.log('[HMR] Connected');
      this.reconnectAttempts = 0;
      this.hideOverlay();
    },

    onMessage: function(e) {
      try {
        var data = JSON.parse(e.data);
        this.handleUpdate(data);
      } catch (err) {
        console.error('[HMR] Parse error:', err);
      }
    },

    onError: function() {
      this.es.close();
      this.scheduleReconnect();
    },

    scheduleReconnect: function() {
      var self = this;
      if (this.reconnectTimer) return;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('[HMR] Max reconnect attempts reached');
        return;
      }

      var delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      this.reconnectAttempts++;

      this.reconnectTimer = setTimeout(function() {
        self.reconnectTimer = null;
        console.log('[HMR] Reconnecting... (attempt ' + self.reconnectAttempts + ')');
        self.connect();
      }, delay);
    },

    handleUpdate: function(data) {
      console.log('[HMR]', data.type, data.file || '');

      switch (data.type) {
        case 'connected':
          break;

        case 'css-update':
          this.updateCSS(data);
          break;

        case 'component-update':
          // For now, component updates trigger reload
          // Future: implement component-level HMR
          this.reload();
          break;

        case 'full-reload':
          this.reload();
          break;

        case 'error':
          this.showError(data.error);
          break;
      }
    },

    updateCSS: function(data) {
      if (!data.css || !data.moduleId) {
        this.reload();
        return;
      }

      // Find or create style element
      var styleId = 'hmr-style-' + data.moduleId.replace(/[^a-zA-Z0-9]/g, '-');
      var style = document.getElementById(styleId);

      if (!style) {
        style = document.createElement('style');
        style.id = styleId;
        style.setAttribute('data-hmr', data.moduleId);
        document.head.appendChild(style);
      }

      style.textContent = data.css;
      console.log('[HMR] CSS updated:', data.moduleId);
    },

    reload: function() {
      console.log('[HMR] Reloading...');
      window.location.reload();
    },

    showError: function(error) {
      var overlay = document.getElementById('flexism-error-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'flexism-error-overlay';
        overlay.style.cssText = [
          'position: fixed',
          'top: 0',
          'left: 0',
          'right: 0',
          'bottom: 0',
          'background: rgba(0, 0, 0, 0.95)',
          'color: #ff5555',
          'padding: 40px',
          'font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          'font-size: 14px',
          'white-space: pre-wrap',
          'word-break: break-word',
          'overflow: auto',
          'z-index: 99999'
        ].join(';');
        document.body.appendChild(overlay);
      }

      overlay.innerHTML = [
        '<div style="color: #ff8888; font-size: 18px; font-weight: bold; margin-bottom: 20px;">',
        '  Build Error',
        '</div>',
        '<div style="color: #ffffff; line-height: 1.6;">',
        '  ' + this.escapeHtml(error),
        '</div>',
        '<div style="margin-top: 30px; color: #888888; font-size: 12px;">',
        '  Click anywhere to dismiss',
        '</div>'
      ].join('');

      overlay.onclick = function() { overlay.remove(); };
    },

    hideOverlay: function() {
      var overlay = document.getElementById('flexism-error-overlay');
      if (overlay) overlay.remove();
    },

    escapeHtml: function(text) {
      var div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  };

  // Start connection
  HMR.connect();

  // Expose for debugging
  window.__FLEXISM_HMR__ = HMR;
})();
`
}

/**
 * Inject HMR script into HTML
 */
export function injectHMRScript(html: string, options: { endpoint?: string } = {}): string {
  const script = `<script>${getHMRClientScript(options)}</script>`

  // Inject before </body> or at the end
  if (html.includes('</body>')) {
    return html.replace('</body>', script + '</body>')
  }
  return html + script
}
