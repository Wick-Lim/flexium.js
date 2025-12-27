"use client";

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { ChatInterface } from '@/components/ChatInterface'
import { PreviewPane } from '@/components/PreviewPane'
import './App.css'

export default function Home() {
  const [componentBody, setComponentBody] = useState<string>('');

  const handleCodeGenerated = (newBody: string) => {
    setComponentBody(newBody);
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header glass-panel">
        <div className="logo">
          <Sparkles className="text-accent" size={24} />
          <h1 className="logo-text">Lumina</h1>
        </div>
        <div className="actions">
          {/* Future: User profile, settings */}
        </div>
      </header>

      {/* Main Content: Split View */}
      <main className="main-layout">
        <div className="panel left-panel">
          <ChatInterface onCodeGenerated={handleCodeGenerated} />
        </div>
        <div className="panel right-panel">
          <PreviewPane componentBody={componentBody} />
        </div>
      </main>
    </div>
  )
}
