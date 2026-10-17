import type { Question, Subject, AIContext, ChatMessage, GeneratedQuestion } from '@/types';

const SUPABASE_URL = (import.meta.env?.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '');
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY as string | undefined;
// Supabase adresi tanımlıysa doğrudan Edge Function'a gider; değilse (yerel proxy) göreli adres kullanılır.
const EDGE_FUNCTION_URL = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/gemini-ai` : '/functions/v1/gemini-ai';

export interface GeminiExplanationRequest {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  selectedOptionIndex: number | null;
  explanation: string;
  subject: string;
  topic: string;
  grade?: number;
  mode: 'hint' | 'explain' | 'topic' | 'similar_question' | 'chat';
}

export interface GeminiExplanationResult {
  text: string;
  source: 'gemini' | 'authored';
  isGenerated: boolean;
  isHint?: boolean;
}

export interface GeminiAvailability {
  available: boolean;
  reason: string;
}

export function getGeminiAvailability(): GeminiAvailability {
  return {
    available: true,
    reason: '',
  };
}

export function shouldOfferGeminiExplanation(_question: Question): boolean {
  void _question;
  return true;
}

export async function callEdgeFunction(body: Record<string, unknown>, timeoutMs = 20000): Promise<{ ok: boolean; data?: Record<string, unknown>; error?: string; code?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (SUPABASE_ANON_KEY) {
      headers.Authorization = `Bearer ${SUPABASE_ANON_KEY}`;
      headers.apikey = SUPABASE_ANON_KEY;
    }
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const data = await response.json();

    if (!response.ok) {
      return { ok: false, error: data.error ?? 'AI servisi hatası.', code: data.code };
    }

    return { ok: true, data };
  } catch {
    return { ok: false, error: 'AI servisine bağlanılamadı. İnternet bağlantınızı kontrol edin.', code: 'NETWORK_ERROR' };
  } finally {
    clearTimeout(timer);
  }
}

export async function getEnhancedExplanation(
  request: GeminiExplanationRequest
): Promise<GeminiExplanationResult> {
  const result = await callEdgeFunction({
    mode: request.mode,
    questionText: request.questionText,
    options: request.options,
    correctOptionIndex: request.correctOptionIndex,
    selectedOptionIndex: request.selectedOptionIndex,
    subject: request.subject,
    topic: request.topic,
    grade: request.grade,
  });

  if (result.ok && result.data?.content) {
    return {
      text: result.data.content as string,
      source: 'gemini',
      isGenerated: true,
      isHint: request.mode === 'hint',
    };
  }

  return {
    text: request.explanation,
    source: 'authored',
    isGenerated: false,
    isHint: request.mode === 'hint',
  };
}

export async function getAIChatResponse(
  userMessage: string,
  context: AIContext,
  chatHistory: ChatMessage[]
): Promise<{ content: string; isError: boolean }> {
  const result = await callEdgeFunction({
    mode: 'chat',
    userMessage,
    grade: context.grade,
    subject: context.subject,
    topic: context.topic,
    studentName: context.studentName,
    chatHistory: chatHistory
      .filter((m) => !m.isError)
      .slice(-6)
      .map((m) => ({ role: m.role, content: m.content })),
  });

  if (result.ok && result.data?.content) {
    return { content: result.data.content as string, isError: false };
  }

  return {
    content: result.error ?? 'AI asistanı şu anda yanıt veremiyor. Lütfen daha sonra tekrar deneyin.',
    isError: true,
  };
}

export async function getAITopicExplanation(
  subject: Subject,
  topic: string,
  grade?: number
): Promise<{ content: string; isError: boolean }> {
  const result = await callEdgeFunction({
    mode: 'topic',
    subject,
    topic,
    grade,
  });

  if (result.ok && result.data?.content) {
    return { content: result.data.content as string, isError: false };
  }

  return {
    content: result.error ?? 'Konu anlatımı şu anda alınamıyor.',
    isError: true,
  };
}

export async function getAIHint(
  question: Question,
  selectedOptionIndex: number | null,
  grade?: number
): Promise<{ content: string; isError: boolean }> {
  const result = await callEdgeFunction({
    mode: 'hint',
    questionText: question.questionText,
    options: question.options,
    correctOptionIndex: question.correctOptionIndex,
    selectedOptionIndex,
    subject: question.subject,
    topic: question.topic,
    grade,
  });

  if (result.ok && result.data?.content) {
    return { content: result.data.content as string, isError: false };
  }

  return {
    content: result.error ?? 'İpucu alınamıyor.',
    isError: true,
  };
}

export async function getAIFullExplanation(
  question: Question,
  selectedOptionIndex: number | null,
  grade?: number
): Promise<{ content: string; isError: boolean }> {
  const result = await callEdgeFunction({
    mode: 'explain',
    questionText: question.questionText,
    options: question.options,
    correctOptionIndex: question.correctOptionIndex,
    selectedOptionIndex,
    subject: question.subject,
    topic: question.topic,
    grade,
  });

  if (result.ok && result.data?.content) {
    return { content: result.data.content as string, isError: false };
  }

  return {
    content: question.explanation,
    isError: false,
  };
}

export async function generateSimilarQuestion(
  question: Question,
  grade?: number
): Promise<{ question: GeneratedQuestion | null; error?: string }> {
  const result = await callEdgeFunction({
    mode: 'similar_question',
    questionText: question.questionText,
    subject: question.subject,
    topic: question.topic,
    grade,
  });

  if (result.ok && result.data?.question) {
    const q = result.data.question as {
      questionText: string;
      options: string[];
      correctOptionIndex: number;
      explanation: string;
      concept: string;
    };

    if (
      q.questionText &&
      Array.isArray(q.options) &&
      q.options.length >= 2 &&
      typeof q.correctOptionIndex === 'number' &&
      q.correctOptionIndex >= 0 &&
      q.correctOptionIndex < q.options.length
    ) {
      const generated: GeneratedQuestion = {
        id: `ai-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        subject: question.subject,
        topic: question.topic,
        program: question.program,
        grade: grade ?? question.grade,
        questionType: 'multiple_choice',
        difficulty: question.difficulty,
        questionText: q.questionText,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex,
        explanation: q.explanation ?? '',
        concept: q.concept ?? question.concept,
        source: 'ai_generated',
        validationStatus: 'ai_validated',
        generatedAt: new Date().toISOString(),
      };
      return { question: generated };
    }
  }

  return {
    question: null,
    error: result.error ?? 'Soru üretilemedi.',
  };
}
