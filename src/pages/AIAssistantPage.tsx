import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Send, Lightbulb, BookOpen, HelpCircle,
  AlertCircle, Loader2, ArrowRight, Info,
} from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

import { getCurrentUser } from '@/services/authService';
import { getAIChatResponse } from '@/services/geminiService';
import { subjectLabels } from '@/data/programs';
import type { ChatMessage, Subject } from '@/types';
import { storage, storageKeys, generateId } from '@/services/storageService';

function loadChatHistory(): ChatMessage[] {
  return storage.get<ChatMessage[]>(storageKeys.chatHistory) ?? [];
}

function saveChatHistory(messages: ChatMessage[]): void {
  storage.set(storageKeys.chatHistory, messages);
}

const QUICK_PROMPTS = [
  { text: 'Matematikte tam sayıları kısaca anlat', subject: 'matematik' as Subject, topic: 'Tam Sayılar' },
  { text: 'Fizikte vektör nedir?', subject: 'fizik' as Subject, topic: 'Vektörler' },
  { text: 'Biyolojide mitoz ve mayoz farkı nedir?', subject: 'biyoloji' as Subject, topic: 'Hücre Bölünmesi' },
  { text: 'Türk edebiyatında Servet-i Fünun nedir?', subject: 'edebiyat' as Subject, topic: 'Türk Edebiyatı Akımları' },
];

export default function AIAssistantPage() {
  const user = getCurrentUser();
  const [messages, setMessages] = useState<ChatMessage[]>(loadChatHistory());
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | undefined>(undefined);
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!user) return null;

  function updateMessages(newMessages: ChatMessage[]) {
    setMessages(newMessages);
    saveChatHistory(newMessages);
  }

  async function handleSend(text?: string) {
    const messageText = text ?? input.trim();
    if (!messageText || loading) return;

    const userMsg: ChatMessage = {
      id: generateId('chat-'),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    updateMessages(newMessages);
    setInput('');
    setLoading(true);

    const response = await getAIChatResponse(messageText, {
      grade: (user as { grade?: number }).grade,
      subject: selectedSubject,
      topic: selectedTopic,
      studentName: (user as { displayName: string }).displayName,
    }, newMessages);

    const assistantMsg: ChatMessage = {
      id: generateId('chat-'),
      role: 'assistant',
      content: response.content,
      timestamp: new Date().toISOString(),
      isError: response.isError,
    };

    updateMessages([...newMessages, assistantMsg]);
    setLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleClearChat() {
    updateMessages([]);
  }

  return (
    <AppLayout
      pageTitle="AI Öğrenme Asistanı"
      pageDescription="Sorularını sor, konu anlatımı iste, ipucu al"
      actions={
        messages.length > 0 ? (
          <Button variant="ghost" size="sm" onClick={handleClearChat}>
            Sohbeti Temizle
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-6 animate-fade-in">
        {/* Context selector */}
        <Card padding="md">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-navy-600 shrink-0">
              <Info className="h-4 w-4 text-navy-400" />
              <span className="font-medium">Bağlam:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedSubject && (
                <Badge color="brand">
                  {subjectLabels[selectedSubject]}
                  {selectedTopic && ` · ${selectedTopic}`}
                </Badge>
              )}
              <select
                className="text-sm border border-navy-200 rounded-lg px-3 py-1.5 text-navy-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={selectedSubject ?? ''}
                onChange={(e) => {
                  setSelectedSubject(e.target.value ? (e.target.value as Subject) : undefined);
                  setSelectedTopic(undefined);
                }}
              >
                <option value="">Ders seç (opsiyonel)</option>
                {Object.entries(subjectLabels).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Chat area */}
        <Card padding="lg" className="min-h-[400px] flex flex-col">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-navy-900 mb-2">AI Öğrenme Asistanı</h3>
              <p className="text-sm text-navy-400 text-center max-w-md mb-6">
                Sorularını sor, konu anlatımı iste, ipucu al. Asistanın sınıf seviyene uygun yanıt verir.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                {QUICK_PROMPTS.map((qp) => (
                  <button
                    key={qp.text}
                    onClick={() => {
                      setSelectedSubject(qp.subject);
                      setSelectedTopic(qp.topic);
                      handleSend(qp.text);
                    }}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-navy-50 border border-navy-100 hover:border-brand-200 hover:bg-brand-50 transition-colors text-left"
                  >
                    <Lightbulb className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-navy-700">{qp.text}</span>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs text-navy-400">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>AI yanıtları eğitim amaçlıdır. Resmi kaynak yerine geçmez.</span>
              </div>
            </div>
          ) : (
            <div className="flex-1 space-y-4 overflow-y-auto max-h-[500px]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-brand-600 text-white'
                        : msg.isError
                        ? 'bg-error-50 border border-error-100 text-error-700'
                        : 'bg-navy-50 border border-navy-100 text-navy-800'
                    }`}
                  >
                    {msg.role === 'assistant' && !msg.isError && (
                      <div className="flex items-center gap-1.5 mb-1.5 text-xs text-brand-600 font-medium">
                        <Sparkles className="h-3 w-3" />
                        AI Asistan
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-navy-50 border border-navy-100 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2 text-navy-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Düşünüyor...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input area */}
          <div className="mt-4 pt-4 border-t border-navy-100">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Sorunu buraya yaz..."
                rows={1}
                className="flex-1 resize-none rounded-xl border border-navy-200 px-4 py-3 text-sm text-navy-900 placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 max-h-32"
                disabled={loading}
              />
              <Button
                variant="primary"
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/app/practice">
            <Card hover padding="md" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 shrink-0">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-navy-900">Pratik Yap</p>
                <p className="text-xs text-navy-400">Soru çöz ve öğren</p>
              </div>
              <ArrowRight className="h-4 w-4 text-navy-300 ml-auto" />
            </Card>
          </Link>
          <Link to="/app/mistakes">
            <Card hover padding="md" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-error-50 text-error-600 shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-navy-900">Hatalarım</p>
                <p className="text-xs text-navy-400">Yanlışları incele</p>
              </div>
              <ArrowRight className="h-4 w-4 text-navy-300 ml-auto" />
            </Card>
          </Link>
          <Link to="/app/study-plan">
            <Card hover padding="md" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-50 text-success-600 shrink-0">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-navy-900">Çalışma Planı</p>
                <p className="text-xs text-navy-400">Görevlerini yönet</p>
              </div>
              <ArrowRight className="h-4 w-4 text-navy-300 ml-auto" />
            </Card>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
