import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Target,
  Clock,
  TrendingUp,
  BookOpen,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  Info,
  Flame,
  Trophy,
  CalendarCheck,
  FileText,
  GraduationCap,
  Circle,
} from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ProgressRing from '@/components/ui/ProgressRing';
import EmptyState from '@/components/ui/EmptyState';
import { getCurrentUser } from '@/services/authService';
import {
  getRecentSessions,
  getUnresolvedMistakes,
  hasAnyActivity,
} from '@/services/learningService';
import {
  getRecommendations,
  hasInsufficientData,
  getDailyGoalCompletion,
  getStudyHistory,
} from '@/services/recommendationService';
import {
  getTodaysTasks,
  getPendingAssignments,
  getUpcomingExams,
} from '@/services/studyPlanService';
import { getProgram, subjectLabels, subjectIcons } from '@/data/programs';
import { getIcon } from '@/components/ui/IconHelper';

export default function DashboardPage() {
  const user = getCurrentUser();
  if (!user) return null;

  const programInfo = getProgram(user.program);
  const hasActivity = hasAnyActivity(user.id);
  const recentSessions = getRecentSessions(user.id, 3);
  const mistakes = getUnresolvedMistakes(user.id);
  const goalMinutes = user.dailyStudyGoalMinutes;
  const greeting = getGreeting();

  const recommendations = getRecommendations(user.id, user.program);
  const insufficientData = hasInsufficientData(user.id);
  const goalCompletion = getDailyGoalCompletion(user.id, goalMinutes);
  const studyHistory = getStudyHistory(user.id, 5);
  const todaysTasks = getTodaysTasks(user.id);
  const pendingAssignments = getPendingAssignments(user.id);
  const upcomingExams = getUpcomingExams(user.id);

  return (
    <AppLayout
      pageTitle="Panel"
      pageDescription={programInfo ? `${programInfo.name} programı` : undefined}
      actions={
        <Link to="/app/practice">
          <Button variant="primary" size="sm">
            <BookOpen className="h-4 w-4" />
            Pratiğe Başla
          </Button>
        </Link>
      }
    >
      <div className="space-y-6 animate-fade-in">
        {/* Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-navy-900">
              {greeting}, {user.displayName.split(' ')[0]}!
            </h2>
            <p className="text-sm text-navy-500 mt-1">
              {hasActivity
                ? 'Bugün çalışmaya devam etmelisin. İşte durum özetin.'
                : 'Hesabını oluşturdun! İlk pratik sorularını çözmeye başlayalım.'}
            </p>
          </div>
          {user.isDemo && (
            <Badge color="warning">
              <Sparkles className="h-3.5 w-3.5" />
              Demo Hesabı
            </Badge>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Daily goal */}
          <Card>
            <div className="flex items-center gap-4">
              <ProgressRing
                value={goalCompletion.todayMinutes}
                max={goalCompletion.goalMinutes}
                size={72}
                label="Bugün"
                icon={Clock}
              />
              <div>
                <p className="text-sm text-navy-400">Günlük Hedef</p>
                <p className="text-xl font-bold text-navy-900">
                  {goalCompletion.todayMinutes}<span className="text-base text-navy-400">/{goalCompletion.goalMinutes} dk</span>
                </p>
                <p className="text-xs text-navy-400 mt-0.5">
                  {goalCompletion.isComplete
                    ? 'Hedef tamamlandı!'
                    : `${goalCompletion.goalMinutes - goalCompletion.todayMinutes} dk kaldı`}
                </p>
              </div>
            </div>
          </Card>

          {/* Recent sessions count */}
          <Card>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-navy-400">Son Pratikler</p>
                <p className="text-xl font-bold text-navy-900">{recentSessions.length}</p>
                <p className="text-xs text-navy-400 mt-0.5">tamamlanan oturum</p>
              </div>
            </div>
          </Card>

          {/* Open mistakes */}
          <Card>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-error-50 text-error-600">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-navy-400">Aktif Hatalar</p>
                <p className="text-xl font-bold text-navy-900">{mistakes.length}</p>
                <p className="text-xs text-navy-400 mt-0.5">incelenmesi gereken</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Today's tasks, assignments, exams */}
        {(todaysTasks.length > 0 || pendingAssignments.length > 0 || upcomingExams.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Today's tasks */}
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <CalendarCheck className="h-5 w-5 text-brand-600" />
                <h3 className="text-sm font-semibold text-navy-900">Bugünün Görevleri</h3>
                {todaysTasks.length > 0 && <Badge color="brand">{todaysTasks.length}</Badge>}
              </div>
              {todaysTasks.length > 0 ? (
                <div className="space-y-2">
                  {todaysTasks.slice(0, 4).map((task) => (
                    <div key={task.id} className="flex items-center gap-2 text-sm">
                      <Circle className="h-4 w-4 text-navy-300 shrink-0" />
                      <span className="text-navy-700 truncate flex-1">{task.title}</span>
                      {task.subject && <span className="text-xs text-navy-400 shrink-0">{subjectLabels[task.subject]}</span>}
                    </div>
                  ))}
                  {todaysTasks.length > 4 && (
                    <Link to="/app/study-plan" className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                      +{todaysTasks.length - 4} daha
                    </Link>
                  )}
                </div>
              ) : (
                <p className="text-sm text-navy-400">Bugün için görev yok.</p>
              )}
              <Link to="/app/study-plan" className="block mt-3">
                <Button variant="ghost" size="sm" className="w-full">
                  Tüm Planı Gör
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </Card>

            {/* Pending assignments */}
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-navy-600" />
                <h3 className="text-sm font-semibold text-navy-900">Bekleyen Ödevler</h3>
                {pendingAssignments.length > 0 && <Badge color="warning">{pendingAssignments.length}</Badge>}
              </div>
              {pendingAssignments.length > 0 ? (
                <div className="space-y-2">
                  {pendingAssignments.slice(0, 3).map((a) => (
                    <div key={a.id} className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-navy-400 shrink-0" />
                      <span className="text-navy-700 truncate flex-1">{a.title}</span>
                      <span className="text-xs text-navy-400 shrink-0">
                        {new Date(a.dueDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-navy-400">Bekleyen ödev yok.</p>
              )}
            </Card>

            {/* Upcoming exams */}
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="h-5 w-5 text-navy-600" />
                <h3 className="text-sm font-semibold text-navy-900">Yaklaşan Sınavlar</h3>
              </div>
              {upcomingExams.length > 0 ? (
                <div className="space-y-2">
                  {upcomingExams.slice(0, 3).map((exam) => {
                    const daysLeft = Math.ceil((new Date(exam.examDate).getTime() - Date.now()) / 86400000);
                    return (
                      <div key={exam.id} className="flex items-center gap-2 text-sm">
                        <GraduationCap className="h-4 w-4 text-navy-400 shrink-0" />
                        <span className="text-navy-700 truncate flex-1">{exam.title}</span>
                        <Badge color={daysLeft <= 7 ? 'warning' : 'neutral'}>{daysLeft} gün</Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-navy-400">Yaklaşan sınav yok.</p>
              )}
            </Card>
          </div>
        )}

        {/* Daily goal explanation */}
        <div className="flex items-start gap-3 rounded-xl bg-navy-50 border border-navy-100 px-4 py-3">
          <Info className="h-5 w-5 text-navy-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-navy-700 font-medium">Günlük hedef nasıl hesaplanır?</p>
            <p className="text-sm text-navy-500 mt-1 leading-relaxed">
              Günlük hedefin, tamamladığın pratik oturumlarının sürelerine dayanır.
              Bir oturumu tamamladığında, başlangıç ve bitiş zamanı arasındaki fark
              dakika cinsinden hesaplanır ve günün toplamına eklenir.
              Hedefine ulaştığında panelinde kutlama işareti görünür.
              Hedefini profil sayfasından değiştirebilirsin.
            </p>
          </div>
        </div>

        {/* Continue learning CTA */}
        <Card padding="lg" className="bg-navy-950 text-white border-navy-950">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">Çalışmaya devam et</h3>
              <p className="text-sm text-navy-200">
                {hasActivity
                  ? 'Pratik sorularını çözerek ilerlemeni artır.'
                  : 'İlk pratik oturumunu başlat ve öğrenme döngüsünü keşfet.'}
              </p>
            </div>
            <Link to="/app/practice">
              <Button variant="primary" size="lg">
                Pratiğe Başla
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* Personalized recommendations */}
        <Card padding="lg">
          <div className="flex items-center gap-2.5 mb-4">
            <Target className="h-5 w-5 text-brand-600" />
            <h3 className="text-base font-semibold text-navy-900">Sana Özel Öneriler</h3>
          </div>

          {!hasActivity ? (
            <EmptyState
              icon={<Target className="h-7 w-7" />}
              title="Henüz öneri yok"
              description="Pratik yapmaya başladığında, performansına göre hangi konulara odaklanman gerektiğini burada göreceksin."
              action={
                <Link to="/app/practice">
                  <Button variant="primary" size="sm">
                    <BookOpen className="h-4 w-4" />
                    Pratiğe Başla
                  </Button>
                </Link>
              }
            />
          ) : insufficientData && recommendations.length === 0 ? (
            <div className="flex items-start gap-3 rounded-xl bg-brand-50 border border-brand-100 px-4 py-4">
              <Info className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-navy-900 mb-1">Yeterli veri henüz yok</p>
                <p className="text-sm text-navy-600 leading-relaxed">
                  En az 5 soru yanıtladıktan sonra, hangi konularda daha fazla
                  pratiğe ihtiyacın olduğunu belirleyebileceğiz. Şu anda yaptığın
                  pratikler gelecekteki önerilerin temelini oluşturuyor.
                </p>
              </div>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.map((rec) => {
                const Icon = getIcon(subjectIcons[rec.subject] ?? 'book-open');
                return (
                  <div
                    key={rec.id}
                    className="flex flex-col sm:flex-row sm:items-start gap-3 p-4 rounded-xl bg-navy-50 border border-navy-100"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-navy-700 shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-semibold text-navy-900">
                          {subjectLabels[rec.subject]} · {rec.topic}
                        </p>
                        {rec.evidence.type === 'low_accuracy' && (
                          <Badge color="error">
                            <TrendingUp className="h-3 w-3" />
                            Düşük Başarı
                          </Badge>
                        )}
                        {rec.evidence.type === 'unresolved_mistakes' && (
                          <Badge color="warning">
                            <AlertCircle className="h-3 w-3" />
                            Bekleyen Hata
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-navy-600 mb-2">{rec.reason}</p>

                      {/* Evidence */}
                      <div className="flex items-center gap-3 text-xs text-navy-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-success-500" />
                          {rec.evidence.correct} doğru
                        </span>
                        <span className="flex items-center gap-1">
                          <XCircle className="h-3 w-3 text-error-500" />
                          {rec.evidence.incorrect} yanlış
                        </span>
                        <span>
                          Toplam başarı: <span className="font-semibold text-navy-600">%{rec.evidence.accuracy}</span>
                        </span>
                        {rec.evidence.unresolvedCount > 0 && (
                          <span className="flex items-center gap-1 text-warning-600">
                            <AlertCircle className="h-3 w-3" />
                            {rec.evidence.unresolvedCount} bekleyen hata
                          </span>
                        )}
                      </div>
                    </div>
                    <Link to={rec.actionLink} className="shrink-0">
                      <Button variant="outline" size="sm">
                        {rec.actionLabel}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-xl bg-success-50 border border-success-100 px-4 py-4">
              <Trophy className="h-5 w-5 text-success-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-navy-900 mb-1">İyi gidiyorsun!</p>
                <p className="text-sm text-navy-600 leading-relaxed">
                  Çalıştığın konularda belirgin bir zayıflık tespit edilmedi.
                  Yeni konulara geçerek bilgi dağarcığını genişletebilirsin.
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Study history */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-navy-900">Çalışma Geçmişi</h3>
              {studyHistory.length > 0 && (
                <Link to="/app/progress" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
                  Tümünü Gör
                </Link>
              )}
            </div>

            {studyHistory.length > 0 ? (
              <div className="space-y-3">
                {studyHistory.map((session) => {
                  const sessionAnswered = session.correctCount + session.incorrectCount;
                  const sessionAccuracy = sessionAnswered > 0
                    ? Math.round((session.correctCount / sessionAnswered) * 100) : 0;
                  return (
                    <div key={session.id} className="flex items-center gap-3 p-3 rounded-xl bg-navy-50 border border-navy-100">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-navy-700 shrink-0">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-navy-900 truncate">
                          {subjectLabels[session.subject]} · {session.topic}
                        </p>
                        <p className="text-xs text-navy-400">
                          {new Date(session.completedAt ?? '').toLocaleDateString('tr-TR', {
                            day: 'numeric', month: 'long', year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {sessionAccuracy >= 70 ? (
                          <Badge color="success">{sessionAccuracy}%</Badge>
                        ) : sessionAccuracy >= 50 ? (
                          <Badge color="brand">{sessionAccuracy}%</Badge>
                        ) : (
                          <Badge color="error">{sessionAccuracy}%</Badge>
                        )}
                        <span className="text-xs text-navy-400">
                          {session.correctCount}/{session.totalQuestions}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={<BookOpen className="h-7 w-7" />}
                title="Henüz pratik yok"
                description="İlk pratik oturumunu başlatarak öğrenme döngüsünü keşfet."
                action={
                  <Link to="/app/practice">
                    <Button variant="primary" size="sm">
                      <BookOpen className="h-4 w-4" />
                      Pratiğe Başla
                    </Button>
                  </Link>
                }
              />
            )}
          </Card>

          {/* Quick stats */}
          <Card>
            <h3 className="text-base font-semibold text-navy-900 mb-4">Hızlı Bakış</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-navy-50 border border-navy-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-error-50 text-error-600 shrink-0">
                  <XCircle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-navy-900">İncelenmemiş Hata</p>
                  <p className="text-xs text-navy-400">{mistakes.length} soru</p>
                </div>
                {mistakes.length > 0 && (
                  <Link to="/app/mistakes">
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>

              {goalCompletion.isComplete && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-success-50 border border-success-100">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-100 text-success-600 shrink-0">
                    <Flame className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-navy-900">Günlük hedef tamamlandı!</p>
                    <p className="text-xs text-navy-400">Bugün {goalCompletion.todayMinutes} dk çalıştın</p>
                  </div>
                </div>
              )}

              <Link to="/app/progress" className="block">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-navy-50 border border-navy-100 hover:border-navy-200 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 shrink-0">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-navy-900">Detaylı İlerleme</p>
                    <p className="text-xs text-navy-400">İstatistiklerini görüntüle</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-navy-400" />
                </div>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Günaydın';
  if (hour < 18) return 'İyi günler';
  return 'İyi akşamlar';
}
