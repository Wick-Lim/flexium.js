"use client";

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { SYSTEM_INSTRUCTION } from '@/lib/gemini'
import { use } from '../../../../packages/flexium/src/core'
import './ChatInterface.css'

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

interface ChatInterfaceProps {
    onCodeGenerated: (componentBody: string, css: string) => void;
}

export function ChatInterface({ onCodeGenerated }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: "Hi! I'm Lumina. Describe the website you want to build, and I'll create it for you using Flexium."
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

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

        try {
            // Prepare history for API
            const history = messages
                .filter(m => m.role !== 'assistant' || m.id !== 'welcome')
                .map(m => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.content }]
                }));

            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: input,
                    history
                }),
            });

            if (!response.ok) throw new Error('API request failed');

            const data = await response.json();
            const responseText = data.text;

            let validJson = null;
            try {
                // Clean up markdown if present (e.g. json code block)
                const cleanJson = responseText.replace(/```json\n ?|\n ? ```/g, '');
                validJson = JSON.parse(cleanJson);
            } catch (e) {
                console.error("JSON Parse Error", e);
            }

            let message = responseText; // Fallback if regular text

            if (validJson && validJson.componentBody) {
                const { css, componentBody } = validJson;

                // Pass raw body and css to parent for rendering
                onCodeGenerated(componentBody, css);

                message = "I've generated the interface for you.";
            }

            const aiMessage: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: message
            };

            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: "Sorry, I had trouble connecting to my creative engine. Please try again."
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chat-container">
            <div className="messages-list">
                {messages.map(msg => (
                    <div key={msg.id} className={`message ${msg.role} `}>
                        <div className="avatar">
                            {msg.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
                        </div>
                        <div className="bubble">
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="message assistant">
                        <div className="avatar"><Bot size={18} /></div>
                        <div className="bubble loading">
                            <Loader2 size={16} className="spin" /> Thinking...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className="input-area glass-panel" onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Describe your site..."
                    disabled={loading}
                />
                <button type="submit" disabled={loading || !input.trim()}>
                    <Send size={18} />
                </button>
            </form>
        </div>
    )
}
