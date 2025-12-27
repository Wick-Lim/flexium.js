'use client';

import { useState, useMemo, useCallback } from 'react';
import type { GenerationUnit, GenerationState, ComponentUnit } from '@/types/generation';

export function useGeneration() {
    const [chatMessages, setChatMessages] = useState<string[]>([]);
    const [components, setComponents] = useState<Map<string, ComponentUnit>>(new Map());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Build the final component code from all received components
    // CSS is now inside code using css() function - no separate extraction needed
    const componentCode = useMemo(() => {
        const rootComponent = [...components.values()].find(c => c.isRoot);
        if (!rootComponent) return '';

        // Generate component definitions for non-root components
        const componentDefs = [...components.values()]
            .filter(c => !c.isRoot)
            .map(c => `function ${c.name}(props = {}) { ${c.code} }`)
            .join('\n');

        // Return the complete code
        return `${componentDefs}\n${rootComponent.code}`;
    }, [components]);

    const handleUnit = useCallback((unit: GenerationUnit) => {
        switch (unit.type) {
            case 'chat':
                setChatMessages(prev => [...prev, unit.content]);
                break;

            case 'component':
                // Component arrives! Snap into place!
                setComponents(prev => {
                    const newMap = new Map(prev);
                    newMap.set(unit.name, unit);
                    return newMap;
                });
                break;

            case 'error':
                setError(unit.message);
                break;

            case 'done':
                console.log('Generation complete:', unit.summary);
                break;
        }
    }, []);

    const generate = useCallback(async (prompt: string, history: any[] = []) => {
        // Reset state
        setIsLoading(true);
        setError(null);
        setChatMessages([]);
        setComponents(new Map());

        try {
            const response = await fetch('/api/generate-stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: prompt, history })
            });

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const reader = response.body!.getReader();
            const decoder = new TextDecoder();

            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                // Parse SSE events from buffer
                const lines = buffer.split('\n\n');
                buffer = lines.pop() || ''; // Keep incomplete line in buffer

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;

                    try {
                        const unit: GenerationUnit = JSON.parse(line.slice(6));
                        handleUnit(unit);
                    } catch (e) {
                        console.error('Failed to parse SSE unit:', e, line);
                    }
                }
            }

            // Process any remaining buffer content
            if (buffer.startsWith('data: ')) {
                try {
                    const unit: GenerationUnit = JSON.parse(buffer.slice(6));
                    handleUnit(unit);
                } catch (e) {
                    console.error('Failed to parse final SSE unit:', e);
                }
            }

        } catch (err) {
            console.error('Generation error:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsLoading(false);
        }
    }, [handleUnit]);

    return {
        // State
        chatMessages,
        components,
        componentCode,
        isLoading,
        error,

        // Actions
        generate,

        // Helpers
        hasComponents: components.size > 0,
        componentCount: components.size,
        rootComponent: [...components.values()].find(c => c.isRoot),
    };
}

export type UseGenerationReturn = ReturnType<typeof useGeneration>;
