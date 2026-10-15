import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  Lightbulb,
  BookOpen,
  RotateCcw,
  Trophy,
  ChevronDown,
  SkipForward,
  AlertCircle,
} from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { getCurrentUser } from '@/services/authService';
import { getProgram, subjectLabels, subjectIcons, subjectTopics } from '@/data/programs';
import { getIcon } from '@/components/ui/IconHelper';
import { getQuestionsByTopic } from '@/data/questions';
import { getQuestionsForPractice } from '@/services/questionService';
import {
  createPracticeSession,
  recordAnswer,
  completePracticeSession,
} from '@/services/learningService';
import { getGeminiAvailability } from '@/services/geminiService';
import type { Question } from '@/types';

type Phase = 'select' | 'question' | 'complete';

const difficultyLabels: Record<string, string> = {
  easy: 'Kolay',
  medium: 'Orta',
  hard: 'Zor',
};

const difficultyColors: Record<string, 'success' | 'warning' | 'error'> = {
  easy: 'success',
  medium: 'warning',
  hard: 'error',
};

export default function PracticePage() {
  const user = getCurrentUser();
  const [searchParams] = useSearchParams();
  const preselectedSubject = searchParams.get('subject') as string | null;
  const preselectedTopic = searchParams.get('topic');

  const [phase, setPhase] = useState<Phase>('select');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(preselectedSubject);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(preselectedTopic);
  const [openSubject, setOpenSubject] = useState<string | null>(preselectedSubject);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const programInfo = user ? getProgram(user.program) : null;
  const programSubjects = programInfo?.subjects ?? [];
  const availableTopics = subjectTopics.filter((t) => programSubjects.includes(t.subject));

  const groupedBySubject = useMemo(() => {
    return availableTopics.reduce(
      (acc, topic) => {
        if (!acc[topic.subject]) acc[topic.subject] = [];
        acc[topic.subject].push(topic);
        return acc;
      },
      {} as Record<string, typeof availableTopics>
    );
  }, [availableTopics]);

  if (!user) return null;

  function startPractice(subject: string, topic: string) {
    const qs = getQuestionsForPractice(subject as Question['subject'], topic, 5);
    if (qs.length === 0) return;

    const session = createPracticeSession(user!.id, subject as Question['subject'], topic, qs.map((q) => q.id));
    setQuestions(qs);
    setSelectedSubject(subject);
    setSelectedTopic(topic);
    setSessionId(session.id);
    setCurrentIndex(0);
    setSelectedOption(null);
    setSubmitted(false);
    setCorrectCount(0);
    setIncorrectCount(0);
    setSkippedCount(0);
    setPhase('question');
  }

  function handleSubmit() {
    if (submitted || selectedOption === null || !sessionId) return;
    setSubmitted(true);

    const question = questions[currentIndex];
    const answer = recordAnswer(user!.id, question.id, selectedOption, sessionId);
    if (answer.isCorrect) {
      setCorrectCount((c) => c + 1);
    } else {
      setIncorrectCount((c) => c + 1);
    }
  }

  function handleSkip() {
    if (submitted || !sessionId) return;
    setSubmitted(true);
    setSelectedOption(null);

    const question = questions[currentIndex];
    recordAnswer(user!.id, question.id, null, sessionId);
    setSkippedCount((c) => c + 1);
  }

  function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setSubmitted(false);
    } else {
      if (sessionId) {
        completePracticeSession(sessionId, correctCount, incorrectCount, skippedCount);
      }
      setPhase('complete');
    }
  }

  function restart() {
    setPhase('select');
    setSelectedSubject(null);
    setSelectedTopic(null);
    setQuestions([]);
    setSessionId(null);
  }

  // Phase: select
  if (phase === 'select') {
    return (
      <AppLayout pageTitle="Pratik" pageDescription="Bir konu seç ve pratiğe başla">
        <div className="space-y-6 animate-fade-in">
          {Object.keys(groupedBySubject).length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <BookOpen className="h-10 w-10 text-navy-300 mx-auto mb-3" />
                <p className="text-sm text-navy-500">Programın için pratik konuları hazırlanıyor.</p>
              </div>
            </Card>
          ) : (
            Object.entries(groupedBySubject).map(([subject, topics]) => {
              const Icon = getIcon(subjectIcons[subject as keyof typeof subjectIcons] ?? 'book-open');
              const isOpen = openSubject === subject;
              return (
                <div key={subject}>
                  <button
                    onClick={() => setOpenSubject(isOpen ? null : subject)}
                    className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl border border-navy-100 shadow-card hover:border-navy-200 transition-colors"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-white shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <h2 className="text-base font-semibold text-navy-900">
                        {subjectLabels[subject as keyof typeof subjectLabels]}
                      </h2>
                      <p className="text-sm text-navy-400">{topics.length} konu</p>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-navy-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-down">
                      {topics.map((topic) => {
                        const qCount = getQuestionsByTopic(topic.subject, topic.topic).length;
                        return (
                          <Card key={`${topic.subject}-${topic.topic}`} hover className="flex flex-col">
                            <h3 className="text-base font-semibold text-navy-900 mb-1.5">{topic.topic}</h3>
                            <p className="text-sm text-navy-500 leading-relaxed mb-4 flex-1">{topic.description}</p>
                            <div className="flex items-center justify-between">
                              <Badge color="neutral">{qCount} soru</Badge>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => startPractice(topic.subject, topic.topic)}
                                disabled={qCount === 0}
                              >
                                Başla
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </AppLayout>
    );
  }

  // Phase: question
  if (phase === 'question') {
    const question = questions[currentIndex];
    const isCorrect = submitted && selectedOption === question.correctOptionIndex;
    const isSkipped = submitted && selectedOption === null;
    const selectedMisconception =
      submitted && selectedOption !== null && question.optionExplanations
        ? question.optionExplanations[selectedOption]
        : null;

    return (
      <AppLayout
        pageTitle="Pratik"
        pageDescription={`${subjectLabels[question.subject]} · ${question.topic}`}
      >
        <div className="max-w-2xl mx-auto animate-fade-in">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-navy-600">
                Soru {currentIndex + 1} / {questions.length}
              </span>
              <div className="flex items-center gap-2">
                {correctCount > 0 && <Badge color="success"><CheckCircle2 className="h-3 w-3" /> {correctCount}</Badge>}
                {incorrectCount > 0 && <Badge color="error"><XCircle className="h-3 w-3" /> {incorrectCount}</Badge>}
                {skippedCount > 0 && <Badge color="neutral"><SkipForward className="h-3 w-3" /> {skippedCount}</Badge>}
              </div>
            </div>
            <div className="h-2 rounded-full bg-navy-100 overflow-hidden">
              <div
                className="h-full bg-brand-600 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + (submitted ? 1 : 0)) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <Card padding="lg">
            <div className="flex items-center gap-2 mb-4">
              <Badge color="brand">{question.concept}</Badge>
              <Badge color={difficultyColors[question.difficulty]}>
                {difficultyLabels[question.difficulty]}
              </Badge>
            </div>
            <h2 className="text-lg font-semibold text-navy-900 leading-relaxed mb-6">
              {question.questionText}
            </h2>

            <div className="space-y-3">
              {question.options.map((option, index) => {
                const isSelected = selectedOption === index;
                const isCorrectOption = index === question.correctOptionIndex;

                let stateClass = 'border-navy-200 hover:border-navy-300 hover:bg-navy-50';
                if (submitted) {
                  if (isCorrectOption) {
                    stateClass = 'border-success-500 bg-success-50';
                  } else if (isSelected && !isCorrectOption) {
                    stateClass = 'border-error-500 bg-error-50';
                  } else {
                    stateClass = 'border-navy-100 opacity-60';
                  }
                } else if (isSelected) {
                  stateClass = 'border-brand-500 bg-brand-50';
                }

                return (
                  <button
                    key={index}
                    onClick={() => !submitted && setSelectedOption(index)}
                    disabled={submitted}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${stateClass} ${
                      !submitted ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full shrink-0 text-sm font-semibold ${
                      submitted && isCorrectOption
                        ? 'bg-success-600 text-white'
                        : submitted && isSelected && !isCorrectOption
                        ? 'bg-error-600 text-white'
                        : isSelected
                        ? 'bg-brand-600 text-white'
                        : 'bg-navy-100 text-navy-500'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-sm text-navy-900 flex-1">{option}</span>
                    {submitted && isCorrectOption && <CheckCircle2 className="h-5 w-5 text-success-600 shrink-0" />}
                    {submitted && isSelected && !isCorrectOption && <XCircle className="h-5 w-5 text-error-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Action buttons before submission */}
            {!submitted && (
              <div className="mt-6 flex items-center justify-between gap-3">
                <Button variant="ghost" size="md" onClick={handleSkip} disabled={!sessionId}>
                  <SkipForward className="h-4 w-4" />
                  Atla
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={selectedOption === null || !sessionId}
                >
                  Cevabı Gönder
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Feedback after submission */}
            {submitted && (
              <div className="mt-6 animate-slide-down">
                <div className={`rounded-xl p-4 border ${
                  isCorrect ? 'bg-success-50 border-success-100'
                  : isSkipped ? 'bg-navy-50 border-navy-200'
                  : 'bg-error-50 border-error-100'
                }`}>
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-success-600 shrink-0 mt-0.5" />
                    ) : isSkipped ? (
                      <SkipForward className="h-5 w-5 text-navy-400 shrink-0 mt-0.5" />
                    ) : (
                      <Lightbulb className="h-5 w-5 text-error-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm font-semibold mb-1 ${
                        isCorrect ? 'text-success-700'
                        : isSkipped ? 'text-navy-600'
                        : 'text-error-700'
                      }`}>
                        {isCorrect ? 'Doğru cevap!' : isSkipped ? 'Soru atlandı' : 'Yanlış cevap'}
                      </p>

                      {isSkipped && (
                        <p className="text-sm text-navy-500 mb-2">
                          Bu soruyu atladın. Doğru cevap aşağıda.
                        </p>
                      )}

                      {/* Misconception explanation for the selected wrong option */}
                      {!isCorrect && !isSkipped && selectedMisconception && (
                        <div className="mb-3 rounded-lg bg-white/60 p-3 border border-error-100">
                          <p className="text-xs font-semibold text-error-600 mb-1">
                            Seçtiğin şık için açıklama:
                          </p>
                          <p className="text-sm text-navy-600 leading-relaxed">{selectedMisconception}</p>
                        </div>
                      )}

                      {/* General explanation */}
                      <p className="text-sm text-navy-600 leading-relaxed">{question.explanation}</p>

                      {!isCorrect && (
                        <p className="text-sm text-navy-500 mt-2">
                          Doğru cevap: <span className="font-semibold text-navy-700">
                            {String.fromCharCode(65 + question.correctOptionIndex)}) {question.options[question.correctOptionIndex]}
                          </span>
                        </p>
                      )}

                      {/* AI explanation availability notice */}
                      {submitted && !isCorrect && !getGeminiAvailability().available && (
                        <p className="text-xs text-navy-400 mt-3 pt-3 border-t border-navy-100">
                          Bu açıklama Kubik soru bankasındaki doğrulanmış içerikten alınmıştır.
                          Ek açıklama desteği için sunucu tarafı altyapı gereklidir.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button variant="primary" onClick={handleNext}>
                    {currentIndex < questions.length - 1 ? 'Sonraki Soru' : 'Bitir'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </AppLayout>
    );
  }

  // Phase: complete
  if (phase === 'complete') {
    const answered = correctCount + incorrectCount;
    const percentage = answered > 0 ? Math.round((correctCount / answered) * 100) : 0;

    return (
      <AppLayout pageTitle="Pratik" pageDescription="Oturum tamamlandı">
        <div className="max-w-2xl mx-auto animate-fade-in">
          <Card padding="lg">
            <div className="text-center py-6">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 mb-4">
                <Trophy className="h-10 w-10 text-brand-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy-900 mb-2">Pratik tamamlandı!</h2>
              <p className="text-sm text-navy-500 mb-6">
                {selectedSubject && selectedTopic && `${subjectLabels[selectedSubject as keyof typeof subjectLabels]} · ${selectedTopic}`}
              </p>

              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-success-600">{correctCount}</p>
                  <p className="text-xs text-navy-400 mt-1">Doğru</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-error-600">{incorrectCount}</p>
                  <p className="text-xs text-navy-400 mt-1">Yanlış</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-navy-400">{skippedCount}</p>
                  <p className="text-xs text-navy-400 mt-1">Atlandı</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-navy-900">{percentage}%</p>
                  <p className="text-xs text-navy-400 mt-1">Başarı</p>
                </div>
              </div>

              <p className="text-xs text-navy-400 mb-6">
                Başarı oranı, yanıtlanan sorular ({answered}) üzerinden hesaplanmıştır. Atlanan sorular dahil edilmemiştir.
              </p>

              {incorrectCount > 0 && (
                <div className="rounded-xl bg-warning-50 border border-warning-100 px-4 py-3 mb-6 text-left">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="h-5 w-5 text-warning-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-warning-700">
                      {incorrectCount} soruyu yanlış cevapladın. Bu sorular hatalar listene eklendi.
                      Hatalarını gözden geçirerek aynı hataları tekrar yapmamayı öğren.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" onClick={restart}>
                  <RotateCcw className="h-4 w-4" />
                  Yeni Pratik
                </Button>
                {incorrectCount > 0 && (
                  <Link to="/app/mistakes">
                    <Button variant="primary">
                      Hataları İncele
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
                <Link to="/app">
                  <Button variant="ghost">
                    Panele Dön
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return null;
}
