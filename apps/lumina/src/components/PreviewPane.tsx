"use client";

import { useMemo } from 'react'
import { Terminal } from 'lucide-react'
import './PreviewPane.css'

interface PreviewPaneProps {
    componentBody: string;
}

export function PreviewPane({ componentBody }: PreviewPaneProps) {
    // Generate the iframe srcdoc HTML
    const srcdoc = useMemo(() => {
        if (!componentBody) return '';

        // Build srcdoc using string concatenation to avoid escaping issues
        // Custom css() implementation for iframe (adoptedStyleSheets doesn't work in srcdoc)
        const htmlStart = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style id="fx-styles">
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { 
            width: 100%; 
            min-height: 100%; 
            background: #09090b;
            color: white;
            font-family: system-ui, -apple-system, sans-serif;
            overflow-x: hidden;
            overflow-y: auto;
        }
        #root {
            width: 100%;
            min-height: 100%;
        }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="module">
        import { use, sync, render, f, Routes, Route, Link } from 'https://esm.sh/flexium@0.16.10?bundle&t=1735319368';
        
        // Custom css() for iframe - uses style tag instead of adoptedStyleSheets
        const cssCache = new Map();
        const styleEl = document.getElementById('fx-styles');
        
        function hash(str) {
            let h = 5381;
            for (let i = 0; i < str.length; i++) {
                h = ((h << 5) + h) ^ str.charCodeAt(i);
            }
            return 'fx-' + (h >>> 0).toString(36);
        }
        
        function serialize(obj, selector) {
            let css = '';
            let nested = '';
            for (const [key, value] of Object.entries(obj)) {
                if (typeof value === 'object') {
                    const nestedSelector = key.startsWith('&') 
                        ? selector + key.slice(1) 
                        : key.startsWith('@') 
                            ? key 
                            : selector + ' ' + key;
                    if (key.startsWith('@')) {
                        nested += key + '{' + serialize(obj[key], selector).replace(selector, selector) + '}';
                    } else {
                        nested += serialize(value, nestedSelector);
                    }
                } else {
                    const prop = key.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
                    css += prop + ':' + value + ';';
                }
            }
            return (css ? selector + '{' + css + '}' : '') + nested;
        }
        
        function css(styles) {
            const key = JSON.stringify(styles);
            if (cssCache.has(key)) return cssCache.get(key);
            const className = hash(key);
            const cssText = serialize(styles, '.' + className);
            styleEl.textContent += cssText;
            cssCache.set(key, className);
            return className;
        }
        
        function cx(...classes) {
            return classes.filter(Boolean).join(' ');
        }
        
        try {
            // Define the component
            function App(props = {}) {
`;

        const htmlEnd = `
            }
            
            // Use render() with f() to enable Flexium's reactive system
            const root = document.getElementById('root');
            render(f(App), root);
        } catch (err) {
            console.error('Runtime Error:', err);
            document.getElementById('root').innerHTML = '<pre style="color:#ef4444;padding:20px;white-space:pre-wrap;">Runtime Error: ' + err.message + '</pre>';
        }
    </script>
</body>
</html>`;

        return htmlStart + componentBody + htmlEnd;
    }, [componentBody]);

    return (
        <div className="preview-container">
            {/* Browser-like toolbar */}
            <div className="preview-toolbar">
                <div className="preview-toolbar-dot red"></div>
                <div className="preview-toolbar-dot yellow"></div>
                <div className="preview-toolbar-dot green"></div>
                <div className="preview-url-bar">
                    {componentBody ? 'preview.lumina.dev' : 'Ready to generate...'}
                </div>
            </div>

            {componentBody ? (
                <iframe
                    srcDoc={srcdoc}
                    className="preview-iframe"
                    sandbox="allow-scripts allow-same-origin"
                    title="Preview"
                />
            ) : (
                <div className="placeholder">
                    <div className="placeholder-content">
                        <Terminal size={48} className="placeholder-icon" />
                        <h3>Ready to create</h3>
                        <p>Describe your website and watch it come to life.</p>
                    </div>
                </div>
            )}
        </div>
    )
}


