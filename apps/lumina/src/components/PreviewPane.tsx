"use client";

import { useMemo } from 'react'
import { Terminal } from 'lucide-react'
import './PreviewPane.css'

interface PreviewPaneProps {
    componentBody: string;
    css: string;
}

export function PreviewPane({ componentBody, css }: PreviewPaneProps) {
    // Generate the iframe srcdoc HTML
    const srcdoc = useMemo(() => {
        if (!componentBody) return '';

        // Escape backticks and backslashes in the component body for template literal
        const escapedBody = componentBody
            .replace(/\\/g, '\\\\')
            .replace(/`/g, '\\`')
            .replace(/\$/g, '\\$');

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { 
            width: 100%; 
            height: 100%; 
            background: #09090b;
            color: white;
            font-family: system-ui, -apple-system, sans-serif;
        }
        ${css}
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="module">
        import { use, sync, render, f } from 'https://esm.sh/flexium@0.16.3?bundle';
        
        try {
            // Define the component
            function App() {
                ${escapedBody}
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
    }, [componentBody, css]);

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


