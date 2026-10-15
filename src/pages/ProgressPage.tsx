import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Target,
  Award,
  BookOpen,
  Clock,
  SkipForward,
  Info,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

import EmptyState from '@/components/ui/EmptyState';
import ProgressRing from '@/components/ui/ProgressRing';
import { getCurrentUser } from '@/services/authService';
import { getProgress, getRecentSessions, getTodayStudyMinutes } from '@/services/learningService';
import { getTopicMastery, masteryLevelLabels, masteryLevelColors, getMasterySummary } from '@/services/masteryService';
import { subjectLabels, subjectIcons } from '@/data/programs';
import { getIcon } from '@/components/ui/IconHelper';
import Badge from '@/components/ui/Badge';
import type { Subject, MasteryLevel } from '@/types';

export default function ProgressPage() {
  const user = getCurrentUser();
  const [masteryFilter, setMasteryFilter] = useState<MasteryLevel | 'all'>('all');

  if (!user) return null;

  const progress = getProgress(user.id);
  const recentSessions = getRecentSessions(user.id, 10);
  const todayMinutes = getTodayStudyMinutes(user.id);
  const hasData = progress.totalAttempts > 0;
  const masteryRecords = getTopicMastery(user.id);
  const masterySummary = getMasterySummary(user.id);

  const answered = progress.totalCorrect + progress.totalIncorrect;
  const accuracy = answered > 0 ? Math.round((progress.totalCorrect / answered) * 100) : 0;

  const subjectEntries = Object.entries(progress.subjectStats)
    .map(([key, stats]) => {
      const subjectAnswered = stats.correct + stats.incorrect;
      return {
        subject: key as Subject,
        attempts: stats.attempts,
        correct: stats.correct,
        skipped: stats.skipped,
        accuracy: subjectAnswered > 0 ? Math.round((stats.correct / subjectAnswered) * 100) : 0,
      };
    })
    .sort((a, b) => b.attempts - a.attempts);

  // Last 7 days study minutes
  const last7Days: { date: string; label: string; minutes: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    last7Days.push({
      date: dateStr,
      label: d.toLocaleDateString('tr-TR', { weekday: 'short' }),
      minutes: progress.studyMinutesByDay[dateStr] ?? 0,
    });
  }
  const maxMinutes = Math.max(...last7Days.map((d) => d.minutes), 1);

  return (
    <AppLayout pageTitle="İlerleme" pageDescription="Çalışma istatistiklerin ve gelişimin">
      <div className="space-y-6 animate-fade-in">
        {!hasData ? (
          <Card>
            <EmptyState
              icon={<TrendingUp className="h-7 w-7" />}
              title="Henüz veri yok"
              description="Pratik yapmaya başladığında, ilerlemen ve istatistiklerin burada görünecek."
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
        ) : (
          <>
            {/* Early stats warning */}
            {progress.uniqueQuestionsAttempted < 10 && (
              <div className="flex items-start gap-3 rounded-xl bg-brand-50 border border-brand-100 px-4 py-3">
                <Info className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
                <p className="text-sm text-brand-700">
                  Henüz çalışmanın başındasın. İstatistikler sınırlı pratik verisine dayandığı için
                  şu anki başarı oranın genel bir fikir verebilir, ancak daha fazla pratik yaptıkça
                  daha doğru bir resim oluşacak.
                </p>
              </div>
            )}

            {/* Overview stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <div className="flex items-center gap-4">
                  <ProgressRing value={progress.totalCorrect} max={answered} size={72} label="Başarı" />
                  <div>
                    <p className="text-sm text-navy-400">Genel Başarı</p>
                    <p className="text-2xl font-bold text-navy-900">{accuracy}%</p>
                    <p className="text-xs text-navy-400 mt-0.5">{progress.totalCorrect}/{answered} doğru</p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                    <Target className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-navy-400">Farklı Soru</p>
                    <p className="text-2xl font-bold text-navy-900">{progress.uniqueQuestionsAttempted}</p>
                    <p className="text-xs text-navy-400 mt-0.5">{progress.totalAttempts} deneme</p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success-50 text-success-600">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-navy-400">Doğru</p>
                    <p className="text-2xl font-bold text-navy-900">{progress.totalCorrect}</p>
                    <p className="text-xs text-navy-400 mt-0.5">cevap</p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-100 text-navy-700">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-navy-400">Bugün</p>
                    <p className="text-2xl font-bold text-navy-900">{todayMinutes}<span className="text-base text-navy-400">dk</span></p>
                    <p className="text-xs text-navy-400 mt-0.5">çalışıldı</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Skipped info */}
            {progress.totalSkipped > 0 && (
              <div className="flex items-center gap-2 text-sm text-navy-500">
                <SkipForward className="h-4 w-4 text-navy-400" />
                <span>{progress.totalSkipped} soru atlandı. Atlanan sorular başarı oranına dahil edilmez.</span>
              </div>
            )}

            {/* Study chart */}
            <Card>
              <h3 className="text-base font-semibold text-navy-900 mb-4">Son 7 Gün Çalışma</h3>
              <div className="flex items-end justify-between gap-2 h-40">
                {last7Days.map((day) => (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className="w-full rounded-t-lg bg-brand-500 transition-all duration-500 min-h-[2px]"
                        style={{ height: `${(day.minutes / maxMinutes) * 100}%` }}
                        title={`${day.minutes} dk`}
                      />
                    </div>
                    <span className="text-xs text-navy-400 capitalize">{day.label}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Topic mastery */}
            {masteryRecords.length > 0 && (
              <Card padding="lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <Target className="h-5 w-5 text-brand-600" />
                    <h3 className="text-base font-semibold text-navy-900">Konu Bazlı Uzmanlık</h3>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {masterySummary.mastered > 0 && (
                      <Badge color="success">{masterySummary.mastered} öğrendin</Badge>
                    )}
                    {masterySummary.needsReview > 0 && (
                      <Badge color="error">{masterySummary.needsReview} tekrar gerekli</Badge>
                    )}
                  </div>
                </div>

                {/* Filter buttons */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <FilterButton active={masteryFilter === 'all'} onClick={() => setMasteryFilter('all')} label="Tümü" count={masteryRecords.length} />
                  <FilterButton active={masteryFilter === 'mastered'} onClick={() => setMasteryFilter('mastered')} label="Öğrendin" count={masterySummary.mastered} color="success" />
                  <FilterButton active={masteryFilter === 'practicing'} onClick={() => setMasteryFilter('practicing')} label="Pratik" count={masterySummary.practicing} color="warning" />
                  <FilterButton active={masteryFilter === 'learning'} onClick={() => setMasteryFilter('learning')} label="Öğreniliyor" count={masterySummary.learning} color="brand" />
                  <FilterButton active={masteryFilter === 'needs_review'} onClick={() => setMasteryFilter('needs_review')} label="Tekrar" count={masterySummary.needsReview} color="error" />
                </div>

                <div className="space-y-2">
                  {masteryRecords
                    .filter((r) => masteryFilter === 'all' || r.masteryLevel === masteryFilter)
                    .map((record) => {
                      const Icon = getIcon(subjectIcons[record.subject] ?? 'book-open');
                      return (
                        <div key={`${record.subject}:${record.topic}`} className="flex items-center gap-3 p-3 rounded-xl bg-navy-50 border border-navy-100">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-navy-600 shrink-0">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-navy-900 truncate">
                                {subjectLabels[record.subject]} · {record.topic}
                              </span>
                              <Badge color={masteryLevelColors[record.masteryLevel]}>
                                {masteryLevelLabels[record.masteryLevel]}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-navy-400">
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-success-500" />
                                {record.correct} doğru
                              </span>
                              <span className="flex items-center gap-1">
                                <AlertCircle className="h-3 w-3 text-error-500" />
                                {record.incorrect} yanlış
                              </span>
                              <span>{record.attempts} deneme</span>
                              {!record.hasEnoughData && (
                                <span className="text-navy-400">(yeterli veri yok)</span>
                              )}
                            </div>
                            <div className="h-1.5 rounded-full bg-navy-100 overflow-hidden mt-1.5">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  record.masteryScore >= 70 ? 'bg-success-500' :
                                  record.masteryScore >= 40 ? 'bg-brand-500' : 'bg-error-500'
                                }`}
                                style={{ width: `${record.masteryScore}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Subject performance */}
              <Card>
                <h3 className="text-base font-semibold text-navy-900 mb-4">Ders Bazlı Performans</h3>
                <div className="space-y-3">
                  {subjectEntries.map((entry) => {
                    const Icon = getIcon(subjectIcons[entry.subject] ?? 'book-open');
                    return (
                      <div key={entry.subject} className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 text-navy-600 shrink-0">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-navy-900 truncate">
                              {subjectLabels[entry.subject]}
                            </span>
                            <span className="text-sm font-semibold text-navy-700">{entry.accuracy}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-navy-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                entry.accuracy >= 70 ? 'bg-success-500' : entry.accuracy >= 50 ? 'bg-brand-500' : 'bg-error-500'
                              }`}
                              style={{ width: `${entry.accuracy}%` }}
                            />
                          </div>
                          <p className="text-xs text-navy-400 mt-0.5">
                            {entry.correct} doğru · {entry.attempts - entry.correct - entry.skipped} yanlış
                            {entry.skipped > 0 ? ` · ${entry.skipped} atlandı` : ''}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Recent sessions */}
              <Card>
                <h3 className="text-base font-semibold text-navy-900 mb-4">Son Pratik Oturumları</h3>
                {recentSessions.length > 0 ? (
                  <div className="space-y-2">
                    {recentSessions.map((session) => {
                      const sessionAnswered = session.correctCount + session.incorrectCount;
                      const sessionAccuracy = sessionAnswered > 0
                        ? Math.round((session.correctCount / sessionAnswered) * 100) : 0;
                      return (
                        <div key={session.id} className="flex items-center gap-3 p-3 rounded-xl bg-navy-50 border border-navy-100">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-navy-600 shrink-0">
                            <BookOpen className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-navy-900 truncate">
                              {subjectLabels[session.subject]} · {session.topic}
                            </p>
                            <p className="text-xs text-navy-400">
                              {new Date(session.completedAt ?? '').toLocaleDateString('tr-TR', {
                                day: 'numeric', month: 'short', year: 'numeric',
                              })}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`text-sm font-semibold ${
                              sessionAccuracy >= 70 ? 'text-success-600' : sessionAccuracy >= 50 ? 'text-brand-600' : 'text-error-600'
                            }`}>
                              {sessionAccuracy}%
                            </p>
                            <p className="text-xs text-navy-400">{session.correctCount}/{session.totalQuestions}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-navy-400 text-center py-6">Henüz tamamlanmış oturum yok.</p>
                )}
              </Card>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}

function FilterButton({
  active, onClick, label, count, color = 'neutral',
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  color?: 'neutral' | 'success' | 'warning' | 'brand' | 'error';
}) {
  const colorClasses: Record<string, string> = {
    neutral: active ? 'bg-navy-900 text-white' : 'text-navy-500 hover:bg-navy-100',
    success: active ? 'bg-success-600 text-white' : 'text-success-600 hover:bg-success-50',
    warning: active ? 'bg-warning-600 text-white' : 'text-warning-600 hover:bg-warning-50',
    brand: active ? 'bg-brand-600 text-white' : 'text-brand-600 hover:bg-brand-50',
    error: active ? 'bg-error-600 text-white' : 'text-error-600 hover:bg-error-50',
  };
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${colorClasses[color]}`}
    >
      {label}
      {count > 0 && <span className="opacity-70">({count})</span>}
    </button>
  );
}
