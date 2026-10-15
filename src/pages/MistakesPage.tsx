import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  RotateCcw,
  BookOpen,
  SkipForward,
  History,
} from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { getCurrentUser } from '@/services/authService';
import {
  getUnresolvedMistakes,
  getResolvedMistakes,
  resolveMistake,
  getAttemptsForQuestion,
} from '@/services/learningService';
import { getQuestionById, getRelatedQuestions } from '@/data/questions';
import { subjectLabels } from '@/data/programs';

export default function MistakesPage() {
  const user = getCurrentUser();
  const [refreshKey, setRefreshKey] = useState(0);
  const [expandedMistake, setExpandedMistake] = useState<string | null>(null);

  if (!user) return null;

  const unresolved = getUnresolvedMistakes(user.id);
  const resolved = getResolvedMistakes(user.id);

  function handleResolve(mistakeId: string) {
    resolveMistake(mistakeId);
    setRefreshKey((k) => k + 1);
  }

  return (
    <AppLayout pageTitle="Hatalar" pageDescription="Yanlış cevapladığın soruları gözden geçir">
      <div className="space-y-6 animate-fade-in" key={refreshKey}>
        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-error-50 text-error-600">
                <XCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{unresolved.length}</p>
                <p className="text-sm text-navy-400">Aktif hata</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success-50 text-success-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{resolved.length}</p>
                <p className="text-sm text-navy-400">Çözülen hata</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Unresolved mistakes */}
        {unresolved.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-navy-900">İncelenmesi Gerekenler</h2>
            {unresolved.map((mistake) => {
              const question = getQuestionById(mistake.questionId);
              if (!question) {
                return (
                  <Card key={mistake.id} padding="md">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-warning-600 shrink-0" />
                      <p className="text-sm text-navy-500">
                        Bu soru artık mevcut değil. (Soru ID: {mistake.questionId})
                      </p>
                      <Button variant="ghost" size="sm" onClick={() => handleResolve(mistake.id)} className="ml-auto">
                        Kapat
                      </Button>
                    </div>
                  </Card>
                );
              }

              const attempts = getAttemptsForQuestion(user.id, mistake.questionId);
              const relatedQuestions = getRelatedQuestions(mistake.questionId, mistake.questionId);
              const isExpanded = expandedMistake === mistake.id;

              return (
                <Card key={mistake.id} padding="md">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-error-50 text-error-600 shrink-0">
                      <XCircle className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge color="brand">{question.concept}</Badge>
                        <span className="text-xs text-navy-400">
                          {subjectLabels[mistake.subject]} · {mistake.topic}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-navy-900 mt-2 leading-relaxed">
                        {question.questionText}
                      </p>
                    </div>
                  </div>

                  {/* Attempt history */}
                  {attempts.length > 1 && (
                    <div className="mb-4">
                      <button
                        onClick={() => setExpandedMistake(isExpanded ? null : mistake.id)}
                        className="flex items-center gap-2 text-xs font-medium text-navy-500 hover:text-navy-700"
                      >
                        <History className="h-3.5 w-3.5" />
                        Bu soruyu {attempts.length} kez denedin — geçmişi {isExpanded ? 'gizle' : 'göster'}
                      </button>
                      {isExpanded && (
                        <div className="mt-3 space-y-2 animate-slide-down">
                          {attempts.map((attempt, idx) => (
                            <div key={attempt.id} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-navy-50">
                              <span className="font-semibold text-navy-400">Deneme {idx + 1}</span>
                              {attempt.isSkipped ? (
                                <Badge color="neutral"><SkipForward className="h-3 w-3" /> Atlandı</Badge>
                              ) : attempt.isCorrect ? (
                                <Badge color="success"><CheckCircle2 className="h-3 w-3" /> Doğru</Badge>
                              ) : (
                                <Badge color="error"><XCircle className="h-3 w-3" /> Yanlış</Badge>
                              )}
                              <span className="text-navy-400 ml-auto">
                                {new Date(attempt.answeredAt).toLocaleDateString('tr-TR', {
                                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                                })}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Explanation */}
                  <div className="rounded-xl bg-navy-50 border border-navy-100 p-4 mb-4">
                    <div className="flex items-start gap-2.5">
                      <Lightbulb className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-navy-700 mb-1">Çözüm Açıklaması</p>
                        <p className="text-sm text-navy-600 leading-relaxed">{question.explanation}</p>
                        <p className="text-sm text-navy-500 mt-2">
                          Doğru cevap: <span className="font-semibold text-navy-700">
                            {String.fromCharCode(65 + question.correctOptionIndex)}) {question.options[question.correctOptionIndex]}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
                    {relatedQuestions.length > 0 ? (
                      <Link to={`/app/practice?subject=${relatedQuestions[0].subject}&topic=${encodeURIComponent(relatedQuestions[0].topic)}`}>
                        <Button variant="outline" size="sm">
                          <RotateCcw className="h-4 w-4" />
                          Benzer Soru Çöz ({relatedQuestions.length})
                        </Button>
                      </Link>
                    ) : (
                      <Link to={`/app/practice?subject=${mistake.subject}&topic=${encodeURIComponent(mistake.topic)}`}>
                        <Button variant="outline" size="sm">
                          <RotateCcw className="h-4 w-4" />
                          Konuyu Tekrar Çöz
                        </Button>
                      </Link>
                    )}
                    <Button variant="primary" size="sm" onClick={() => handleResolve(mistake.id)}>
                      <CheckCircle2 className="h-4 w-4" />
                      Çözdüm, Kapat
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <EmptyState
              icon={<AlertCircle className="h-7 w-7" />}
              title={resolved.length > 0 ? 'Tüm hatalarını çözdün!' : 'Henüz hatan yok'}
              description={
                resolved.length > 0
                  ? 'Harika gidiyorsun. Pratik yapmaya devam ederek başarını koru.'
                  : 'Pratik yapmaya başladığında, yanlış cevapladığın sorular burada listelenecek.'
              }
              action={
                <Link to="/app/practice">
                  <Button variant="primary" size="sm">
                    <BookOpen className="h-4 w-4" />
                    Pratiğe Başla
                  </Button>
                </Link>
              }
            />
          </Card>
        )}

        {/* Resolved mistakes */}
        {resolved.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-navy-900">Çözülen Hatalar</h2>
            <Card padding="sm">
              <div className="space-y-2">
                {resolved.slice(0, 5).map((mistake) => {
                  const question = getQuestionById(mistake.questionId);
                  if (!question) return null;
                  return (
                    <div key={mistake.id} className="flex items-center gap-3 p-3 rounded-xl bg-success-50 border border-success-100">
                      <CheckCircle2 className="h-5 w-5 text-success-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-navy-900 truncate">
                          {subjectLabels[mistake.subject]} · {mistake.topic}
                        </p>
                        <p className="text-xs text-navy-400 truncate">{question.concept}</p>
                      </div>
                      <Badge color="success">Çözüldü</Badge>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
