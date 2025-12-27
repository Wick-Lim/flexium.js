"use client";

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react'
import type { GenerationUnit, ComponentUnit } from '@/types/generation'
import './ChatInterface.css'

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    isStreaming?: boolean;
}

interface ChatInterfaceProps {
    onCodeGenerated: (componentBody: string) => void;
    onComponentReceived?: (component: ComponentUnit) => void;
}

export function ChatInterface({ onCodeGenerated, onComponentReceived }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: "안녕하세요! 저는 Lumina예요. 원하는 웹사이트를 설명해주시면 Flexium으로 만들어드릴게요 ✨"
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [components, setComponents] = useState<Map<string, ComponentUnit>>(new Map());
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    // When components change, rebuild and send the code
    // CSS is now inside each component's code using css() function
    useEffect(() => {
        if (components.size === 0) return;

        const rootComponent = [...components.values()].find(c => c.isRoot);
        if (!rootComponent) return;

        // Build component definitions (css() calls are inside code)
        const componentDefs = [...components.values()]
            .filter(c => !c.isRoot)
            .map(c => `function ${c.name}() { ${c.code} }`)
            .join('\n');

        // Final code - css() is called within each component
        const code = `${componentDefs}\n${rootComponent.code}`;

        onCodeGenerated(code);
    }, [components, onCodeGenerated]);

    const handleUnit = useCallback((unit: GenerationUnit) => {
        switch (unit.type) {
            case 'chat':
                // Add streaming chat message
                setMessages(prev => {
                    // If last message is streaming, append to it
                    const last = prev[prev.length - 1];
                    if (last?.isStreaming && last.role === 'assistant') {
                        return [
                            ...prev.slice(0, -1),
                            { ...last, content: last.content + '\n' + unit.content }
                        ];
                    }
                    // Otherwise add new streaming message
                    return [...prev, {
                        id: Date.now().toString(),
                        role: 'assistant',
                        content: unit.content,
                        isStreaming: true
                    }];
                });
                break;

            case 'component':
                // Component arrives! 자기 자리 찾아서 탁!
                setComponents(prev => {
                    const newMap = new Map(prev);
                    newMap.set(unit.name, unit);
                    return newMap;
                });

                // Notify parent if callback provided
                onComponentReceived?.(unit);
                break;

            case 'error':
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: `오류가 발생했어요: ${unit.message}`
                }]);
                break;

            case 'done':
                // Mark streaming as complete
                setMessages(prev => {
                    const last = prev[prev.length - 1];
                    if (last?.isStreaming) {
                        return [
                            ...prev.slice(0, -1),
                            { ...last, isStreaming: false, content: last.content + '\n\n' + unit.summary }
                        ];
                    }
                    return [...prev, {
                        id: Date.now().toString(),
                        role: 'assistant',
                        content: unit.summary
                    }];
                });
                break;
        }
    }, [onComponentReceived]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);
        setComponents(new Map()); // Reset components for new generation

        try {
            // Prepare history for API
            const history = messages
                .filter(m => m.role !== 'assistant' || m.id !== 'welcome')
                .map(m => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.content }]
                }));

            const response = await fetch('/api/generate-stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    history
                }),
            });

            if (!response.ok) throw new Error('API request failed');

            // Read SSE stream
            const reader = response.body!.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                // Parse SSE events
                const lines = buffer.split('\n\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;

                    try {
                        const unit: GenerationUnit = JSON.parse(line.slice(6));
                        handleUnit(unit);
                    } catch (e) {
                        console.error('Failed to parse SSE unit:', e);
                    }
                }
            }

            // Process remaining buffer
            if (buffer.startsWith('data: ')) {
                try {
                    const unit: GenerationUnit = JSON.parse(buffer.slice(6));
                    handleUnit(unit);
                } catch (e) {
                    console.error('Failed to parse final SSE unit:', e);
                }
            }

        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: "죄송해요, 연결에 문제가 생겼어요. 다시 시도해주세요."
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chat-container">
            <div className="messages-list">
                {messages.map(msg => (
                    <div key={msg.id} className={`message ${msg.role} ${msg.isStreaming ? 'streaming' : ''}`}>
                        <div className="avatar">
                            {msg.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
                        </div>
                        <div className="bubble">
                            {msg.content}
                            {msg.isStreaming && <Sparkles size={14} className="streaming-indicator" />}
                        </div>
                    </div>
                ))}
                {loading && !messages.some(m => m.isStreaming) && (
                    <div className="message assistant">
                        <div className="avatar"><Bot size={18} /></div>
                        <div className="bubble loading">
                            <Loader2 size={16} className="spin" /> 생각 중...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />

                {/* Component progress indicator */}
                {components.size > 0 && loading && (
                    <div className="component-progress">
                        <Sparkles size={14} />
                        <span>{components.size}개 컴포넌트 생성됨</span>
                    </div>
                )}
            </div>

            <form className="input-area glass-panel" onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="원하는 사이트를 설명해주세요..."
                    disabled={loading}
                />
                <button type="submit" disabled={loading || !input.trim()}>
                    <Send size={18} />
                </button>
            </form>
        </div>
    )
}
